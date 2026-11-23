import { Comment } from 'estree';
import {
  ASTVisitor,
  DefinitionNode,
  DocumentNode,
  GraphQLSchema,
  Kind,
  TypeInfo,
  visit,
  visitWithTypeInfo,
} from 'graphql';
import { GraphQLESTreeNode, TypeInformation } from './types.js';
import { convertLocation } from './utils.js';

/**
 * graphql v16 always sets these list fields, graphql v17 leaves them `undefined` when empty.
 * Normalize to graphql v16's shape so ESTree nodes (and therefore rules) behave the same with both
 * versions. `rawNode()` still returns the original, unmodified graphql-js node.
 */
const LIST_FIELDS_BY_KIND: Partial<Record<string, ReadonlyArray<string>>> = {
  [Kind.DIRECTIVE]: ['arguments'],
  [Kind.DIRECTIVE_DEFINITION]: ['arguments'],
  [Kind.ENUM_TYPE_DEFINITION]: ['directives', 'values'],
  [Kind.ENUM_TYPE_EXTENSION]: ['directives', 'values'],
  [Kind.ENUM_VALUE_DEFINITION]: ['directives'],
  [Kind.FIELD]: ['arguments', 'directives'],
  [Kind.FIELD_DEFINITION]: ['arguments', 'directives'],
  [Kind.FRAGMENT_DEFINITION]: ['directives'],
  [Kind.FRAGMENT_SPREAD]: ['directives'],
  [Kind.INLINE_FRAGMENT]: ['directives'],
  [Kind.INPUT_OBJECT_TYPE_DEFINITION]: ['directives', 'fields'],
  [Kind.INPUT_OBJECT_TYPE_EXTENSION]: ['directives', 'fields'],
  [Kind.INPUT_VALUE_DEFINITION]: ['directives'],
  [Kind.INTERFACE_TYPE_DEFINITION]: ['interfaces', 'directives', 'fields'],
  [Kind.INTERFACE_TYPE_EXTENSION]: ['interfaces', 'directives', 'fields'],
  [Kind.OBJECT_TYPE_DEFINITION]: ['interfaces', 'directives', 'fields'],
  [Kind.OBJECT_TYPE_EXTENSION]: ['interfaces', 'directives', 'fields'],
  [Kind.OPERATION_DEFINITION]: ['variableDefinitions', 'directives'],
  [Kind.SCALAR_TYPE_DEFINITION]: ['directives'],
  [Kind.SCALAR_TYPE_EXTENSION]: ['directives'],
  [Kind.SCHEMA_DEFINITION]: ['directives', 'operationTypes'],
  [Kind.SCHEMA_EXTENSION]: ['directives', 'operationTypes'],
  [Kind.UNION_TYPE_DEFINITION]: ['directives', 'types'],
  [Kind.UNION_TYPE_EXTENSION]: ['directives', 'types'],
  [Kind.VARIABLE_DEFINITION]: ['directives'],
};

function normalizeListFields<T extends Record<string, unknown>>(kind: string, node: T): T {
  const listFields = LIST_FIELDS_BY_KIND[kind];
  if (!listFields) {
    return node;
  }
  for (const field of listFields) {
    (node as Record<string, unknown>)[field] ??= [];
  }
  return node;
}

export function convertToESTree<T extends DocumentNode>(node: T, schema?: GraphQLSchema | null) {
  const typeInfo = schema && new TypeInfo(schema);

  const visitor: ASTVisitor = {
    leave(node, key, parent) {
      const leadingComments: Comment[] =
        'description' in node && node.description
          ? [
              {
                type: node.description.block ? 'Block' : 'Line',
                value: node.description.value,
              },
            ]
          : [];

      const calculatedTypeInfo: Record<string, never> | TypeInformation = typeInfo
        ? {
            argument: typeInfo.getArgument(),
            defaultValue: typeInfo.getDefaultValue(),
            directive: typeInfo.getDirective(),
            enumValue: typeInfo.getEnumValue(),
            fieldDef: typeInfo.getFieldDef(),
            inputType: typeInfo.getInputType(),
            parentInputType: typeInfo.getParentInputType(),
            parentType: typeInfo.getParentType(),
            gqlType: typeInfo.getType(),
          }
        : {};

      const rawNode = () => {
        if (parent && key !== undefined) {
          return (parent as any)[key];
        }
        return node.kind === Kind.DOCUMENT
          ? ({
              ...node,
              definitions: node.definitions.map(definition =>
                (definition as unknown as GraphQLESTreeNode<DefinitionNode>).rawNode(),
              ),
            } as DocumentNode)
          : node;
      };

      const commonFields: Omit<GraphQLESTreeNode<typeof node>, 'parent'> = {
        ...node,
        type: node.kind,
        loc: convertLocation(node.loc!),
        range: [node.loc!.start, node.loc!.end],
        leadingComments,
        // Use function to prevent RangeError: Maximum call stack size exceeded
        typeInfo: () => calculatedTypeInfo as any, // Don't know if can fix error
        rawNode,
      };

      return normalizeListFields(
        node.kind,
        'type' in node
          ? {
              ...commonFields,
              gqlType: node.type,
            }
          : commonFields,
      );
    },
  };

  return visit(
    node,
    typeInfo ? visitWithTypeInfo(typeInfo, visitor) : visitor,
  ) as GraphQLESTreeNode<T>;
}
