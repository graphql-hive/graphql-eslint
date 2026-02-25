import { DocumentNode, Token, TokenKind } from 'graphql';
import { GraphQLESTreeNode } from '../../estree-converter/index.js';
import { GraphQLESLintRule } from '../../types.js';
import { getNodeName } from '../../utils.js';

export const RULE_ID = 'HASHTAG_COMMENT';

export const rule: GraphQLESLintRule = {
  meta: {
    type: 'suggestion',
    hasSuggestions: true,
    schema: [],
    messages: {
      [RULE_ID]:
        'Unexpected GraphQL descriptions as hashtag `#` for {{ nodeName }}.\nPrefer using `"""` for multiline, or `"` for a single line description.',
    },
    docs: {
      description:
        'Requires to use `"""` or `"` for adding a GraphQL description instead of `#`.\nAllows to use hashtag for comments, as long as it\'s not attached to an AST definition.',
      category: 'Schema',
      url: 'https://the-guild.dev/graphql/eslint/rules/no-hashtag-description',
      examples: [
        {
          title: 'Incorrect',
          code: /* GraphQL */ `
            # Represents a user
            type User {
              id: ID!
              name: String
            }
          `,
        },
        {
          title: 'Correct',
          code: /* GraphQL */ `
            " Represents a user "
            type User {
              id: ID!
              name: String
            }
          `,
        },
        {
          title: 'Correct',
          code: /* GraphQL */ `
            # This file defines the basic User type.
            # This comment is valid because it's not attached specifically to an AST object.

            " Represents a user "
            type User {
              id: ID! # This one is also valid, since it comes after the AST object
              name: String
            }
          `,
        },
      ],
      recommended: true,
    },
  },
  create(context) {
    const selector = 'Document[definitions.0.kind!=/^(OperationDefinition|FragmentDefinition)$/]';
    return {
      [selector](node: GraphQLESTreeNode<DocumentNode>) {
        const rawNode = node.rawNode();
        let token: Token = rawNode.loc!.startToken;

        while (token) {
          const { kind, prev, next, value, line, column } = token;
          if (kind === TokenKind.COMMENT && prev && next) {
            const isEslintComment = value.trimStart().startsWith('eslint');
            const linesAfter = next.line - line;
            if (
              !isEslintComment &&
              line !== prev.line &&
              next.kind === TokenKind.NAME &&
              linesAfter < 2
            ) {
              const sourceCode = context.sourceCode ?? context.getSourceCode();
              const { tokens } = sourceCode.ast;

              const t = tokens.find(
                token =>
                  token.loc.start.line === next.line && token.loc.start.column === next.column - 1,
              )!;
              const nextNode = sourceCode.getNodeByRangeIndex(t.range[1] + 1)!;

              context.report({
                messageId: RULE_ID,
                data: {
                  nodeName: getNodeName(
                    'name' in nextNode ? (nextNode as any) : (nextNode as any).parent,
                  ),
                },
                loc: {
                  line,
                  column: column - 1,
                },
                suggest: ['"""', '"'].map(descriptionSyntax => ({
                  desc: `Replace with \`${descriptionSyntax}\` description syntax`,
                  fix: fixer =>
                    fixer.replaceTextRange(
                      [token.start, token.end] as [number, number],
                      [descriptionSyntax, value.trim(), descriptionSyntax].join(''),
                    ),
                })),
              });
            }
          }
          if (!next) {
            break;
          }
          token = next;
        }
      },
    };
  },
};
