// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html

exports[`Examples > should work in monorepo 1`] = `
[
  {
    filePath: examples/monorepo/client/graphql/query.users.gql,
    messages: [
      {
        column: 7,
        endColumn: 15,
        endLine: 1,
        line: 1,
        message: Query "getUsers" should be in PascalCase format,
        nodeType: Name,
        ruleId: @graphql-eslint/naming-convention,
        severity: 2,
        suggestions: [
          {
            desc: Rename to \`GetUsers\`,
            fix: {
              range: [
                6,
                14,
              ],
              text: GetUsers,
            },
          },
        ],
      },
    ],
  },
  {
    filePath: examples/monorepo/client/pages/index.tsx,
    messages: [
      {
        column: 7,
        endColumn: 16,
        endLine: 1,
        line: 1,
        message: 'GET_POSTS' is assigned a value but never used.,
        messageId: unusedVar,
        nodeType: Identifier,
        ruleId: no-unused-vars,
        severity: 2,
        suggestions: [
          {
            data: {
              varName: GET_POSTS,
            },
            desc: Remove unused variable 'GET_POSTS'.,
            fix: {
              range: [
                0,
                161,
              ],
              text: ,
            },
            messageId: removeVar,
          },
        ],
      },
      {
        column: 9,
        endColumn: 18,
        endLine: 9,
        line: 9,
        message: Cannot query field "firstname" on type "User". Did you mean "firstName" or "lastName"?,
        nodeType: null,
        ruleId: @graphql-eslint/fields-on-correct-type,
        severity: 2,
        suggestions: [
          {
            desc: Rename to \`firstName\`,
            fix: {
              range: [
                131,
                140,
              ],
              text: firstName,
            },
          },
          {
            desc: Rename to \`lastName\`,
            fix: {
              range: [
                131,
                140,
              ],
              text: lastName,
            },
          },
        ],
      },
    ],
  },
  {
    filePath: examples/monorepo/server/types/post.gql,
    messages: [
      {
        column: 6,
        endColumn: 10,
        endLine: 1,
        line: 1,
        message: Description is required for type "Post",
        messageId: require-description,
        nodeType: null,
        ruleId: @graphql-eslint/require-description,
        severity: 2,
      },
      {
        column: 3,
        endColumn: 7,
        endLine: 11,
        line: 11,
        message: Description is required for field "post" in type "Query",
        messageId: require-description,
        nodeType: null,
        ruleId: @graphql-eslint/require-description,
        severity: 2,
      },
      {
        column: 3,
        endColumn: 8,
        endLine: 12,
        line: 12,
        message: Description is required for field "posts" in type "Query",
        messageId: require-description,
        nodeType: null,
        ruleId: @graphql-eslint/require-description,
        severity: 2,
      },
    ],
  },
  {
    filePath: examples/monorepo/server/types/root.gql,
    messages: [
      {
        column: 6,
        endColumn: 11,
        endLine: 1,
        line: 1,
        message: Description is required for type "Query",
        messageId: require-description,
        nodeType: null,
        ruleId: @graphql-eslint/require-description,
        severity: 2,
      },
    ],
  },
  {
    filePath: examples/monorepo/server/types/scalar.gql,
    messages: [
      {
        column: 8,
        endColumn: 16,
        endLine: 1,
        line: 1,
        message: Description is required for scalar "DateTime",
        messageId: require-description,
        nodeType: null,
        ruleId: @graphql-eslint/require-description,
        severity: 2,
      },
    ],
  },
  {
    filePath: examples/monorepo/server/types/user.gql,
    messages: [
      {
        column: 6,
        endColumn: 10,
        endLine: 1,
        line: 1,
        message: Description is required for type "User",
        messageId: require-description,
        nodeType: null,
        ruleId: @graphql-eslint/require-description,
        severity: 2,
      },
      {
        column: 3,
        endColumn: 7,
        endLine: 10,
        line: 10,
        message: Description is required for field "user" in type "Query",
        messageId: require-description,
        nodeType: null,
        ruleId: @graphql-eslint/require-description,
        severity: 2,
      },
      {
        column: 3,
        endColumn: 8,
        endLine: 11,
        line: 11,
        message: Description is required for field "users" in type "Query",
        messageId: require-description,
        nodeType: null,
        ruleId: @graphql-eslint/require-description,
        severity: 2,
      },
    ],
  },
]
`;

exports[`Examples > should work in monorepo 2`] = `
[
  {
    filePath: examples/monorepo/client/graphql/query.users.gql,
    messages: [
      {
        column: 7,
        endColumn: 15,
        endLine: 1,
        line: 1,
        message: Query "getUsers" should be in PascalCase format,
        nodeType: Name,
        ruleId: @graphql-eslint/naming-convention,
        severity: 2,
        suggestions: [
          {
            desc: Rename to \`GetUsers\`,
            fix: {
              range: [
                6,
                14,
              ],
              text: GetUsers,
            },
          },
        ],
      },
    ],
  },
  {
    filePath: examples/monorepo/client/pages/index.tsx,
    messages: [
      {
        column: 7,
        endColumn: 16,
        endLine: 1,
        line: 1,
        message: 'GET_POSTS' is assigned a value but never used.,
        messageId: unusedVar,
        nodeType: Identifier,
        ruleId: no-unused-vars,
        severity: 2,
        suggestions: [
          {
            data: {
              varName: GET_POSTS,
            },
            desc: Remove unused variable 'GET_POSTS'.,
            fix: {
              range: [
                0,
                161,
              ],
              text: ,
            },
            messageId: removeVar,
          },
        ],
      },
      {
        column: 9,
        endColumn: 18,
        endLine: 9,
        line: 9,
        message: Cannot query field "firstname" on type "User". Did you mean "firstName" or "lastName"?,
        nodeType: null,
        ruleId: @graphql-eslint/fields-on-correct-type,
        severity: 2,
        suggestions: [
          {
            desc: Rename to \`firstName\`,
            fix: {
              range: [
                131,
                140,
              ],
              text: firstName,
            },
          },
          {
            desc: Rename to \`lastName\`,
            fix: {
              range: [
                131,
                140,
              ],
              text: lastName,
            },
          },
        ],
      },
    ],
  },
  {
    filePath: examples/monorepo/server/types/post.gql,
    messages: [
      {
        column: 6,
        endColumn: 10,
        endLine: 1,
        line: 1,
        message: Description is required for type "Post",
        messageId: require-description,
        nodeType: null,
        ruleId: @graphql-eslint/require-description,
        severity: 2,
      },
      {
        column: 3,
        endColumn: 7,
        endLine: 11,
        line: 11,
        message: Description is required for field "post" in type "Query",
        messageId: require-description,
        nodeType: null,
        ruleId: @graphql-eslint/require-description,
        severity: 2,
      },
      {
        column: 3,
        endColumn: 8,
        endLine: 12,
        line: 12,
        message: Description is required for field "posts" in type "Query",
        messageId: require-description,
        nodeType: null,
        ruleId: @graphql-eslint/require-description,
        severity: 2,
      },
    ],
  },
  {
    filePath: examples/monorepo/server/types/root.gql,
    messages: [
      {
        column: 6,
        endColumn: 11,
        endLine: 1,
        line: 1,
        message: Description is required for type "Query",
        messageId: require-description,
        nodeType: null,
        ruleId: @graphql-eslint/require-description,
        severity: 2,
      },
    ],
  },
  {
    filePath: examples/monorepo/server/types/scalar.gql,
    messages: [
      {
        column: 8,
        endColumn: 16,
        endLine: 1,
        line: 1,
        message: Description is required for scalar "DateTime",
        messageId: require-description,
        nodeType: null,
        ruleId: @graphql-eslint/require-description,
        severity: 2,
      },
    ],
  },
  {
    filePath: examples/monorepo/server/types/user.gql,
    messages: [
      {
        column: 6,
        endColumn: 10,
        endLine: 1,
        line: 1,
        message: Description is required for type "User",
        messageId: require-description,
        nodeType: null,
        ruleId: @graphql-eslint/require-description,
        severity: 2,
      },
      {
        column: 3,
        endColumn: 7,
        endLine: 10,
        line: 10,
        message: Description is required for field "user" in type "Query",
        messageId: require-description,
        nodeType: null,
        ruleId: @graphql-eslint/require-description,
        severity: 2,
      },
      {
        column: 3,
        endColumn: 8,
        endLine: 11,
        line: 11,
        message: Description is required for field "users" in type "Query",
        messageId: require-description,
        nodeType: null,
        ruleId: @graphql-eslint/require-description,
        severity: 2,
      },
    ],
  },
]
`;

exports[`Examples > should work in multiple projects 1`] = `
[
  {
    filePath: examples/multiple-projects-graphql-config/query.first-project.js,
    messages: [
      {
        column: 3,
        endColumn: 8,
        endLine: 11,
        line: 11,
        message: Anonymous GraphQL operations are forbidden. Make sure to name your query!,
        messageId: no-anonymous-operations,
        nodeType: null,
        ruleId: @graphql-eslint/no-anonymous-operations,
        severity: 2,
        suggestions: [
          {
            desc: Rename to \`user\`,
            fix: {
              range: [
                126,
                126,
              ],
              text: query user ,
            },
          },
        ],
      },
    ],
  },
  {
    filePath: examples/multiple-projects-graphql-config/query.second-project.js,
    messages: [
      {
        column: 3,
        endColumn: 8,
        endLine: 11,
        line: 11,
        message: Anonymous GraphQL operations are forbidden. Make sure to name your query!,
        messageId: no-anonymous-operations,
        nodeType: null,
        ruleId: @graphql-eslint/no-anonymous-operations,
        severity: 2,
        suggestions: [
          {
            desc: Rename to \`users\`,
            fix: {
              range: [
                148,
                148,
              ],
              text: query users ,
            },
          },
        ],
      },
    ],
  },
  {
    filePath: examples/multiple-projects-graphql-config/schema.first-project.graphql,
    messages: [
      {
        column: 6,
        endColumn: 10,
        endLine: 1,
        line: 1,
        message: type "User" must have exactly one non-nullable unique identifier.
Accepted name: id.
Accepted type: ID.,
        nodeType: Name,
        ruleId: @graphql-eslint/strict-id-in-types,
        severity: 2,
      },
    ],
  },
  {
    filePath: examples/multiple-projects-graphql-config/schema.second-project.graphql,
    messages: [
      {
        column: 6,
        endColumn: 17,
        endLine: 1,
        line: 1,
        message: type "AnotherUser" must have exactly one non-nullable unique identifier.
Accepted name: id.
Accepted type: ID.,
        nodeType: Name,
        ruleId: @graphql-eslint/strict-id-in-types,
        severity: 2,
      },
    ],
  },
]
`;

exports[`Examples > should work in multiple projects 2`] = `
[
  {
    filePath: examples/multiple-projects-graphql-config/query.first-project.js,
    messages: [
      {
        column: 3,
        endColumn: 8,
        endLine: 11,
        line: 11,
        message: Anonymous GraphQL operations are forbidden. Make sure to name your query!,
        messageId: no-anonymous-operations,
        nodeType: null,
        ruleId: @graphql-eslint/no-anonymous-operations,
        severity: 2,
        suggestions: [
          {
            desc: Rename to \`user\`,
            fix: {
              range: [
                126,
                126,
              ],
              text: query user ,
            },
          },
        ],
      },
    ],
  },
  {
    filePath: examples/multiple-projects-graphql-config/query.second-project.js,
    messages: [
      {
        column: 3,
        endColumn: 8,
        endLine: 11,
        line: 11,
        message: Anonymous GraphQL operations are forbidden. Make sure to name your query!,
        messageId: no-anonymous-operations,
        nodeType: null,
        ruleId: @graphql-eslint/no-anonymous-operations,
        severity: 2,
        suggestions: [
          {
            desc: Rename to \`users\`,
            fix: {
              range: [
                148,
                148,
              ],
              text: query users ,
            },
          },
        ],
      },
    ],
  },
  {
    filePath: examples/multiple-projects-graphql-config/schema.first-project.graphql,
    messages: [
      {
        column: 6,
        endColumn: 10,
        endLine: 1,
        line: 1,
        message: type "User" must have exactly one non-nullable unique identifier.
Accepted name: id.
Accepted type: ID.,
        nodeType: Name,
        ruleId: @graphql-eslint/strict-id-in-types,
        severity: 2,
      },
    ],
  },
  {
    filePath: examples/multiple-projects-graphql-config/schema.second-project.graphql,
    messages: [
      {
        column: 6,
        endColumn: 17,
        endLine: 1,
        line: 1,
        message: type "AnotherUser" must have exactly one non-nullable unique identifier.
Accepted name: id.
Accepted type: ID.,
        nodeType: Name,
        ruleId: @graphql-eslint/strict-id-in-types,
        severity: 2,
      },
    ],
  },
]
`;

exports[`Examples > should work in svelte 1`] = `
[
  {
    filePath: examples/svelte-code-file/test.svelte,
    messages: [
      {
        column: 0,
        line: 1,
        message: Anonymous GraphQL operations are forbidden. Make sure to name your query!,
        messageId: no-anonymous-operations,
        nodeType: null,
        ruleId: @graphql-eslint/no-anonymous-operations,
        severity: 2,
      },
      {
        column: 0,
        line: 1,
        message: Query "UserQuery" should not have "Query" suffix,
        nodeType: Name,
        ruleId: @graphql-eslint/naming-convention,
        severity: 2,
      },
    ],
  },
]
`;

exports[`Examples > should work in svelte 2`] = `
[
  {
    filePath: examples/svelte-code-file/test.svelte,
    messages: [
      {
        column: 0,
        line: 1,
        message: Anonymous GraphQL operations are forbidden. Make sure to name your query!,
        messageId: no-anonymous-operations,
        nodeType: null,
        ruleId: @graphql-eslint/no-anonymous-operations,
        severity: 2,
      },
      {
        column: 0,
        line: 1,
        message: Query "UserQuery" should not have "Query" suffix,
        nodeType: Name,
        ruleId: @graphql-eslint/naming-convention,
        severity: 2,
      },
    ],
  },
]
`;

exports[`Examples > should work in vue 1`] = `
[
  {
    filePath: examples/vue-code-file/test.vue,
    messages: [
      {
        column: 8,
        endColumn: 16,
        endLine: 7,
        line: 7,
        message: 'GET_USER' is assigned a value but never used.,
        messageId: unusedVar,
        nodeType: Identifier,
        ruleId: no-unused-vars,
        severity: 2,
        suggestions: [
          {
            data: {
              varName: GET_USER,
            },
            desc: Remove unused variable 'GET_USER'.,
            fix: {
              range: [
                0,
                77,
              ],
              text: ,
            },
            messageId: removeVar,
          },
        ],
      },
      {
        column: 4,
        endColumn: 9,
        endLine: 8,
        line: 8,
        message: Anonymous GraphQL operations are forbidden. Make sure to name your query!,
        messageId: no-anonymous-operations,
        nodeType: null,
        ruleId: @graphql-eslint/no-anonymous-operations,
        severity: 2,
        suggestions: [
          {
            desc: Rename to \`user\`,
            fix: {
              range: [
                40,
                40,
              ],
              text:  user,
            },
          },
        ],
      },
      {
        column: 8,
        endColumn: 24,
        endLine: 15,
        line: 15,
        message: 'GET_ANOTHER_USER' is assigned a value but never used.,
        messageId: unusedVar,
        nodeType: Identifier,
        ruleId: no-unused-vars,
        severity: 2,
        suggestions: [
          {
            data: {
              varName: GET_ANOTHER_USER,
            },
            desc: Remove unused variable 'GET_ANOTHER_USER'.,
            fix: {
              range: [
                79,
                174,
              ],
              text: ,
            },
            messageId: removeVar,
          },
        ],
      },
      {
        column: 10,
        endColumn: 19,
        endLine: 16,
        line: 16,
        message: Query "UserQuery" should not have "Query" suffix,
        nodeType: Name,
        ruleId: @graphql-eslint/naming-convention,
        severity: 2,
        suggestions: [
          {
            desc: Rename to \`User\`,
            fix: {
              range: [
                128,
                137,
              ],
              text: User,
            },
          },
        ],
      },
    ],
  },
]
`;

exports[`Examples > should work in vue 2`] = `
[
  {
    filePath: examples/vue-code-file/test.vue,
    messages: [
      {
        column: 0,
        line: 1,
        message: Anonymous GraphQL operations are forbidden. Make sure to name your query!,
        messageId: no-anonymous-operations,
        nodeType: null,
        ruleId: @graphql-eslint/no-anonymous-operations,
        severity: 2,
      },
      {
        column: 0,
        line: 1,
        message: Query "UserQuery" should not have "Query" suffix,
        nodeType: Name,
        ruleId: @graphql-eslint/naming-convention,
        severity: 2,
      },
      {
        column: 7,
        endColumn: 15,
        endLine: 7,
        line: 7,
        message: 'GET_USER' is assigned a value but never used.,
        messageId: unusedVar,
        nodeType: Identifier,
        ruleId: no-unused-vars,
        severity: 2,
      },
      {
        column: 7,
        endColumn: 23,
        endLine: 15,
        line: 15,
        message: 'GET_ANOTHER_USER' is assigned a value but never used.,
        messageId: unusedVar,
        nodeType: Identifier,
        ruleId: no-unused-vars,
        severity: 2,
        suggestions: [
          {
            data: {
              varName: GET_ANOTHER_USER,
            },
            desc: Remove unused variable 'GET_ANOTHER_USER'.,
            fix: {
              range: [
                243,
                338,
              ],
              text: ,
            },
            messageId: removeVar,
          },
        ],
      },
    ],
  },
]
`;

exports[`Examples > should work on \`.js\` files 1`] = `
[
  {
    filePath: examples/code-file/not-query.js,
    messages: [
      {
        column: 1,
        endColumn: 8,
        endLine: 1,
        line: 1,
        message: 'console' is not defined.,
        messageId: undef,
        nodeType: Identifier,
        ruleId: no-undef,
        severity: 2,
      },
      {
        column: 1,
        endColumn: 12,
        endLine: 1,
        line: 1,
        message: Unexpected console statement.,
        messageId: unexpected,
        nodeType: MemberExpression,
        ruleId: no-console,
        severity: 2,
        suggestions: [
          {
            data: {
              propertyName: log,
            },
            desc: Remove the console.log().,
            fix: {
              range: [
                0,
                48,
              ],
              text: ,
            },
            messageId: removeConsole,
          },
        ],
      },
    ],
  },
  {
    filePath: examples/code-file/query.js,
    messages: [
      {
        column: 3,
        endColumn: 8,
        endLine: 4,
        line: 4,
        message: Anonymous GraphQL operations are forbidden. Make sure to name your query!,
        messageId: no-anonymous-operations,
        nodeType: null,
        ruleId: @graphql-eslint/no-anonymous-operations,
        severity: 2,
        suggestions: [
          {
            desc: Rename to \`user\`,
            fix: {
              range: [
                77,
                77,
              ],
              text:  user,
            },
          },
        ],
      },
      {
        column: 9,
        endColumn: 18,
        endLine: 12,
        line: 12,
        message: Query "UserQuery" should not have "Query" suffix,
        nodeType: Name,
        ruleId: @graphql-eslint/naming-convention,
        severity: 2,
        suggestions: [
          {
            desc: Rename to \`User\`,
            fix: {
              range: [
                165,
                174,
              ],
              text: User,
            },
          },
        ],
      },
    ],
  },
]
`;

exports[`Examples > should work on \`.js\` files 2`] = `
[
  {
    filePath: examples/code-file/not-query.js,
    messages: [
      {
        column: 1,
        endColumn: 12,
        endLine: 1,
        line: 1,
        message: Unexpected console statement.,
        messageId: unexpected,
        nodeType: MemberExpression,
        ruleId: no-console,
        severity: 2,
        suggestions: [
          {
            data: {
              propertyName: log,
            },
            desc: Remove the console.log().,
            fix: {
              range: [
                0,
                48,
              ],
              text: ,
            },
            messageId: removeConsole,
          },
        ],
      },
      {
        column: 1,
        endColumn: 8,
        endLine: 1,
        line: 1,
        message: 'console' is not defined.,
        messageId: undef,
        nodeType: Identifier,
        ruleId: no-undef,
        severity: 2,
      },
    ],
  },
  {
    filePath: examples/code-file/query.js,
    messages: [
      {
        column: 3,
        endColumn: 8,
        endLine: 4,
        line: 4,
        message: Anonymous GraphQL operations are forbidden. Make sure to name your query!,
        messageId: no-anonymous-operations,
        nodeType: null,
        ruleId: @graphql-eslint/no-anonymous-operations,
        severity: 2,
        suggestions: [
          {
            desc: Rename to \`user\`,
            fix: {
              range: [
                77,
                77,
              ],
              text:  user,
            },
          },
        ],
      },
      {
        column: 9,
        endColumn: 18,
        endLine: 12,
        line: 12,
        message: Query "UserQuery" should not have "Query" suffix,
        nodeType: Name,
        ruleId: @graphql-eslint/naming-convention,
        severity: 2,
        suggestions: [
          {
            desc: Rename to \`User\`,
            fix: {
              range: [
                165,
                174,
              ],
              text: User,
            },
          },
        ],
      },
    ],
  },
]
`;

exports[`Examples > should work programmatically 1`] = `
[
  {
    filePath: examples/programmatic/fragment.graphql,
    messages: [
      {
        column: 10,
        endColumn: 14,
        endLine: 1,
        line: 1,
        message: Fragment named "Test" already defined in:
	fragment2.graphql,
        messageId: unique-fragment-name,
        nodeType: Name,
        ruleId: @graphql-eslint/unique-fragment-name,
        severity: 2,
      },
    ],
  },
  {
    filePath: examples/programmatic/fragment2.graphql,
    messages: [
      {
        column: 10,
        endColumn: 14,
        endLine: 1,
        line: 1,
        message: Fragment named "Test" already defined in:
	fragment.graphql,
        messageId: unique-fragment-name,
        nodeType: Name,
        ruleId: @graphql-eslint/unique-fragment-name,
        severity: 2,
      },
    ],
  },
  {
    filePath: examples/programmatic/query.graphql,
    messages: [
      {
        column: 1,
        endColumn: 6,
        endLine: 1,
        line: 1,
        message: Anonymous GraphQL operations are forbidden. Make sure to name your query!,
        messageId: no-anonymous-operations,
        nodeType: null,
        ruleId: @graphql-eslint/no-anonymous-operations,
        severity: 2,
        suggestions: [
          {
            desc: Rename to \`user\`,
            fix: {
              range: [
                5,
                5,
              ],
              text:  user,
            },
          },
        ],
      },
    ],
  },
  {
    filePath: examples/programmatic/schema.graphql,
    messages: [
      {
        column: 3,
        endColumn: 7,
        endLine: 2,
        line: 2,
        message: Description is required for field "user" in type "Query",
        messageId: require-description,
        nodeType: null,
        ruleId: @graphql-eslint/require-description,
        severity: 2,
      },
      {
        column: 3,
        endColumn: 5,
        endLine: 6,
        line: 6,
        message: Description is required for field "id" in type "User",
        messageId: require-description,
        nodeType: null,
        ruleId: @graphql-eslint/require-description,
        severity: 2,
      },
      {
        column: 3,
        endColumn: 7,
        endLine: 7,
        line: 7,
        message: Description is required for field "name" in type "User",
        messageId: require-description,
        nodeType: null,
        ruleId: @graphql-eslint/require-description,
        severity: 2,
      },
    ],
  },
]
`;

exports[`Examples > should work programmatically 2`] = `
[
  {
    filePath: examples/programmatic/fragment.graphql,
    messages: [
      {
        column: 10,
        endColumn: 14,
        endLine: 1,
        line: 1,
        message: Fragment named "Test" already defined in:
	fragment2.graphql,
        messageId: unique-fragment-name,
        nodeType: Name,
        ruleId: @graphql-eslint/unique-fragment-name,
        severity: 2,
      },
    ],
  },
  {
    filePath: examples/programmatic/fragment2.graphql,
    messages: [
      {
        column: 10,
        endColumn: 14,
        endLine: 1,
        line: 1,
        message: Fragment named "Test" already defined in:
	fragment.graphql,
        messageId: unique-fragment-name,
        nodeType: Name,
        ruleId: @graphql-eslint/unique-fragment-name,
        severity: 2,
      },
    ],
  },
  {
    filePath: examples/programmatic/query.graphql,
    messages: [
      {
        column: 1,
        endColumn: 6,
        endLine: 1,
        line: 1,
        message: Anonymous GraphQL operations are forbidden. Make sure to name your query!,
        messageId: no-anonymous-operations,
        nodeType: null,
        ruleId: @graphql-eslint/no-anonymous-operations,
        severity: 2,
        suggestions: [
          {
            desc: Rename to \`user\`,
            fix: {
              range: [
                5,
                5,
              ],
              text:  user,
            },
          },
        ],
      },
    ],
  },
  {
    filePath: examples/programmatic/schema.graphql,
    messages: [
      {
        column: 3,
        endColumn: 7,
        endLine: 2,
        line: 2,
        message: Description is required for field "user" in type "Query",
        messageId: require-description,
        nodeType: null,
        ruleId: @graphql-eslint/require-description,
        severity: 2,
      },
      {
        column: 3,
        endColumn: 5,
        endLine: 6,
        line: 6,
        message: Description is required for field "id" in type "User",
        messageId: require-description,
        nodeType: null,
        ruleId: @graphql-eslint/require-description,
        severity: 2,
      },
      {
        column: 3,
        endColumn: 7,
        endLine: 7,
        line: 7,
        message: Description is required for field "name" in type "User",
        messageId: require-description,
        nodeType: null,
        ruleId: @graphql-eslint/require-description,
        severity: 2,
      },
    ],
  },
]
`;

exports[`Examples > should work with \`eslint-plugin-prettier\` 1`] = `
[
  {
    filePath: examples/prettier/invalid.graphql,
    messages: [
      {
        column: 21,
        endColumn: 26,
        endLine: 1,
        fix: {
          range: [
            20,
            25,
          ],
          text: ,
        },
        line: 1,
        message: Delete \`·····\`,
        messageId: delete,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 7,
        endColumn: 8,
        endLine: 3,
        fix: {
          range: [
            60,
            61,
          ],
          text: ,
        },
        line: 3,
        message: Delete \`,\`,
        messageId: delete,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 9,
        endColumn: 10,
        endLine: 4,
        fix: {
          range: [
            70,
            71,
          ],
          text: ,
        },
        line: 4,
        message: Delete \`,\`,
        messageId: delete,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 19,
        endColumn: 20,
        endLine: 5,
        fix: {
          range: [
            90,
            91,
          ],
          text: ,
        },
        line: 5,
        message: Delete \`,\`,
        messageId: delete,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 29,
        endColumn: 30,
        endLine: 6,
        fix: {
          range: [
            120,
            121,
          ],
          text: ,
        },
        line: 6,
        message: Delete \`·\`,
        messageId: delete,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 6,
        endColumn: 7,
        endLine: 13,
        fix: {
          range: [
            201,
            202,
          ],
          text: ,
        },
        line: 13,
        message: Delete \`,\`,
        messageId: delete,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 8,
        endColumn: 9,
        endLine: 14,
        fix: {
          range: [
            210,
            211,
          ],
          text: ,
        },
        line: 14,
        message: Delete \`,\`,
        messageId: delete,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
    ],
  },
  {
    filePath: examples/prettier/invalid.js,
    messages: [
      {
        column: 33,
        endColumn: 58,
        endLine: 2,
        fix: {
          range: [
            75,
            100,
          ],
          text: 
  query User($userId: ,
        },
        line: 2,
        message: Replace \`query·User($userId:······\` with \`⏎··query·User($userId:·\`,
        messageId: replace,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 1,
        endColumn: 1,
        endLine: 3,
        fix: {
          range: [
            107,
            107,
          ],
          text:   ,
        },
        line: 3,
        message: Insert \`··\`,
        messageId: insert,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 1,
        endColumn: 8,
        endLine: 4,
        fix: {
          range: [
            129,
            136,
          ],
          text:       id,
        },
        line: 4,
        message: Replace \`····id,\` with \`······id\`,
        messageId: replace,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 1,
        endColumn: 10,
        endLine: 5,
        fix: {
          range: [
            137,
            146,
          ],
          text:       name,
        },
        line: 5,
        message: Replace \`····name,\` with \`······name\`,
        messageId: replace,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 1,
        endColumn: 20,
        endLine: 6,
        fix: {
          range: [
            147,
            166,
          ],
          text:       isViewerFriend,
        },
        line: 6,
        message: Replace \`····isViewerFriend,\` with \`······isViewerFriend\`,
        messageId: replace,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 1,
        endColumn: 30,
        endLine: 7,
        fix: {
          range: [
            167,
            196,
          ],
          text:       profilePicture(size: 50),
        },
        line: 7,
        message: Replace \`····profilePicture(size:·50)·\` with \`······profilePicture(size:·50)\`,
        messageId: replace,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 7,
        endColumn: 7,
        endLine: 8,
        fix: {
          range: [
            205,
            205,
          ],
          text:   ,
        },
        line: 8,
        message: Insert \`··\`,
        messageId: insert,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 5,
        endColumn: 5,
        endLine: 9,
        fix: {
          range: [
            226,
            226,
          ],
          text:   ,
        },
        line: 9,
        message: Insert \`··\`,
        messageId: insert,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 1,
        endColumn: 1,
        endLine: 10,
        fix: {
          range: [
            228,
            228,
          ],
          text:   ,
        },
        line: 10,
        message: Insert \`··\`,
        messageId: insert,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 1,
        endColumn: 1,
        endLine: 11,
        fix: {
          range: [
            232,
            232,
          ],
          text:   ,
        },
        line: 11,
        message: Insert \`··\`,
        messageId: insert,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 1,
        endColumn: 1,
        endLine: 13,
        fix: {
          range: [
            235,
            235,
          ],
          text:   ,
        },
        line: 13,
        message: Insert \`··\`,
        messageId: insert,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 1,
        endColumn: 7,
        endLine: 14,
        fix: {
          range: [
            271,
            277,
          ],
          text:     uri,
        },
        line: 14,
        message: Replace \`··uri,\` with \`····uri\`,
        messageId: replace,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 1,
        endColumn: 9,
        endLine: 15,
        fix: {
          range: [
            278,
            286,
          ],
          text:     width,
        },
        line: 15,
        message: Replace \`··width,\` with \`····width\`,
        messageId: replace,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 3,
        endColumn: 3,
        endLine: 16,
        fix: {
          range: [
            289,
            289,
          ],
          text:   ,
        },
        line: 16,
        message: Insert \`··\`,
        messageId: insert,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 1,
        endColumn: 1,
        endLine: 17,
        fix: {
          range: [
            296,
            296,
          ],
          text:   ,
        },
        line: 17,
        message: Insert \`··\`,
        messageId: insert,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 2,
        endColumn: 2,
        endLine: 18,
        fix: {
          range: [
            299,
            299,
          ],
          text: ;,
        },
        line: 18,
        message: Insert \`;\`,
        messageId: insert,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
    ],
  },
]
`;

exports[`Examples > should work with \`eslint-plugin-prettier\` 2`] = `
[
  {
    filePath: examples/prettier/invalid.graphql,
    messages: [
      {
        column: 21,
        endColumn: 26,
        endLine: 1,
        fix: {
          range: [
            20,
            25,
          ],
          text: ,
        },
        line: 1,
        message: Delete \`·····\`,
        messageId: delete,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 7,
        endColumn: 8,
        endLine: 3,
        fix: {
          range: [
            60,
            61,
          ],
          text: ,
        },
        line: 3,
        message: Delete \`,\`,
        messageId: delete,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 9,
        endColumn: 10,
        endLine: 4,
        fix: {
          range: [
            70,
            71,
          ],
          text: ,
        },
        line: 4,
        message: Delete \`,\`,
        messageId: delete,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 19,
        endColumn: 20,
        endLine: 5,
        fix: {
          range: [
            90,
            91,
          ],
          text: ,
        },
        line: 5,
        message: Delete \`,\`,
        messageId: delete,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 29,
        endColumn: 30,
        endLine: 6,
        fix: {
          range: [
            120,
            121,
          ],
          text: ,
        },
        line: 6,
        message: Delete \`·\`,
        messageId: delete,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 6,
        endColumn: 7,
        endLine: 13,
        fix: {
          range: [
            201,
            202,
          ],
          text: ,
        },
        line: 13,
        message: Delete \`,\`,
        messageId: delete,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 8,
        endColumn: 9,
        endLine: 14,
        fix: {
          range: [
            210,
            211,
          ],
          text: ,
        },
        line: 14,
        message: Delete \`,\`,
        messageId: delete,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
    ],
  },
  {
    filePath: examples/prettier/invalid.js,
    messages: [
      {
        column: 33,
        endColumn: 58,
        endLine: 2,
        fix: {
          range: [
            75,
            100,
          ],
          text: 
  query User($userId: ,
        },
        line: 2,
        message: Replace \`query·User($userId:······\` with \`⏎··query·User($userId:·\`,
        messageId: replace,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 1,
        endColumn: 1,
        endLine: 3,
        fix: {
          range: [
            107,
            107,
          ],
          text:   ,
        },
        line: 3,
        message: Insert \`··\`,
        messageId: insert,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 1,
        endColumn: 8,
        endLine: 4,
        fix: {
          range: [
            129,
            136,
          ],
          text:       id,
        },
        line: 4,
        message: Replace \`····id,\` with \`······id\`,
        messageId: replace,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 1,
        endColumn: 10,
        endLine: 5,
        fix: {
          range: [
            137,
            146,
          ],
          text:       name,
        },
        line: 5,
        message: Replace \`····name,\` with \`······name\`,
        messageId: replace,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 1,
        endColumn: 20,
        endLine: 6,
        fix: {
          range: [
            147,
            166,
          ],
          text:       isViewerFriend,
        },
        line: 6,
        message: Replace \`····isViewerFriend,\` with \`······isViewerFriend\`,
        messageId: replace,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 1,
        endColumn: 30,
        endLine: 7,
        fix: {
          range: [
            167,
            196,
          ],
          text:       profilePicture(size: 50),
        },
        line: 7,
        message: Replace \`····profilePicture(size:·50)·\` with \`······profilePicture(size:·50)\`,
        messageId: replace,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 7,
        endColumn: 7,
        endLine: 8,
        fix: {
          range: [
            205,
            205,
          ],
          text:   ,
        },
        line: 8,
        message: Insert \`··\`,
        messageId: insert,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 5,
        endColumn: 5,
        endLine: 9,
        fix: {
          range: [
            226,
            226,
          ],
          text:   ,
        },
        line: 9,
        message: Insert \`··\`,
        messageId: insert,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 1,
        endColumn: 1,
        endLine: 10,
        fix: {
          range: [
            228,
            228,
          ],
          text:   ,
        },
        line: 10,
        message: Insert \`··\`,
        messageId: insert,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 1,
        endColumn: 1,
        endLine: 11,
        fix: {
          range: [
            232,
            232,
          ],
          text:   ,
        },
        line: 11,
        message: Insert \`··\`,
        messageId: insert,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 1,
        endColumn: 1,
        endLine: 13,
        fix: {
          range: [
            235,
            235,
          ],
          text:   ,
        },
        line: 13,
        message: Insert \`··\`,
        messageId: insert,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 1,
        endColumn: 7,
        endLine: 14,
        fix: {
          range: [
            271,
            277,
          ],
          text:     uri,
        },
        line: 14,
        message: Replace \`··uri,\` with \`····uri\`,
        messageId: replace,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 1,
        endColumn: 9,
        endLine: 15,
        fix: {
          range: [
            278,
            286,
          ],
          text:     width,
        },
        line: 15,
        message: Replace \`··width,\` with \`····width\`,
        messageId: replace,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 3,
        endColumn: 3,
        endLine: 16,
        fix: {
          range: [
            289,
            289,
          ],
          text:   ,
        },
        line: 16,
        message: Insert \`··\`,
        messageId: insert,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 1,
        endColumn: 1,
        endLine: 17,
        fix: {
          range: [
            296,
            296,
          ],
          text:   ,
        },
        line: 17,
        message: Insert \`··\`,
        messageId: insert,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
      {
        column: 2,
        endColumn: 2,
        endLine: 18,
        fix: {
          range: [
            299,
            299,
          ],
          text: ;,
        },
        line: 18,
        message: Insert \`;\`,
        messageId: insert,
        nodeType: null,
        ruleId: prettier/prettier,
        severity: 2,
      },
    ],
  },
]
`;

exports[`Examples > should work with \`graphql-config\` 1`] = `
[
  {
    filePath: examples/graphql-config/operations/query.graphql,
    messages: [
      {
        column: 1,
        endColumn: 6,
        endLine: 1,
        line: 1,
        message: Anonymous GraphQL operations are forbidden. Make sure to name your query!,
        messageId: no-anonymous-operations,
        nodeType: null,
        ruleId: @graphql-eslint/no-anonymous-operations,
        severity: 2,
        suggestions: [
          {
            desc: Rename to \`user\`,
            fix: {
              range: [
                5,
                5,
              ],
              text:  user,
            },
          },
        ],
      },
    ],
  },
  {
    filePath: examples/graphql-config/operations/user.fragment.graphql,
    messages: [
      {
        column: 3,
        endColumn: 7,
        endLine: 4,
        line: 4,
        message: Field \`name\` defined multiple times.,
        messageId: no-duplicate-fields,
        nodeType: Name,
        ruleId: @graphql-eslint/no-duplicate-fields,
        severity: 2,
        suggestions: [
          {
            desc: Remove \`name\` field,
            fix: {
              range: [
                44,
                48,
              ],
              text: ,
            },
          },
        ],
      },
    ],
  },
]
`;

exports[`Examples > should work with \`graphql-config\` 2`] = `
[
  {
    filePath: examples/graphql-config/operations/query.graphql,
    messages: [
      {
        column: 1,
        endColumn: 6,
        endLine: 1,
        line: 1,
        message: Anonymous GraphQL operations are forbidden. Make sure to name your query!,
        messageId: no-anonymous-operations,
        nodeType: null,
        ruleId: @graphql-eslint/no-anonymous-operations,
        severity: 2,
        suggestions: [
          {
            desc: Rename to \`user\`,
            fix: {
              range: [
                5,
                5,
              ],
              text:  user,
            },
          },
        ],
      },
    ],
  },
  {
    filePath: examples/graphql-config/operations/user.fragment.graphql,
    messages: [
      {
        column: 3,
        endColumn: 7,
        endLine: 4,
        line: 4,
        message: Field \`name\` defined multiple times.,
        messageId: no-duplicate-fields,
        nodeType: Name,
        ruleId: @graphql-eslint/no-duplicate-fields,
        severity: 2,
        suggestions: [
          {
            desc: Remove \`name\` field,
            fix: {
              range: [
                44,
                48,
              ],
              text: ,
            },
          },
        ],
      },
    ],
  },
]
`;

exports[`Examples > should work with custom rules 1`] = `
[
  {
    filePath: examples/custom-rules/test.graphql,
    messages: [
      {
        column: 1,
        endColumn: 16,
        endLine: 3,
        line: 1,
        message: Oops, name is required!,
        nodeType: OperationDefinition,
        ruleId: @internal/my-rule,
        severity: 2,
      },
    ],
  },
]
`;
