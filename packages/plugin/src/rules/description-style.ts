import { GraphQLESLintRule } from '../types';
import { getLocation } from '../utils';

type DescriptionStyleRuleConfig = {
  style: 'inline' | 'block';
};

const rule: GraphQLESLintRule<[DescriptionStyleRuleConfig]> = {
  meta: {
    type: 'suggestion',
    docs: {
      examples: [
        {
          title: 'Incorrect',
          usage: [{ style: 'inline' }],
          code: /* GraphQL */ `
            """ Description """
            type someTypeName {
              # ...
            }
          `,
        },
        {
          title: 'Correct',
          usage: [{ style: 'inline' }],
          code: /* GraphQL */ `
            " Description "
            type someTypeName {
              # ...
            }
          `,
        },
      ],
      description: 'Require all comments to follow the same style (either block or inline).',
      category: 'Schema',
      url: 'https://github.com/dotansimha/graphql-eslint/blob/master/docs/rules/description-style.md',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          style: {
            enum: ['block', 'inline'],
            default: 'inline',
          },
        },
      },
    ],
  },
  create(context) {
    const { style } = context.options[0] || { style: 'inline' };
    const wrongDescriptionType = style === 'block' ? 'inline' : 'block';

    return {
      '[description.type="StringValue"]': node => {
        if (node.description.block !== (style === 'block')) {
          context.report({
            loc: getLocation(node.description.loc),
            message: `Unexpected ${wrongDescriptionType} description`,
          });
        }
      },
    };
  },
};

export default rule;
