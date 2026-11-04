import {
  ConstArgumentNode,
  ConstListValueNode,
  ObjectTypeDefinitionNode,
  TypeExtensionNode,
} from 'graphql';
import { GraphQLESLintRule, GraphQLESTreeNode } from '@/types.js';
import { logger } from '@/utils.js';

const RULE_ID = 'require-scopes-on-types';

export const rule: GraphQLESLintRule = {
  meta: {
    type: 'problem',
    docs: {
      category: 'Schema',
      description: 'Requires the @requiresScopes directive on any Type.',
      url: `https://the-guild.dev/graphql/eslint/rules/${RULE_ID}`,
      examples: [
        {
          title: 'Incorrect',
          code: /* GraphQL */ `
            type InvalidType {
              foo: String
            }
          `,
        },
        {
          title: 'Correct',
          code: /* GraphQL */ `
            type ValidType @requiresScopes(scopes: ["my-scope"]) {
              foo: String
            }
          `,
        },
      ],
    },
    messages: {
      [RULE_ID]: 'All types must have the @requiresScopes directive applied to them.',
    },
    schema: [],
  },
  create(context) {
    function hasRequiresScopesDirective(
      node: GraphQLESTreeNode<ObjectTypeDefinitionNode> | TypeExtensionNode,
    ): boolean {
      if (node.name.value === 'Query' || node.name.value === 'Mutation') {
        return true;
      }
      const directive = (node.directives || []).find(d => d.name.value === 'requiresScopes');

      if (directive) {
        return (directive.arguments || [])
          .filter(a => a.name.value === 'scopes')
          .every(v => (v.value as ConstListValueNode).values.length > 0);
      }

      return false;
    }

    return {
      ObjectTypeDefinition(node) {
        if (!hasRequiresScopesDirective(node)) {
          context.report({
            node: node.name,
            messageId: RULE_ID,
          });
        }
      },
    };
  },
};
