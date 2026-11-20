import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { ESLint } from 'eslint';
import { getGraphQLResolverImportArg, GraphQLVersion } from '../graphql-resolver.js';
import { CWD as PROJECT_CWD, slash } from '../src/utils.js';

const CWD = path.join(PROJECT_CWD, '..', '..');

const IS_WINDOWS = os.platform() === 'win32';

// set by the vitest project, see `vite.config.ts`
const GRAPHQL_VERSION = process.env.GRAPHQL_VERSION as GraphQLVersion;

/**
 * Examples resolve `graphql` from the plugin's own `node_modules`, preload the custom resolver so
 * the built plugin runs against the graphql version of the current vitest project too
 */
const ESLINT_ENV = {
  ...process.env,
  NODE_OPTIONS: [
    process.env.NODE_OPTIONS,
    `--import=${getGraphQLResolverImportArg(GRAPHQL_VERSION)}`,
  ]
    .filter(Boolean)
    .join(' '),
};

function countErrors(results: ESLint.LintResult[]): number {
  return results.reduce<number>((acc, curr: ESLint.LintResult & { fatalErrorCount: number }) => {
    if (curr.fatalErrorCount > 0) {
      throw new Error(`Found fatal error:

${results.map(result => result.messages.map(m => m.message)).join('\n\n')}
      `);
    }
    return acc + curr.errorCount;
  }, 0);
}

function getFlatESLintOutput(cwd: string): ESLint.LintResult[] {
  const { stdout, stderr } = spawnSync('eslint', ['--format', 'json', '.'], {
    cwd,
    env: ESLINT_ENV,
    // For Windows, otherwise `stdout` and `stderr` are `null`
    shell: IS_WINDOWS,
  });

  return parseESLintOutput({ stdout, stderr });
}

function getLegacyESLintOutput(cwd: string): ESLint.LintResult[] {
  const { stdout, stderr } = spawnSync(
    'eslint',
    ['--format', 'json', '--ignore-pattern', 'eslint.config.js', '.'],
    {
      cwd,
      env: { ...ESLINT_ENV, ESLINT_USE_FLAT_CONFIG: 'false' },
      // For Windows, otherwise `stdout` and `stderr` are `null`
      shell: IS_WINDOWS,
    },
  );

  return parseESLintOutput({ stdout, stderr });
}

function parseESLintOutput({
  stdout,
  stderr,
}: {
  stdout: Buffer;
  stderr: Buffer;
}): ESLint.LintResult[] {
  const errorOutput = stderr
    .toString()
    .replace(
      /\(node:\d+\) \[DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead./,
      '',
    )
    .replace(
      /\(node:\d+\) ESLintRCWarning: You are using an eslintrc configuration file, which is deprecated and support will be removed in v10.0.0. Please migrate to an eslint.config.js file. See https:\/\/eslint.org\/docs\/latest\/use\/configure\/migration-guide for details./,
      '',
    )
    .replace(
      'An eslintrc configuration file is used because you have the ESLINT_USE_FLAT_CONFIG environment variable set to false. If you want to use an eslint.config.js file, remove the environment variable. If you want to find the location of the eslintrc configuration file, use the --debug flag.',
      '',
    )
    .replace('(Use `node --trace-deprecation ...` to show where the warning was created)', '')
    .replace('(Use `node --trace-warnings ...` to show where the warning was created)', '')
    .trimEnd();
  if (errorOutput) {
    throw new Error(errorOutput);
  }
  const output = stdout.toString();
  const start = output.indexOf('[{');
  const end = output.lastIndexOf('}]') + 2;
  return JSON.parse(output.slice(start, end));
}

function normalizeResults(results: ESLint.LintResult[]) {
  return results
    .map(result => ({
      filePath: slash(path.relative(CWD, result.filePath)),
      messages: result.messages,
    }))
    .filter(result => result.messages.length > 0);
}

// spawning `eslint` is slow, especially on Windows
describe('Examples', { timeout: 60_000 }, () => {
  it('should run the built plugin against the selected graphql version', () => {
    const { stdout, stderr } = spawnSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        "import('graphql').then(g => console.log(g.versionInfo.major))",
      ],
      // resolve `graphql` like the built plugin does
      { cwd: path.join(PROJECT_CWD, 'dist'), env: ESLINT_ENV },
    );
    expect(stderr.toString()).toBe('');
    expect(stdout.toString().trim()).toBe(GRAPHQL_VERSION);
  });

  testExample('should work programmatically', 'programmatic', 6);
  testExample('should work on `.js` files', 'code-file', 4);
  testExample('should work with `graphql-config`', 'graphql-config', 2);
  testExample('should work with `eslint-plugin-prettier`', 'prettier', 23);
  testExample('should work in monorepo', 'monorepo', 11);
  testExample('should work in svelte', 'svelte-code-file', 2);
  testExample('should work in vue', 'vue-code-file', 4);
  testExample('should work in multiple projects', 'multiple-projects-graphql-config', 4);
  testExample('should work with custom rules', 'custom-rules', 1, { legacy: false });
});

/**
 * Windows has some offset for `range`, I think due \r\n handling, so snapshots are only compared on
 * other platforms. The snapshot test is skipped (not just its assertion) on Windows, otherwise
 * vitest reports its snapshots as obsolete and fails in CI.
 */
function testExample(
  name: string,
  example: string,
  errorCount: number,
  { legacy = true }: { legacy?: boolean } = {},
): void {
  const cwd = path.join(CWD, 'examples', example);
  const getOutputs = () => [
    getFlatESLintOutput(cwd),
    ...(legacy ? [getLegacyESLintOutput(cwd)] : []),
  ];

  it.skipIf(IS_WINDOWS)(name, () => {
    for (const results of getOutputs()) {
      expect(normalizeResults(results)).toMatchSnapshot();
      expect(countErrors(results)).toBe(errorCount);
    }
  });

  it.runIf(IS_WINDOWS)(`${name} (error count)`, () => {
    for (const results of getOutputs()) {
      expect(countErrors(results)).toBe(errorCount);
    }
  });
}
