import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dedent from 'dedent';
// @ts-expect-error -- ignore types
import md from 'json-schema-to-markdown';
import prettier from 'prettier';
import { asArray } from '@graphql-tools/utils';
import { rules } from '../packages/plugin/src/index.js';

const BR = '';
const NBSP = '&nbsp;';
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const RULES_PATH = resolve(__dirname, '..', 'website', 'content', 'rules');

enum Icon {
  SCHEMA = '📄',
  OPERATIONS = '📦',
  GRAPHQL_ESLINT = '🚀',
  GRAPHQL_JS = '🔮',
  FIXABLE = '🔧',
  HAS_SUGGESTIONS = '💡',
  RECOMMENDED = '✅',
}

type Column = {
  name: string;
  align: 'center' | 'right';
};

// @ts-expect-error -- Extend RegExp with a custom toJSON method to print RegEx in examples
RegExp.prototype.toJSON = RegExp.prototype.toString;

function printMarkdownTable(columns: (Column | string)[], dataSource: string[][]): string {
  const headerRow: string[] = [];
  const alignRow: ('-:' | '-' | ':-:')[] = [];

  for (let column of columns) {
    column = typeof column === 'string' ? ({ name: column } as Column) : column;
    headerRow.push(column.name);
    const alignSymbol = column.align === 'center' ? ':-:' : column.align === 'right' ? '-:' : '-';
    alignRow.push(alignSymbol);
  }

  // Canonical GFM shape (leading and trailing pipes): prettier aligns the
  // columns afterwards, and the MDX parser needs no ignore comment for it.
  const printRow = (cells: string[]) => `| ${cells.join(' | ')} |`;
  return [printRow(headerRow), printRow(alignRow), ...dataSource.map(printRow)].join('\n');
}

const MARKDOWN_LINK_RE = /\[(.*?)]\(.*\)/;

async function generateDocs(): Promise<void> {
  const prettierConfigMd = await prettier.resolveConfig('./README.md');

  const result = Object.entries(rules).map(async ([ruleName, rule]) => {
    const frontMatterDescription = rule.meta
      .docs!.description!.replace(/\n.*/g, '')
      .replace(MARKDOWN_LINK_RE, '$1');
    // The website renders the frontmatter `title` as the page heading, so
    // the body starts right after it.
    const blocks: string[] = [
      '---',
      `title: ${JSON.stringify(ruleName)}`,
      `description: ${JSON.stringify(frontMatterDescription)}`,
      '---',
    ];
    const { deprecated, docs, schema, fixable, hasSuggestions } = rule.meta;

    if (deprecated) {
      blocks.push('- ❗ DEPRECATED ❗');
    }
    const categories = asArray(docs.category);
    if (docs.recommended) {
      const configNames = categories.map(
        category => `"plugin:@graphql-eslint/${category.toLowerCase()}-recommended"`,
      );
      blocks.push(
        `${Icon.RECOMMENDED} The \`"extends": ${configNames.join(
          '` and `',
        )}\` property in a configuration file enables this rule.`,
      );
    }
    if (fixable) {
      blocks.push(
        BR,
        `${Icon.FIXABLE} The \`--fix\` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#--fix) can automatically fix some of the problems reported by this rule.`,
      );
    }
    if (hasSuggestions) {
      blocks.push(
        BR,
        `${Icon.HAS_SUGGESTIONS} This rule provides [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions)`,
      );
    }

    const { requiresSchema = false, requiresSiblings = false, graphQLJSRuleName } = docs;

    blocks.push(
      `- Category: \`${categories.join(' & ')}\``,
      `- Rule name: \`@graphql-eslint/${ruleName}\``,
      `- Requires GraphQL Schema: \`${requiresSchema}\` [ℹ️](/docs/usage#providing-graphql-schema-optional)`,
      `- Requires GraphQL Operations: \`${requiresSiblings}\` [ℹ️](/docs/usage#providing-graphql-operations-optional)`,
      BR,
      docs.description,
    );

    if (docs.examples?.length > 0) {
      blocks.push('## Usage Examples');

      for (const { usage, title, code } of docs.examples) {
        const isJsCode = ['gql`', '/* GraphQL */'].some(str => code.includes(str));
        blocks.push(`### ${title}`, '```' + (isJsCode ? 'js' : 'graphql'));

        if (!isJsCode) {
          const options =
            usage?.length > 0
              ? // ESLint RuleTester accept options as array but in eslintrc config we must provide options as object
                (
                  await prettier.format(JSON.stringify(['error', ...usage]), {
                    parser: 'babel',
                    singleQuote: true,
                    printWidth: Infinity,
                  })
                ).replace(';\n', '')
              : "'error'";
          blocks.push(`# eslint @graphql-eslint/${ruleName}: ${options}`, BR);
        }
        blocks.push(dedent(code), '```');
      }
    }

    let jsonSchema = Array.isArray(schema) ? schema[0] : schema;
    if (jsonSchema) {
      jsonSchema =
        jsonSchema.type === 'array'
          ? {
              definitions: jsonSchema.definitions,
              ...jsonSchema.items,
            }
          : jsonSchema;

      blocks.push('## Config Schema', md(jsonSchema, '##'));
    }

    if (docs.whenNotToUseIt) {
      blocks.push('## When Not To Use It', docs.whenNotToUseIt);
    }

    blocks.push('## Resources');

    if (graphQLJSRuleName) {
      blocks.push(
        `- [Rule source](https://github.com/graphql/graphql-js/blob/main/src/validation/rules/${graphQLJSRuleName}.ts)`,
        `- [Test source](https://github.com/graphql/graphql-js/tree/main/src/validation/__tests__/${graphQLJSRuleName}-test.ts)`,
      );
    } else {
      blocks.push(
        `- [Rule source](https://github.com/graphql-hive/graphql-eslint/tree/master/packages/plugin/src/rules/${ruleName}/index.ts)`,
        `- [Test source](https://github.com/graphql-hive/graphql-eslint/tree/master/packages/plugin/src/rules/${ruleName}/index.test.ts)`,
      );
    }
    return {
      path: resolve(RULES_PATH, `${ruleName}.mdx`),
      content: blocks.join('\n'),
    };
  });

  const sortedRules = Object.entries(rules)
    .filter(([, rule]) => !rule.meta.deprecated)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ruleName, rule]) => {
      const link = `[${ruleName}](/rules/${ruleName})`;
      const { docs } = rule.meta;
      let config = '';
      if (ruleName.startsWith('relay-')) {
        config = 'relay';
      } else if (!docs.isDisabledForAllConfig) {
        config = docs.recommended ? 'recommended' : 'all';
      }
      const categoryIcons = asArray(docs.category).map(item => {
        if (item === 'Schema') {
          return Icon.SCHEMA;
        }
        if (item === 'Operations') {
          return Icon.OPERATIONS;
        }
        return '';
      });

      return [
        link,
        docs.description.split('\n')[0],
        config && `![${config}][]`,
        categoryIcons.join(' '),
        docs.graphQLJSRuleName ? Icon.GRAPHQL_JS : Icon.GRAPHQL_ESLINT,
        rule.meta.hasSuggestions ? Icon.HAS_SUGGESTIONS : rule.meta.fixable ? Icon.FIXABLE : '',
      ];
    });

  result.push(
    Promise.resolve({
      path: resolve(RULES_PATH, 'index.mdx'),
      content: [
        '---',
        'title: Overview',
        'description: Every GraphQL-ESLint rule, with the configs that enable it and what it applies to.',
        '---',
        'Each rule has emojis denoting:',
        `- ${Icon.SCHEMA} if the rule applies to schema documents`,
        `- ${Icon.OPERATIONS} if the rule applies to operations`,
        `- ${Icon.GRAPHQL_ESLINT} \`graphql-eslint\` rule`,
        `- ${Icon.GRAPHQL_JS} \`graphql-js\` rule`,
        `- ${Icon.FIXABLE} if some problems reported by the rule are automatically fixable by the \`--fix\` [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) option`,
        `- ${Icon.HAS_SUGGESTIONS} if some problems reported by the rule are manually fixable by editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions)`,
        BR,
        '{/* 🚨 IMPORTANT! Do not manually modify this table. Run: `pnpm generate:docs` */}',
        BR,
        printMarkdownTable(
          [
            `Name${NBSP.repeat(20)}`,
            'Description',
            { name: `${NBSP.repeat(4)}Config${NBSP.repeat(4)}`, align: 'center' },
            { name: `${Icon.SCHEMA}${NBSP}/${NBSP}${Icon.OPERATIONS}`, align: 'center' },
            { name: `${Icon.GRAPHQL_ESLINT}${NBSP}/${NBSP}${Icon.GRAPHQL_JS}`, align: 'center' },
            { name: `${Icon.FIXABLE}${NBSP}/${NBSP}${Icon.HAS_SUGGESTIONS}`, align: 'center' },
          ],
          sortedRules,
        ),
        '[recommended]: https://img.shields.io/badge/-recommended-green.svg',
        '[all]: https://img.shields.io/badge/-all-blue.svg',
        '[relay]: https://img.shields.io/badge/-relay-orange.svg',
      ].join('\n'),
    }),
  );

  for (const r of result) {
    const { path, content } = await r;
    writeFile(
      path,
      await prettier.format(content, {
        parser: 'mdx',
        ...prettierConfigMd,
      }),
    );
  }

  // The sidebar order of the rules section: hand-written pages first, then
  // the rules grouped by category (the website reads it from meta.json).
  const byCategory = (predicate: (categories: string[]) => boolean) =>
    Object.entries(rules)
      .filter(([, rule]) => !rule.meta.deprecated && predicate(asArray(rule.meta.docs.category)))
      .map(([ruleName]) => ruleName)
      .sort((a, b) => a.localeCompare(b));
  const meta = {
    title: 'Rules',
    pages: [
      'index',
      'prettier',
      'deprecated-rules',
      ...byCategory(categories => categories.length > 1),
      ...byCategory(categories => categories.length === 1 && categories[0] === 'Schema'),
      ...byCategory(categories => categories.length === 1 && categories[0] === 'Operations'),
    ],
  };
  await writeFile(resolve(RULES_PATH, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`);

  console.log('✅  Documentation generated');
}

console.time('done');
await generateDocs();
console.timeEnd('done');
