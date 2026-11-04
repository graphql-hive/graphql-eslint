import { rule } from '../src/rules/require-scopes-on-types/index';
import { ruleTester, ParserOptionsForTests} from "./test-utils.js";

const TEST_SCHEMA = /* GraphQL */ `
  directive @requiresScopes(scopes: [String!]!) on OBJECT

  type Query {
    foo: String!
  }
`;

const WITH_SCHEMA = {
  languageOptions: {
    parserOptions: {
      graphQLConfig: {
        schema: TEST_SCHEMA,
      },
    } satisfies ParserOptionsForTests,
  },
};

ruleTester.run('require-scopes-on-types', rule, {
  valid: [
    {
      ...WITH_SCHEMA, code: TEST_SCHEMA,
    },
    {
      name: 'should ignore types that have the @requiresScopes directive',
      ...WITH_SCHEMA,
      code: /* GraphQL */ `
        type ValidType @requiresScopes(scopes: ["my-scope"]) {
          foo: String!
        }
      `,
    },
  ],
  invalid: [
    {
      name: 'should report types that do not have the @requiresScopes directive',
      ...WITH_SCHEMA,
      code: /* GraphQL */ `
        type TypeWithoutDirective {
          foo: String!
        }
      `,
      errors: [{ messageId: 'require-scopes-on-types' }],
    },
    {
      name: "should report types that have the @requireScopes directive but haven't defined any scopes",
      ...WITH_SCHEMA,
      code: /* GraphQL */ `
        type TypeWithEmptyScopes @requiresScopes(scopes: []) {
          foo: String!
        }
      `,
      errors: [{ messageId: 'require-scopes-on-types' }],
    },
  ],
});
