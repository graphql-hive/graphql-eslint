import { Kind, ObjectTypeDefinitionNode } from 'graphql';
import { GraphQLESTreeNode } from '../../estree-converter/index.js';
import { GraphQLESLintRule } from '../../types.js';
import { getNodeName, requireGraphQLSchema } from '../../utils.js';

const RULE_ID = 'require-nullable-result-in-root';

export const rule: GraphQLESLintRule = {
  meta: {
    type: 'suggestion',
    hasSuggestions: true,
    docs: {
      category: 'Schema',
      description: 'Require nullable fields in root types.',
      url: `https://the-guild.dev/graphql/eslint/rules/${RULE_ID}`,
      requiresSchema: true,
      examples: [
        {
          title: 'Incorrect',
          code: /* GraphQL */ `
            type Query {
              user: User!
            }
          `,
        },
        {
          title: 'Correct',
          code: /* GraphQL */ `
            type Query {
              foo: User
              baz: [User]!
              bar: [User!]!
            }
          `,
        },
      ],
    },
    messages: {
      [RULE_ID]: 'Unexpected non-null result {{ resultType }} in {{ rootType }}',
    },
    schema: [],
  },
  create(context) {
    const schema = requireGraphQLSchema(RULE_ID, context);
    const rootTypeNames = new Set(
      [schema.getQueryType(), schema.getMutationType()].filter(v => !!v).map(type => type.name),
    );
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    return {
      'ObjectTypeDefinition,ObjectTypeExtension'(
        node: GraphQLESTreeNode<ObjectTypeDefinitionNode>,
      ) {
        if (!rootTypeNames.has(node.name.value)) return;

        for (const field of node.fields || []) {
          if (
            field.gqlType.type !== Kind.NON_NULL_TYPE ||
            field.gqlType.gqlType.type !== Kind.NAMED_TYPE
          )
            continue;
          const name = field.gqlType.gqlType.name.value;
          const type = schema.getType(name);
          const resultType = type?.astNode ? getNodeName(type.astNode as any) : type?.name;

          context.report({
            node: field.gqlType,
            messageId: RULE_ID,
            data: {
              resultType: resultType || '',
              rootType: getNodeName(node),
            },
            suggest: [
              {
                desc: `Make ${resultType} nullable`,
                fix(fixer) {
                  const text = sourceCode.getText(field.gqlType as any);

                  return fixer.replaceText(field.gqlType as any, text.replace('!', ''));
                },
              },
            ],
          });
        }
      },
    };
  },
};
