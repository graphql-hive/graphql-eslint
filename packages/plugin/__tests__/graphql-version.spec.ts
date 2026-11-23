import { createRequire } from 'node:module';
import * as graphql from 'graphql';

/**
 * Guards the custom graphql resolver (`graphql-resolver.ts`): tests must run against the graphql
 * version of the current vitest project, with a single graphql instance shared by all importers.
 */
describe('graphql version', () => {
  // set by the vitest project, see `vite.config.ts`
  const expectedMajor = Number(process.env.GRAPHQL_VERSION);

  it('runs inside a graphql version project', () => {
    expect(expectedMajor).toBeGreaterThan(0);
  });

  it('resolves the selected graphql version', () => {
    expect(graphql.versionInfo.major).toBe(expectedMajor);
  });

  it('shares one graphql instance with dependencies loaded natively by Node.js', () => {
    const require = createRequire(import.meta.url);
    // resolve `graphql` the way graphql-config does, from inside its package directory
    const requireFromGraphQLConfig = createRequire(require.resolve('graphql-config'));
    const graphqlFromDependency: typeof graphql = requireFromGraphQLConfig('graphql');

    expect(graphqlFromDependency.versionInfo.major).toBe(expectedMajor);
    expect(graphqlFromDependency.GraphQLSchema).toBe(graphql.GraphQLSchema);
  });
});
