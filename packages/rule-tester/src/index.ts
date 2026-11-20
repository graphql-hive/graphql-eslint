import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AST, RuleTester as ESLintRuleTester, Linter, Rule } from 'eslint';
import { codeFrameColumns } from '@babel/code-frame';
import { GraphQLESLintRule, GraphQLESLintRuleContext } from '../../plugin/src/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

type ValidTestCase<Options = [], ParserOptions = Record<string, never>> = Omit<
  ESLintRuleTester.ValidTestCase,
  'options' | 'parserOptions'
> & {
  options?: Options;
  parserOptions?: ParserOptions;
};

function indentCode(code: string, indent = 4): string {
  return code.replace(/^/gm, ' '.repeat(indent));
}

// A simple version of `SourceCodeFixer.applyFixes`
// https://github.com/eslint/eslint/issues/14936#issuecomment-906746754
function applyFix(code: string, { range, text }: Rule.Fix): string {
  return [code.slice(0, range[0]), text, code.slice(range[1])].join('');
}

// @ts-expect-error -- Extend RegExp with a custom toJSON method
RegExp.prototype.toJSON = RegExp.prototype.toString;

export class RuleTester<ParserOptions> extends ESLintRuleTester {
  fromMockFile(path: string): string {
    return readFileSync(resolve(__dirname, `../../plugin/__tests__/mocks/${path}`), 'utf8');
  }

  // @ts-expect-error -- fix later
  run<Options>(
    ruleId: string,
    // Listener return type is intentionally not inferred: inferring `WithTypeInfo` through the
    // recursive `GraphQLESTreeNode` types is expensive and hits circularity errors with graphql v17
    rule: Pick<GraphQLESLintRule<Options>, 'meta'> & {
      create(context: GraphQLESLintRuleContext<Options>): unknown;
    },
    tests: {
      valid: (string | ValidTestCase<Options, ParserOptions>)[];
      invalid: (ValidTestCase<Options, ParserOptions> &
        Pick<ESLintRuleTester.InvalidTestCase, 'errors'>)[];
    },
  ): void {
    // @ts-expect-error -- TODO fix me
    const { testerConfig, linter } = this;

    const getMessages = (
      testCase: ESLintRuleTester.InvalidTestCase,
      messages: Linter.LintMessage[],
    ) => {
      const { options, code, filename, languageOptions: _languageOptions } = testCase;

      const codeFrame = indentCode(printCode(code, { line: 0, column: 0 }));
      const messageForSnapshot = ['#### ⌨️ Code', codeFrame];

      if (options) {
        const opts = JSON.stringify(options, null, 2).slice(1, -1);
        messageForSnapshot.push('#### ⚙️ Options', indentCode(removeTrailingBlankLines(opts), 2));
      }
      for (const [index, message] of messages.entries()) {
        const codeWithMessage = printCode(code, message, 1);
        messageForSnapshot.push(
          printWithIndex('#### ❌ Error', index, messages.length),
          indentCode(codeWithMessage),
        );

        // Don't print suggestions in snapshots for too big codes
        if (message.suggestions && (code.match(/\n/g) || '').length < 1000) {
          for (const [i, suggestion] of message.suggestions.entries()) {
            const title = printWithIndex(
              '#### 💡 Suggestion',
              i,
              message.suggestions.length,
              suggestion.desc,
            );
            const output = applyFix(code, suggestion.fix);
            const codeFrame = printCode(output, { line: 0, column: 0 });
            messageForSnapshot.push(title, indentCode(codeFrame, 2));
          }
        }
      }
      if (rule.meta.fixable) {
        const pluginName = 'rule-to-test';
        const { fixed, output } = linter.verifyAndFix(
          code,
          {
            ...testerConfig[1],
            plugins: {
              [pluginName]: {
                rules: {
                  [ruleId]: rule,
                },
              },
            },
            rules: {
              [`${pluginName}/${ruleId}`]: Array.isArray(options) ? ['error', ...options] : 'error',
            },
          },
          filename,
        );
        if (fixed) {
          messageForSnapshot.push('#### 🔧 Autofix output', indentCode(printCode(output)));
        }
      }
      expect(messageForSnapshot.join('\n\n')).toMatchSnapshot();
    };

    for (const [id, testCase] of tests.invalid.entries()) {
      testCase.name ||= `Invalid #${id + 1}`;
      testCase.code = removeTrailingBlankLines(testCase.code);
      // @ts-expect-error -- Added in `patches/eslint.patch`
      testCase.assertMessages = getMessages;
    }

    super.run(ruleId, rule as any, {
      // @ts-expect-error -- TODO: remove this
      invalid: tests.invalid.map(({ parserOptions, ...testCase }) => ({
        ...testCase,
        languageOptions: {
          parserOptions,
        },
      })),
      // @ts-expect-error -- TODO: remove this
      valid: tests.valid.map(_testCase => {
        if (typeof _testCase === 'string') {
          return _testCase;
        }
        const { parserOptions, ...testCase } = _testCase;
        return {
          ...testCase,
          languageOptions: {
            parserOptions,
          },
        };
      }),
    });
  }
}

function removeTrailingBlankLines(text: string): string {
  return text.replace(/^\s*\n/, '').trimEnd();
}

function printWithIndex(title: string, index: number, total: number, description?: string): string {
  if (total > 1) {
    title += ` ${index + 1}/${total}`;
  }
  if (description) {
    title += `: ${description}`;
  }
  return title;
}

function printCode(
  code: string,
  result: Partial<Linter.LintMessage> = {},
  linesOffset = Number.POSITIVE_INFINITY,
): string {
  const { line, column, endLine, endColumn, message } = result;
  const location = {} as AST.SourceLocation;

  if (typeof line === 'number' && typeof column === 'number') {
    location.start = {
      line,
      column,
    };
  }

  if (typeof endLine === 'number' && typeof endColumn === 'number') {
    location.end = {
      line: endLine,
      column: endColumn,
    };
  }

  return codeFrameColumns(code, location, {
    linesAbove: linesOffset,
    linesBelow: linesOffset,
    message,
  });
}
