import { RuleTester } from '@theguild/eslint-rule-tester';
import { GRAPHQL_JS_VALIDATIONS } from '../src/rules/graphql-js-validation.js';
import type { ParserOptionsForTests } from './test-utils.js';
import { DEFAULT_CONFIG } from './test-utils.js';

const ruleTester = new RuleTester<ParserOptionsForTests>({
  languageOptions: {
    ...DEFAULT_CONFIG.languageOptions,
    parserOptions: {
      graphQLConfig: {
        schema: /* GraphQL */ `
          type User {
            id: ID!
          }

          type Query {
            user: User
          }
        `,
      },
    },
  },
});

ruleTester.run<[{ ignoreClientDirectives: string[] }]>(
  'known-directives',
  // @ts-expect-error -- I don't know why it's complaining
  GRAPHQL_JS_VALIDATIONS['known-directives'],
  {
    valid: [
      {
        code: /* GraphQL */ `
          {
            user {
              firstName @client
            }
          }
        `,
        options: [{ ignoreClientDirectives: ['client'] }],
      },
      {
        code: /* GraphQL */ `
          {
            getIp @rest(path: "/all.json", type: "GET", endpoint: "ip") {
              ip: ip_addr
            }
          }
        `,
        options: [{ ignoreClientDirectives: ['rest'] }],
      },
      {
        code: /* GraphQL */ `
          query @api {
            test
          }
        `,
        options: [{ ignoreClientDirectives: ['api'] }],
      },
      {
        name: 'should ignore client directives on FragmentDefinition',
        code: /* GraphQL */ `
          fragment UserFields on User @client {
            id
          }
        `,
        options: [{ ignoreClientDirectives: ['client'] }],
      },
      {
        name: 'should ignore client directives on InlineFragment',
        code: /* GraphQL */ `
          {
            user {
              ... on User @client {
                id
              }
            }
          }
        `,
        options: [{ ignoreClientDirectives: ['client'] }],
      },
      {
        name: 'should ignore client directives on FragmentSpread',
        code: /* GraphQL */ `
          fragment UserFields on User {
            id
          }

          {
            user {
              ...UserFields @client
            }
          }
        `,
        options: [{ ignoreClientDirectives: ['client'] }],
      },
    ],
    invalid: [
      {
        name: 'should not ignore directives on schema definitions',
        code: 'scalar Foo @bad',
        options: [{ ignoreClientDirectives: ['bad'] }],
        errors: [{ message: 'Unknown directive "@bad".' }],
      },
    ],
  },
);
