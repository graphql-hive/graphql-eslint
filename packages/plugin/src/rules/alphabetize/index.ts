import { AST } from 'eslint';
import { Comment, SourceLocation } from 'estree';
import {
  ASTNode,
  DirectiveDefinitionNode,
  DirectiveNode,
  EnumTypeDefinitionNode,
  EnumTypeExtensionNode,
  FieldDefinitionNode,
  FieldNode,
  InputObjectTypeDefinitionNode,
  InputObjectTypeExtensionNode,
  InterfaceTypeDefinitionNode,
  InterfaceTypeExtensionNode,
  Kind,
  ObjectTypeDefinitionNode,
  ObjectTypeExtensionNode,
  OperationDefinitionNode,
  SelectionSetNode,
} from 'graphql';
import { FromSchema } from 'json-schema-to-ts';
import lowerCase from 'lodash.lowercase';
import { GraphQLESTreeNode } from '../../estree-converter/index.js';
import { GraphQLESLintRule, GraphQLESLintRuleListener } from '../../types.js';
import { ARRAY_DEFAULT_OPTIONS, displayNodeName } from '../../utils.js';

const RULE_ID = 'alphabetize';

const fieldsEnum: (
  | 'InputObjectTypeDefinition'
  | 'InterfaceTypeDefinition'
  | 'ObjectTypeDefinition'
)[] = [
  Kind.OBJECT_TYPE_DEFINITION,
  Kind.INTERFACE_TYPE_DEFINITION,
  Kind.INPUT_OBJECT_TYPE_DEFINITION,
];
const selectionsEnum: ('FragmentDefinition' | 'OperationDefinition')[] = [
  Kind.OPERATION_DEFINITION,
  Kind.FRAGMENT_DEFINITION,
];
const argumentsEnum: ('Directive' | 'DirectiveDefinition' | 'Field' | 'FieldDefinition')[] = [
  Kind.FIELD_DEFINITION,
  Kind.FIELD,
  Kind.DIRECTIVE_DEFINITION,
  Kind.DIRECTIVE,
];

const schema = {
  type: 'array',
  minItems: 1,
  maxItems: 1,
  items: {
    type: 'object',
    additionalProperties: false,
    minProperties: 1,
    properties: {
      fields: {
        ...ARRAY_DEFAULT_OPTIONS,
        items: {
          enum: fieldsEnum,
        },
        description: 'Fields of `type`, `interface`, and `input`.',
      },
      values: {
        type: 'boolean',
        description: 'Values of `enum`.',
      },
      selections: {
        ...ARRAY_DEFAULT_OPTIONS,
        items: {
          enum: selectionsEnum,
        },
        description:
          'Selections of `fragment` and operations `query`, `mutation` and `subscription`.',
      },
      variables: {
        type: 'boolean',
        description: 'Variables of operations `query`, `mutation` and `subscription`.',
      },
      arguments: {
        ...ARRAY_DEFAULT_OPTIONS,
        items: {
          enum: argumentsEnum,
        },
        description: 'Arguments of fields and directives.',
      },
      definitions: {
        type: 'boolean',
        description:
          'Definitions – `type`, `interface`, `enum`, `scalar`, `input`, `union` and `directive`.',
      },
      groups: {
        ...ARRAY_DEFAULT_OPTIONS,
        minItems: 2,
        description: [
          "Order group. Example: `['...', 'id', '*', '{']` where:",
          '- `...` stands for fragment spreads',
          '- `id` stands for field with name `id`',
          '- `*` stands for everything else',
          '- `{` stands for fields `selection set`',
        ].join('\n'),
      },
    },
  },
} as const;

export type RuleOptions = FromSchema<typeof schema>;

export const rule: GraphQLESLintRule<RuleOptions> = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      category: ['Schema', 'Operations'],
      description:
        'Enforce arrange in alphabetical order for type fields, enum values, input object fields, operation selections and more.',
      url: `https://the-guild.dev/graphql/eslint/rules/${RULE_ID}`,
      examples: [
        {
          title: 'Incorrect',
          usage: [{ fields: [Kind.OBJECT_TYPE_DEFINITION] }],
          code: /* GraphQL */ `
            type User {
              password: String
              firstName: String! # should be before "password"
              age: Int # should be before "firstName"
              lastName: String!
            }
          `,
        },
        {
          title: 'Correct',
          usage: [{ fields: [Kind.OBJECT_TYPE_DEFINITION] }],
          code: /* GraphQL */ `
            type User {
              age: Int
              firstName: String!
              lastName: String!
              password: String
            }
          `,
        },
        {
          title: 'Incorrect',
          usage: [{ values: true }],
          code: /* GraphQL */ `
            enum Role {
              SUPER_ADMIN
              ADMIN # should be before "SUPER_ADMIN"
              USER
              GOD # should be before "USER"
            }
          `,
        },
        {
          title: 'Correct',
          usage: [{ values: true }],
          code: /* GraphQL */ `
            enum Role {
              ADMIN
              GOD
              SUPER_ADMIN
              USER
            }
          `,
        },
        {
          title: 'Incorrect',
          usage: [{ selections: [Kind.OPERATION_DEFINITION] }],
          code: /* GraphQL */ `
            query {
              me {
                firstName
                lastName
                email # should be before "lastName"
              }
            }
          `,
        },
        {
          title: 'Correct',
          usage: [{ selections: [Kind.OPERATION_DEFINITION] }],
          code: /* GraphQL */ `
            query {
              me {
                email
                firstName
                lastName
              }
            }
          `,
        },
      ],
      configOptions: {
        schema: [
          {
            definitions: true,
            fields: fieldsEnum,
            values: true,
            arguments: argumentsEnum,
            groups: ['id', '*', 'createdAt', 'updatedAt'],
          },
        ],
        operations: [
          {
            definitions: true,
            selections: selectionsEnum,
            variables: true,
            arguments: [Kind.FIELD, Kind.DIRECTIVE],
            groups: ['...', 'id', '*', '{'],
          },
        ],
      },
    },
    messages: {
      [RULE_ID]: '{{ currNode }} should be before {{ prevNode }}',
    },
    schema,
  },
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    function isNodeAndCommentOnSameLine(node: { loc: SourceLocation }, comment: Comment): boolean {
      return node.loc.end.line === comment.loc!.start.line;
    }

    function getBeforeComments(node: GraphQLESTreeNode<ASTNode>): Comment[] {
      const commentsBefore = sourceCode.getCommentsBefore(node as any);
      if (commentsBefore.length === 0) {
        return [];
      }
      const tokenBefore = sourceCode.getTokenBefore(node as any);
      if (tokenBefore) {
        return commentsBefore.filter(comment => !isNodeAndCommentOnSameLine(tokenBefore, comment));
      }
      const filteredComments = [];
      const nodeLine = node.loc.start.line;
      // Break on comment that not attached to node
      for (let i = commentsBefore.length - 1; i >= 0; i -= 1) {
        const comment = commentsBefore[i];
        if (nodeLine - comment.loc!.start.line - filteredComments.length > 1) {
          break;
        }
        filteredComments.unshift(comment);
      }
      return filteredComments;
    }

    function getRangeWithComments(node: GraphQLESTreeNode<ASTNode>): AST.Range {
      if (node.kind === Kind.VARIABLE) {
        node = node.parent;
      }
      const [firstBeforeComment] = getBeforeComments(node);
      const [firstAfterComment] = sourceCode.getCommentsAfter(node as any);
      const from = firstBeforeComment || node;
      const to =
        firstAfterComment && isNodeAndCommentOnSameLine(node, firstAfterComment)
          ? firstAfterComment
          : node;
      return [from.range![0], to.range![1]];
    }

    function checkNodes(nodes: GraphQLESTreeNode<ASTNode>[] = []) {
      // Starts from 1, ignore nodes.length <= 1
      for (let i = 1; i < nodes.length; i += 1) {
        const currNode = nodes[i];
        const currName = getName(currNode);
        if (!currName) {
          // we don't move unnamed current nodes
          continue;
        }

        const prevNode = nodes[i - 1];
        const prevName = getName(prevNode);
        if (prevName) {
          // Compare with lexicographic order
          const compareResult = prevName.localeCompare(currName);

          const { groups } = opts;
          let shouldSortByGroup = false;

          if (groups?.length) {
            if (!groups.includes('*')) {
              throw new Error('`groups` option should contain `*` string.');
            }
            const indexForPrev = getIndex({ node: prevNode, groups });
            const indexForCurr = getIndex({ node: currNode, groups });

            shouldSortByGroup = indexForPrev - indexForCurr > 0;
            if (indexForPrev < indexForCurr) {
              continue;
            }
          }

          const shouldSort = compareResult === 1;
          if (!shouldSortByGroup && !shouldSort) {
            const isSameName = compareResult === 0;
            if (
              !isSameName ||
              !prevNode.kind.endsWith('Extension') ||
              currNode.kind.endsWith('Extension')
            ) {
              continue;
            }
          }
        }

        context.report({
          // @ts-expect-error can't be undefined
          node: ('alias' in currNode && currNode.alias) || currNode.name,
          messageId: RULE_ID,
          data: {
            currNode: displayNodeName(currNode),
            prevNode: prevName ? displayNodeName(prevNode) : lowerCase(prevNode.kind),
          },
          *fix(fixer) {
            const prevRange = getRangeWithComments(prevNode);
            const currRange = getRangeWithComments(currNode);
            yield fixer.replaceTextRange(
              prevRange,
              sourceCode.getText({ range: currRange } as any),
            );
            yield fixer.replaceTextRange(
              currRange,
              sourceCode.getText({ range: prevRange } as any),
            );
          },
        });
      }
    }

    const opts = context.options[0];
    const fields = new Set(opts.fields ?? []);
    const listeners: GraphQLESLintRuleListener = {};

    const kinds = [
      fields.has(Kind.OBJECT_TYPE_DEFINITION) && [
        Kind.OBJECT_TYPE_DEFINITION,
        Kind.OBJECT_TYPE_EXTENSION,
      ],
      fields.has(Kind.INTERFACE_TYPE_DEFINITION) && [
        Kind.INTERFACE_TYPE_DEFINITION,
        Kind.INTERFACE_TYPE_EXTENSION,
      ],
      fields.has(Kind.INPUT_OBJECT_TYPE_DEFINITION) && [
        Kind.INPUT_OBJECT_TYPE_DEFINITION,
        Kind.INPUT_OBJECT_TYPE_EXTENSION,
      ],
    ]
      .filter(v => !!v)
      .flat();

    const fieldsSelector = kinds.join(',');
    const selectionsSelector = opts.selections?.join(',');
    const argumentsSelector = opts.arguments?.join(',');

    if (fieldsSelector) {
      listeners[fieldsSelector] = (
        node: GraphQLESTreeNode<
          | InputObjectTypeDefinitionNode
          | InputObjectTypeExtensionNode
          | InterfaceTypeDefinitionNode
          | InterfaceTypeExtensionNode
          | ObjectTypeDefinitionNode
          | ObjectTypeExtensionNode
        >,
      ) => {
        checkNodes(node.fields);
      };
    }

    if (opts.values) {
      const enumValuesSelector = [Kind.ENUM_TYPE_DEFINITION, Kind.ENUM_TYPE_EXTENSION].join(',');
      listeners[enumValuesSelector] = (
        node: GraphQLESTreeNode<EnumTypeDefinitionNode | EnumTypeExtensionNode>,
      ) => {
        checkNodes(node.values);
      };
    }

    if (selectionsSelector) {
      listeners[`:matches(${selectionsSelector}) SelectionSet`] = (
        node: GraphQLESTreeNode<SelectionSetNode>,
      ) => {
        checkNodes(node.selections);
      };
    }

    if (opts.variables) {
      listeners.OperationDefinition = (node: GraphQLESTreeNode<OperationDefinitionNode>) => {
        checkNodes(node.variableDefinitions?.map(varDef => varDef.variable));
      };
    }

    if (argumentsSelector) {
      listeners[argumentsSelector] = (
        node: GraphQLESTreeNode<
          DirectiveDefinitionNode | DirectiveNode | FieldDefinitionNode | FieldNode
        >,
      ) => {
        checkNodes(node.arguments);
      };
    }

    if (opts.definitions) {
      listeners.Document = node => {
        checkNodes(node.definitions);
      };
    }

    return listeners;
  },
};

function getIndex({
  node,
  groups,
}: {
  node: GraphQLESTreeNode<ASTNode>;
  groups: string[];
}): number {
  // Try an exact match
  let index = groups.indexOf(getName(node));
  if (index === -1 && 'selectionSet' in node && node.selectionSet) index = groups.indexOf('{');
  // Check for the fragment spread group
  if (index === -1 && node.kind === Kind.FRAGMENT_SPREAD) index = groups.indexOf('...');
  // Check for the catch-all group
  if (index === -1) index = groups.indexOf('*');
  return index;
}

function getName(node: GraphQLESTreeNode<ASTNode>): string {
  return (
    ('alias' in node && node.alias?.value) ||
    //
    ('name' in node && node.name?.value) ||
    ''
  );
}
