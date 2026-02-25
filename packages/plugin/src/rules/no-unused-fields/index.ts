import { FieldDefinitionNode, GraphQLSchema, TypeInfo, visit, visitWithTypeInfo } from 'graphql';
import { GraphQLProjectConfig } from 'graphql-config';
import { FromSchema } from 'json-schema-to-ts';
import { ModuleCache } from '../../cache.js';
import { SiblingOperations } from '../../siblings.js';
import { GraphQLESLintRule, GraphQLESTreeNode } from '../../types.js';
import { eslintSelectorsTip, requireGraphQLOperations, requireGraphQLSchema } from '../../utils.js';

const RULE_ID = 'no-unused-fields';

const RELAY_SCHEMA = /* GraphQL */ `
  # Root Query Type
  type Query {
    user: User
  }

  # User Type
  type User {
    id: ID!
    name: String!
    friends(first: Int, after: String): FriendConnection!
  }

  # FriendConnection Type (Relay Connection)
  type FriendConnection {
    edges: [FriendEdge]
    pageInfo: PageInfo!
  }

  # FriendEdge Type
  type FriendEdge {
    cursor: String!
    node: Friend!
  }

  # Friend Type
  type Friend {
    id: ID!
    name: String!
  }

  # PageInfo Type (Relay Pagination)
  type PageInfo {
    hasPreviousPage: Boolean!
    hasNextPage: Boolean!
    startCursor: String
    endCursor: String
  }
`;

const RELAY_QUERY = /* GraphQL */ `
  query {
    user {
      id
      name
      friends(first: 10) {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  }
`;

const RELAY_DEFAULT_IGNORED_FIELD_SELECTORS = [
  '[parent.name.value=PageInfo][name.value=/(endCursor|startCursor|hasNextPage|hasPreviousPage)/]',
  '[parent.name.value=/Edge$/][name.value=cursor]',
  '[parent.name.value=/Connection$/][name.value=pageInfo]',
];

const schema = {
  type: 'array',
  maxItems: 1,
  items: {
    type: 'object',
    additionalProperties: false,
    properties: {
      ignoredFieldSelectors: {
        type: 'array',
        uniqueItems: true,
        minItems: 1,
        description: [
          'Fields that will be ignored and are allowed to be unused.',
          '',
          'E.g. The following selector will ignore all the relay pagination fields for every connection exposed in the schema:',
          '```json',
          JSON.stringify(RELAY_DEFAULT_IGNORED_FIELD_SELECTORS, null, 2),
          '```',
          eslintSelectorsTip,
        ].join('\n'),
        items: {
          type: 'string',
          pattern: '^\\[(.+)]$',
        },
      },
    },
  },
} as const;

export type RuleOptions = FromSchema<typeof schema>;

type UsedFields = Record<string, Set<string>>;

const usedFieldsCache = new ModuleCache<GraphQLProjectConfig['schema'], UsedFields>();

function getUsedFields(schema: GraphQLSchema, operations: SiblingOperations): UsedFields {
  // We don't want cache usedFields on test environment
  // Otherwise usedFields will be same for all tests
  const cachedValue = usedFieldsCache.get(schema);
  if (process.env.NODE_ENV !== 'test' && cachedValue) {
    return cachedValue;
  }
  const usedFields: UsedFields = Object.create(null);
  const typeInfo = new TypeInfo(schema);

  const visitor = visitWithTypeInfo(typeInfo, {
    Field(node): false | void {
      const fieldDef = typeInfo.getFieldDef();
      if (!fieldDef) {
        // skip visiting this node if field is not defined in schema
        return false;
      }
      const parentTypeName = typeInfo.getParentType()!.name;
      const fieldName = node.name.value;

      usedFields[parentTypeName] ??= new Set();
      usedFields[parentTypeName].add(fieldName);
    },
  });

  const allDocuments = [...operations.getOperations(), ...operations.getFragments()];
  for (const { document } of allDocuments) {
    visit(document, visitor);
  }
  usedFieldsCache.set(schema, usedFields);
  return usedFields;
}

export const rule: GraphQLESLintRule<RuleOptions> = {
  meta: {
    messages: {
      [RULE_ID]: 'Field "{{fieldName}}" is unused',
    },
    docs: {
      description: 'Requires all fields to be used at some level by siblings operations.',
      category: 'Schema',
      url: `https://the-guild.dev/graphql/eslint/rules/${RULE_ID}`,
      requiresSiblings: true,
      requiresSchema: true,
      // Requires documents to be set
      isDisabledForAllConfig: true,
      examples: [
        {
          title: 'Incorrect',
          code: /* GraphQL */ `
            type User {
              id: ID!
              name: String
              someUnusedField: String
            }

            type Query {
              me: User
            }

            query {
              me {
                id
                name
              }
            }
          `,
        },
        {
          title: 'Correct',
          code: /* GraphQL */ `
            type User {
              id: ID!
              name: String
            }

            type Query {
              me: User
            }

            query {
              me {
                id
                name
              }
            }
          `,
        },
        {
          title: 'Correct (ignoring fields)',
          usage: [{ ignoredFieldSelectors: RELAY_DEFAULT_IGNORED_FIELD_SELECTORS }],
          code: /* GraphQL */ `
            ### 1️⃣ YOUR SCHEMA
            ${RELAY_SCHEMA}

            ### 2️⃣ YOUR QUERY
            ${RELAY_QUERY}
          `,
        },
      ],
    },
    type: 'suggestion',
    schema,
    hasSuggestions: true,
  },
  create(context) {
    const schema = requireGraphQLSchema(RULE_ID, context);
    const siblingsOperations = requireGraphQLOperations(RULE_ID, context);
    const usedFields = getUsedFields(schema, siblingsOperations);
    const { ignoredFieldSelectors } = context.options[0] || {};
    const selector = (ignoredFieldSelectors || []).reduce(
      (acc, selector) => `${acc}:not(${selector})`,
      'FieldDefinition',
    );
    return {
      [selector](node: GraphQLESTreeNode<FieldDefinitionNode>) {
        const fieldName = node.name.value;
        const parentTypeName = node.parent.name.value;
        const isUsed = usedFields[parentTypeName]?.has(fieldName);
        if (isUsed) {
          return;
        }

        context.report({
          node: node.name,
          messageId: RULE_ID,
          data: { fieldName },
          suggest: [
            {
              desc: `Remove \`${fieldName}\` field`,
              fix(fixer) {
                const sourceCode = (context.sourceCode ?? context.getSourceCode()) as any;
                const tokenBefore = sourceCode.getTokenBefore(node);
                const tokenAfter = sourceCode.getTokenAfter(node);
                const isEmptyType = tokenBefore.type === '{' && tokenAfter.type === '}';
                return fixer.remove((isEmptyType ? node.parent : node) as any);
              },
            },
          ],
        });
      },
    };
  },
};
