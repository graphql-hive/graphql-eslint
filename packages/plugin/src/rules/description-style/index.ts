import { StringValueNode } from 'graphql';
import { FromSchema } from 'json-schema-to-ts';
import { GraphQLESTreeNode } from '../../estree-converter/index.js';
import { GraphQLESLintRule } from '../../types.js';
import { getNodeName } from '../../utils.js';

const schema = {
  type: 'array',
  maxItems: 1,
  items: {
    type: 'object',
    additionalProperties: false,
    minProperties: 1,
    properties: {
      style: {
        enum: ['block', 'inline'],
        default: 'block',
      },
    },
  },
} as const;

export type RuleOptions = FromSchema<typeof schema>;

const isWhitespace = (char: string | undefined): boolean => char === ' ' || char === '\t';

/**
 * Re-encodes the parsed value of an inline description as a block string, so that the escape
 * sequences of the inline form (`\"`, `\n`, `\\`) are not carried over as literal characters and
 * the closing `"""` can never be swallowed by a trailing `"` or `\`.
 */
function toBlockString(value: string): string {
  const escapedValue = value.replace(/"""/g, '\\"""');
  const lines = escapedValue.split(/\r\n|[\n\r]/g);
  const isSingleLine = lines.length === 1;
  const forceLeadingNewLine =
    lines.length > 1 && lines.slice(1).every(line => line.length === 0 || isWhitespace(line[0]));
  const hasTrailingTripleQuotes = escapedValue.endsWith('\\"""');
  const hasTrailingQuote = value.endsWith('"') && !hasTrailingTripleQuotes;
  const hasTrailingSlash = value.endsWith('\\');
  const forceTrailingNewLine = hasTrailingQuote || hasTrailingSlash;
  const printAsMultipleLines =
    !isSingleLine || value.length > 70 || forceTrailingNewLine || forceLeadingNewLine;
  const skipLeadingNewLine = isSingleLine && isWhitespace(value[0]);

  let result = '';
  if ((printAsMultipleLines && !skipLeadingNewLine) || forceLeadingNewLine) {
    result += '\n';
  }
  result += escapedValue;
  if (printAsMultipleLines || forceTrailingNewLine) {
    result += '\n';
  }
  return `"""${result}"""`;
}

/**
 * Re-encodes the raw text of a block string as an inline string: `\"""` is the only escape of a
 * block string, while `"` and `\` must be escaped in an inline string.
 */
function toInlineString(blockText: string): string {
  const content = blockText
    .slice(3, -3)
    .replace(/\\"""/g, '"""')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\s+/g, ' ');
  return `"${content}"`;
}

export const rule: GraphQLESLintRule<RuleOptions> = {
  meta: {
    type: 'suggestion',
    hasSuggestions: true,
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
      url: 'https://the-guild.dev/graphql/eslint/rules/description-style',
      recommended: true,
    },
    schema,
  },
  create(context) {
    const { style = 'block' } = context.options[0] || {};
    const isBlock = style === 'block';
    return {
      [`.description[type=StringValue][block!=${isBlock}]`](
        node: GraphQLESTreeNode<StringValueNode>,
      ) {
        context.report({
          loc: isBlock ? node.loc : node.loc.start,
          message: `Unexpected ${isBlock ? 'inline' : 'block'} description for ${getNodeName(
            (node as any).parent,
          )}`,
          suggest: [
            {
              desc: `Change to ${isBlock ? 'block' : 'inline'} style description`,
              fix(fixer) {
                const { sourceCode } = context;
                const newText = isBlock
                  ? toBlockString(node.value)
                  : toInlineString(sourceCode.getText(node as any));
                return fixer.replaceText(node as any, newText);
              },
            },
          ],
        });
      },
    };
  },
};
