import { ASTKindToNode, Kind, TokenKind } from 'graphql';
import { FromSchema } from 'json-schema-to-ts';
import { getRootTypeNames } from '@graphql-tools/utils';
import { GraphQLESTreeNode } from '../../estree-converter/index.js';
import { GraphQLESLintRule, ValueOf } from '../../types.js';
import {
  ARRAY_DEFAULT_OPTIONS,
  eslintSelectorsTip,
  getLocation,
  getNodeName,
  requireGraphQLSchema,
  TYPES_KINDS,
} from '../../utils.js';

export const RULE_ID = 'require-description';

const ALLOWED_KINDS = [
  ...TYPES_KINDS,
  Kind.DIRECTIVE_DEFINITION,
  Kind.FIELD_DEFINITION,
  Kind.INPUT_VALUE_DEFINITION,
  Kind.ENUM_VALUE_DEFINITION,
  Kind.OPERATION_DEFINITION,
] as const;

type AllowedKind = (typeof ALLOWED_KINDS)[number];
type AllowedKindToNode = Pick<ASTKindToNode, AllowedKind>;
type SelectorNode = GraphQLESTreeNode<ValueOf<AllowedKindToNode>>;

const entries: Record<AllowedKind, { type: 'boolean'; description: string }> = Object.create(null);

for (const kind of [...ALLOWED_KINDS].sort()) {
  let description = `> [!NOTE]
>
> Read more about this kind on [spec.graphql.org](https://spec.graphql.org/October2021/#${kind}).`;
  if (kind === Kind.OPERATION_DEFINITION) {
    description += [
      '',
      '',
      '> [!WARNING]',
      '>',
      '> You must use only comment syntax `#` and not description syntax `"""` or `"`.',
    ].join('\n');
  }
  entries[kind] = { type: 'boolean', description };
}

const schema = {
  type: 'array',
  minItems: 1,
  maxItems: 1,
  items: {
    type: 'object',
    additionalProperties: false,
    minProperties: 1,
    properties: {
      types: {
        type: 'boolean',
        enum: [true],
        description: `Includes:\n${TYPES_KINDS.map(kind => `- \`${kind}\``).join('\n')}`,
      },
      rootField: {
        type: 'boolean',
        enum: [true],
        description: 'Definitions within `Query`, `Mutation`, and `Subscription` root types.',
      },
      ignoredSelectors: {
        ...ARRAY_DEFAULT_OPTIONS,
        description: ['Ignore specific selectors', eslintSelectorsTip].join('\n'),
      },
      ...entries,
    },
  },
} as const;

export type RuleOptions = FromSchema<typeof schema>;

export const rule: GraphQLESLintRule<RuleOptions> = {
  meta: {
    docs: {
      category: 'Schema',
      description: 'Enforce descriptions in type definitions and operations.',
      url: `https://the-guild.dev/graphql/eslint/rules/${RULE_ID}`,
      examples: [
        {
          title: 'Incorrect',
          usage: [{ types: true, FieldDefinition: true }],
          code: /* GraphQL */ `
            type someTypeName {
              name: String
            }
          `,
        },
        {
          title: 'Correct',
          usage: [{ types: true, FieldDefinition: true }],
          code: /* GraphQL */ `
            """
            Some type description
            """
            type someTypeName {
              """
              Name description
              """
              name: String
            }
          `,
        },
        {
          title: 'Correct',
          usage: [{ OperationDefinition: true }],
          code: /* GraphQL */ `
            # Create a new user
            mutation createUser {
              # ...
            }
          `,
        },
        {
          title: 'Correct',
          usage: [{ rootField: true }],
          code: /* GraphQL */ `
            type Mutation {
              "Create a new user"
              createUser: User
            }

            type User {
              name: String
            }
          `,
        },
        {
          title: 'Correct',
          usage: [
            {
              ignoredSelectors: [
                '[type=ObjectTypeDefinition][name.value=PageInfo]',
                '[type=ObjectTypeDefinition][name.value=/(Connection|Edge)$/]',
              ],
            },
          ],
          code: /* GraphQL */ `
            type FriendConnection {
              edges: [FriendEdge]
              pageInfo: PageInfo!
            }
            type FriendEdge {
              cursor: String!
              node: Friend!
            }
            type PageInfo {
              hasPreviousPage: Boolean!
              hasNextPage: Boolean!
              startCursor: String
              endCursor: String
            }
          `,
        },
      ],
      configOptions: [
        {
          types: true,
          [Kind.DIRECTIVE_DEFINITION]: true,
          rootField: true,
        },
      ],
      recommended: true,
    },
    type: 'suggestion',
    messages: {
      [RULE_ID]: 'Description is required for {{ nodeName }}',
    },
    schema,
  },
  create(context) {
    const { types, rootField, ignoredSelectors = [], ...restOptions } = context.options[0] || {};

    const kinds = new Set<string>(types ? TYPES_KINDS : []);
    for (const [kind, isEnabled] of Object.entries(restOptions)) {
      if (isEnabled) {
        kinds.add(kind);
      } else {
        kinds.delete(kind);
      }
    }

    if (rootField) {
      const schema = requireGraphQLSchema(RULE_ID, context);
      const rootTypeNames = getRootTypeNames(schema);
      kinds.add(
        `:matches(ObjectTypeDefinition, ObjectTypeExtension)[name.value=/^(${[
          ...rootTypeNames,
        ].join('|')})$/] > FieldDefinition`,
      );
    }
    let selector = `:matches(${[...kinds]})`;
    for (const str of ignoredSelectors) {
      selector += `:not(${str})`;
    }
    return {
      [selector](node: SelectorNode) {
        let description = '';
        const isOperation = node.kind === Kind.OPERATION_DEFINITION;
        if (isOperation) {
          const rawNode = node.rawNode();
          const { prev, line } = rawNode.loc!.startToken;
          if (prev?.kind === TokenKind.COMMENT) {
            const value = prev.value.trim();
            const linesBefore = line - prev.line;
            if (!value.startsWith('eslint') && linesBefore === 1) {
              description = value;
            }
          }
        } else {
          description = node.description?.value.trim() || '';
        }

        if (description.length === 0) {
          context.report({
            loc: isOperation ? getLocation(node.loc.start, node.operation) : node.name.loc,
            messageId: RULE_ID,
            data: {
              nodeName: getNodeName(node),
            },
          });
        }
      },
    };
  },
};
