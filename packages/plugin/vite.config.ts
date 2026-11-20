import { defineConfig } from 'vitest/config';
import {
  getGraphQLResolverImportArg,
  GRAPHQL_VERSIONS,
  graphqlVitePlugin,
} from './graphql-resolver.js';

export default defineConfig({
  test: {
    globals: true,
    resolveSnapshotPath(testPath) {
      if (testPath.endsWith('/index.test.ts')) {
        return testPath.replace('/index.test.ts', '/snapshot.md');
      }

      return testPath.replace('__tests__/', '__tests__/__snapshots__/').replace(/\.ts$/, '.md');
    },
    setupFiles: ['./serializer.ts'],
    pool: 'forks',
    // Run every test against each supported graphql version, filter with `--project graphql-v16`
    projects: GRAPHQL_VERSIONS.map(version => ({
      extends: true,
      plugins: [graphqlVitePlugin(version)],
      test: {
        name: `graphql-v${version}`,
        env: { GRAPHQL_VERSION: version },
        // makes dependencies loaded natively by Node.js resolve the same graphql version
        execArgv: ['--import', getGraphQLResolverImportArg(version)],
      },
    })),
  },
  resolve: {
    tsconfigPaths: true,
  },
});
