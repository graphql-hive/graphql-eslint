// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html

exports[`require-scopes-on-types > invalid > should report types that do not have the @requiresScopes directive 1`] = `
#### ⌨️ Code

      1 |   type InvalidType {
      2 |     foo: String!
      3 |   }

#### ❌ Error

    > 1 |   type InvalidType {
        |        ^^^^^^^^^^^ All types must have the @requiresScopes directive applied to them.
      2 |     foo: String!
`;

exports[`require-scopes-on-types > invalid > should report types that have the @requireScopes directive but have not defined any scopes 1`] = `
#### ⌨️ Code

      1 |   directive @requiresScopes(scopes: [String!]!) on OBJECT
      2 |   
      3 |   type InvalidType @requiresScopes(scopes: []) {
      4 |     foo: String!
      5 |   }

#### ❌ Error

      2 |   
    > 3 |   type InvalidType @requiresScopes(scopes: []) {
        |        ^^^^^^^^^^^ All types must have the @requiresScopes directive applied to them.
      4 |     foo: String!
`;
