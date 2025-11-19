import { ruleTester } from '../../../__tests__/test-utils.js';
import { rule } from './index.js';

const TYPE_WITH_SCOPES = /* GraphQL */ `
  directive @requiresScopes(scopes: [String!]!) on OBJECT
  
  type ValidType @requiresScopes(scopes: ["my-scope"]) {
    foo: String!
  }
`;

const TYPE_WITHOUT_SCOPES = /* GraphQL */ `
  type InvalidType {
    foo: String!
  }
`;

const TYPE_WITH_EMPTY_SCOPES = /* GraphQL */ `
  directive @requiresScopes(scopes: [String!]!) on OBJECT
  
  type InvalidType @requiresScopes(scopes: []) {
    foo: String!
  }
`;

ruleTester.run('require-scopes-on-types', rule, {
  valid: [
    {
      name: 'should ignore types that have the @requiresScopes directive',
      code: TYPE_WITH_SCOPES,
      parserOptions: {
        graphQLConfig: {
          schema: TYPE_WITH_SCOPES,
        },
      },
    },
  ],
  invalid: [
    {
      name: 'should report types that do not have the @requiresScopes directive',
      code: TYPE_WITHOUT_SCOPES,
      parserOptions: {
        graphQLConfig: {
          schema: TYPE_WITHOUT_SCOPES,
        },
      },
      errors: [{ messageId: 'require-scopes-on-types' }],
    },
    {
      name: 'should report types that have the @requireScopes directive but have not defined any scopes',
      code: TYPE_WITH_EMPTY_SCOPES,
      parserOptions: {
        graphQLConfig: {
          schema: TYPE_WITH_EMPTY_SCOPES,
        },
      },
      errors: [{ messageId: 'require-scopes-on-types' }],
    },
  ],
});
