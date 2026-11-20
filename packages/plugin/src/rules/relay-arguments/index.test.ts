import { ParserOptionsForTests, ruleTester } from '../../../__tests__/test-utils.js';
import { rule, RuleOptions } from './index.js';

function useSchema(code: string) {
  return {
    code,
    parserOptions: {
      graphQLConfig: {
        schema: /* GraphQL */ `
          type PostConnection
          type Query
          ${code}
        `,
      },
    } satisfies ParserOptionsForTests,
  };
}

ruleTester.run<RuleOptions>('relay-arguments', rule, {
  valid: [
    useSchema(/* GraphQL */ `
      type User {
        posts(
          after: String!
          first: Int!
          before: Float # should be fine as it's Scalar
          last: Int
        ): PostConnection
      }
    `),
    {
      name: '`includeBoth` should not report about missing opposite pagination arguments',
      options: [{ includeBoth: false }],
      ...useSchema(/* GraphQL */ `
        type User {
          posts(after: String!, first: Int!): PostConnection
          comments(before: Float, last: Int): PostConnection
        }
      `),
    },
  ],
  invalid: [
    {
      ...useSchema(/* GraphQL */ `
        type User {
          posts: PostConnection
          comments(
            after: [String!]!
            first: Float
            before: Query
            last: [PostConnection]
          ): PostConnection
        }
      `),
      errors: 5,
    },
    {
      ...useSchema(/* GraphQL */ `
        type User {
          posts(after: String, first: Int): PostConnection
        }
      `),
      errors: 2,
    },
    {
      name: 'should report about 2nd required argument if 1st was provided',
      options: [{ includeBoth: false }],
      ...useSchema(/* GraphQL */ `
        type User {
          posts(after: String, first: Int, before: Float): PostConnection
        }
      `),
      errors: 1,
    },
  ],
});
