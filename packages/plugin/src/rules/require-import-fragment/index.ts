import path from 'node:path';
import { NameNode } from 'graphql';
import { GraphQLESTreeNode } from '../../estree-converter/index.js';
import { GraphQLESLintRule } from '../../types.js';
import { requireGraphQLOperations, slash } from '../../utils.js';

const RULE_ID = 'require-import-fragment';
const SUGGESTION_ID = 'add-import-expression';

export const rule: GraphQLESLintRule = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Operations',
      description: 'Require fragments to be imported via an import expression.',
      url: `https://the-guild.dev/graphql/eslint/rules/${RULE_ID}`,
      examples: [
        {
          title: 'Incorrect',
          code: /* GraphQL */ `
            query {
              user {
                ...UserFields
              }
            }
          `,
        },
        {
          title: 'Incorrect',
          code: /* GraphQL */ `
            # import 'post-fields.fragment.graphql'
            query {
              user {
                ...UserFields
              }
            }
          `,
        },
        {
          title: 'Incorrect',
          code: /* GraphQL */ `
            # import UserFields from 'post-fields.fragment.graphql'
            query {
              user {
                ...UserFields
              }
            }
          `,
        },
        {
          title: 'Correct',
          code: /* GraphQL */ `
            # import UserFields from 'user-fields.fragment.graphql'
            query {
              user {
                ...UserFields
              }
            }
          `,
        },
      ],
      requiresSiblings: true,
    },
    hasSuggestions: true,
    messages: {
      [RULE_ID]: 'Expected "{{fragmentName}}" fragment to be imported.',
      [SUGGESTION_ID]: 'Add import expression for "{{fragmentName}}".',
    },
    schema: [],
  },
  create(context) {
    const comments = (context.sourceCode ?? context.getSourceCode()).getAllComments();
    const siblings = requireGraphQLOperations(RULE_ID, context);
    const filePath = context.filename;

    return {
      'FragmentSpread > .name'(node: GraphQLESTreeNode<NameNode>) {
        const fragmentName = node.value;
        const fragmentsFromSiblings = siblings.getFragment(fragmentName);
        for (const comment of comments) {
          if (comment.type !== 'Line') continue;

          // 1. could start with extra whitespace
          // 2. match both named/default import
          const isPossibleImported = new RegExp(
            `^\\s*import\\s+(${fragmentName}\\s+from\\s+)?['"]`,
          ).test(comment.value);
          if (!isPossibleImported) continue;

          const extractedImportPath = comment.value.match(/(["'])((?:\1|.)*?)\1/)?.[2];
          if (!extractedImportPath) continue;
          const importPath = path.join(filePath, '..', extractedImportPath);
          const hasInSiblings = fragmentsFromSiblings.some(
            source => source.filePath === importPath,
          );
          if (hasInSiblings) return;
        }
        const fragmentInSameFile = fragmentsFromSiblings.some(
          source => source.filePath === filePath,
        );
        if (fragmentInSameFile) return;
        const suggestedFilePaths = fragmentsFromSiblings.length
          ? fragmentsFromSiblings.map(o =>
              // Use always forward slash for suggested import path
              slash(path.relative(path.dirname(filePath), o.filePath)),
            )
          : ['CHANGE_ME.graphql'];

        context.report({
          node,
          messageId: RULE_ID,
          data: { fragmentName },
          suggest: suggestedFilePaths.map(suggestedPath => ({
            messageId: SUGGESTION_ID,
            data: { fragmentName },
            fix: fixer =>
              fixer.insertTextBeforeRange(
                [0, 0],
                `# import ${fragmentName} from '${suggestedPath}'\n`,
              ),
          })),
        });
      },
    };
  },
};
