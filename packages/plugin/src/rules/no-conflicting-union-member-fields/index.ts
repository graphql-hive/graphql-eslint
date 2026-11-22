import {
  FieldDefinitionNode,
  getNamedType,
  GraphQLOutputType,
  GraphQLSchema,
  GraphQLUnionType,
  isLeafType,
  isListType,
  isNonNullType,
  isUnionType,
  Kind,
} from 'graphql';
import { FromSchema } from 'json-schema-to-ts';
import { GraphQLESTreeNode } from '../../estree-converter/index.js';
import { GraphQLESLintRule } from '../../types.js';
import { requireGraphQLSchema } from '../../utils.js';

const RULE_ID = 'no-conflicting-union-member-fields';

const optionSchema = {
  type: 'array',
  maxItems: 1,
  items: {
    type: 'object',
    additionalProperties: false,
    properties: {
      mode: {
        type: 'string',
        enum: ['strict', 'response-shape'],
        default: 'strict',
        description:
          '`strict` is the default: compare complete named types, list layers and nullability. `response-shape` compares wrappers and scalar or enum leaves, rejects leaf/composite mismatches, and ignores differences between composite names alone.',
      },
    },
  },
} as const;

export type RuleOptions = FromSchema<typeof optionSchema>;
type Mode = NonNullable<RuleOptions[0]>['mode'];

type MemberField = {
  memberName: string;
  type: GraphQLOutputType;
  signature: string;
  hasSourceField: boolean;
};

type IncompatibleField = MemberField & {
  reason: string;
};

type Conflict = {
  unionName: string;
  fieldName: string;
  current: MemberField;
  incompatible: IncompatibleField[];
};

type ConflictsByMemberField = Map<string, Conflict[]>;
type ConflictIndex = {
  byMemberField: ConflictsByMemberField;
  byUnion: Map<string, Conflict[]>;
};

function memberFieldKey(memberName: string, fieldName: string): string {
  return `${memberName}\0${fieldName}`;
}

/** Return the first shape difference; names alone are insufficient for lists and non-null types. */
function conflictingTypes(
  left: GraphQLOutputType,
  right: GraphQLOutputType,
  mode: Mode,
): string | null {
  const leftNonNull = isNonNullType(left);
  const rightNonNull = isNonNullType(right);

  if (leftNonNull !== rightNonNull) {
    return 'different nullability';
  }
  if (leftNonNull && rightNonNull) {
    return conflictingTypes(left.ofType, right.ofType, mode);
  }

  const leftList = isListType(left);
  const rightList = isListType(right);

  if (leftList !== rightList) {
    return 'different list structure';
  }
  if (leftList && rightList) {
    return conflictingTypes(left.ofType, right.ofType, mode);
  }

  const leftNamed = getNamedType(left);
  const rightNamed = getNamedType(right);
  if (leftNamed.name === rightNamed.name) {
    return null;
  }

  if (mode === 'strict') {
    return 'different named return types';
  }

  const leftLeaf = isLeafType(leftNamed);
  const rightLeaf = isLeafType(rightNamed);

  if (leftLeaf && rightLeaf) {
    return 'different leaf return types';
  }
  if (leftLeaf !== rightLeaf) {
    return 'a leaf and a composite return type';
  }

  // Two composite names alone do not force a query-time response-shape error:
  // whether their subfields can merge depends on the client's selection set.
  return null;
}

function fieldsByNameForUnionMembers(schemaUnion: GraphQLUnionType, sourceFields: Set<string>) {
  const byFieldName = new Map<string, MemberField[]>();

  // A member may be repeated in source extensions. Only one resolved object
  // participates in each comparison, regardless of where it was declared.
  const members = new Map(schemaUnion.getTypes().map(member => [member.name, member]));

  for (const member of [...members.values()].sort((a, b) => a.name.localeCompare(b.name))) {
    for (const [fieldName, field] of Object.entries(member.getFields())) {
      const fields = byFieldName.get(fieldName) || [];
      fields.push({
        memberName: member.name,
        type: field.type,
        signature: String(field.type),
        hasSourceField: !!field.astNode && sourceFields.has(memberFieldKey(member.name, fieldName)),
      });
      byFieldName.set(fieldName, fields);
    }
  }

  return byFieldName;
}

function collectConflicts(
  schema: GraphQLSchema,
  mode: Mode,
  sourceFields: Set<string>,
): ConflictIndex {
  const byMemberField: ConflictsByMemberField = new Map();
  const byUnion = new Map<string, Conflict[]>();
  const unions = Object.values(schema.getTypeMap())
    .filter(isUnionType)
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const union of unions) {
    const fieldsByName = fieldsByNameForUnionMembers(union, sourceFields);

    for (const [fieldName, occurrences] of fieldsByName) {
      if (occurrences.length < 2) {
        continue;
      }

      // Each unordered pair is compared once. Prefer the later member as the
      // diagnostic anchor only when its field is present in this document.
      // A remote AST field exists in the schema but cannot be visited here.
      const reportsForField = new Map<string, Conflict>();
      for (let rightIndex = 1; rightIndex < occurrences.length; rightIndex++) {
        const right = occurrences[rightIndex];

        for (let leftIndex = 0; leftIndex < rightIndex; leftIndex++) {
          const left = occurrences[leftIndex];
          const reason = conflictingTypes(left.type, right.type, mode);

          if (!reason) {
            continue;
          }

          const current = right.hasSourceField ? right : left.hasSourceField ? left : right;
          const other = current === right ? left : right;
          let report = reportsForField.get(current.memberName);
          if (!report) {
            report = {
              unionName: union.name,
              fieldName,
              current,
              incompatible: [],
            };
            reportsForField.set(current.memberName, report);
          }
          report.incompatible.push({ ...other, reason });
        }
      }

      for (const report of reportsForField.values()) {
        if (!report.current.hasSourceField) {
          const fallback = byUnion.get(union.name) || [];
          fallback.push(report);
          byUnion.set(union.name, fallback);
          continue;
        }

        const key = memberFieldKey(report.current.memberName, fieldName);
        const conflicts = byMemberField.get(key) || [];
        conflicts.push(report);
        byMemberField.set(key, conflicts);
      }
    }
  }

  return { byMemberField, byUnion };
}

function conflictMessage(conflict: Conflict): string {
  const { current, fieldName, incompatible, unionName } = conflict;
  const others = incompatible
    .map(
      ({ memberName, signature, reason }) =>
        `\`${memberName}.${fieldName}: ${signature}\` (${reason})`,
    )
    .join(', ');

  return `Union \`${unionName}\` has conflicting field \`${fieldName}\`: \`${current.memberName}.${fieldName}: ${current.signature}\` conflicts with ${others}. Rename the field on a conflicting union member to avoid ambiguous selections.`;
}

export const rule: GraphQLESLintRule<RuleOptions> = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Schema',
      description:
        'Reports shared field names with conflicting return types on object members of the same union. The strict mode compares complete types; response-shape mode reports only differences that force a field-merging conflict.',
      url: `https://the-guild.dev/graphql/eslint/rules/${RULE_ID}`,
      requiresSchema: true,
      examples: [
        {
          title: 'Correct (response-shape)',
          usage: [{ mode: 'response-shape' }],
          code: /* GraphQL */ `
            type FirstPayload {
              id: ID
            }
            type SecondPayload {
              id: ID
            }
            type A {
              value: FirstPayload
            }
            type B {
              value: SecondPayload
            }
            union Result = A | B
          `,
        },
        {
          title: 'Incorrect',
          code: /* GraphQL */ `
            type Drn {
              country: String
            }
            type Poem {
              id: Int
            }
            type Novel {
              id: Drn
            }
            union Book = Poem | Novel
          `,
        },
        {
          title: 'Correct',
          code: /* GraphQL */ `
            type Poem {
              id: ID
            }
            type Novel {
              id: ID
            }
            union Book = Poem | Novel
          `,
        },
      ],
    },
    schema: optionSchema,
  },
  create(context) {
    const schema = requireGraphQLSchema(RULE_ID, context);
    const mode = context.options[0]?.mode || 'strict';
    let conflicts: ConflictIndex;

    return {
      Document(node) {
        const sourceFields = new Set<string>();
        for (const definition of node.definitions) {
          if (
            definition.kind === Kind.OBJECT_TYPE_DEFINITION ||
            definition.kind === Kind.OBJECT_TYPE_EXTENSION
          ) {
            for (const field of definition.fields || []) {
              sourceFields.add(memberFieldKey(definition.name.value, field.name.value));
            }
          }
        }
        conflicts = collectConflicts(schema, mode, sourceFields);
      },
      FieldDefinition(node: GraphQLESTreeNode<FieldDefinitionNode>) {
        const { parent } = node;
        if (
          parent.kind !== Kind.OBJECT_TYPE_DEFINITION &&
          parent.kind !== Kind.OBJECT_TYPE_EXTENSION
        ) {
          return;
        }

        const key = memberFieldKey(parent.name.value, node.name.value);
        for (const conflict of conflicts.byMemberField.get(key) || []) {
          context.report({
            node: node.name,
            message: conflictMessage(conflict),
          });
        }
      },
      UnionTypeDefinition(node) {
        for (const conflict of conflicts.byUnion.get(node.name.value) || []) {
          context.report({
            node: node.name,
            message: conflictMessage(conflict),
          });
        }
      },
    };
  },
};
