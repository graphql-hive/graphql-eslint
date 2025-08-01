// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html

exports[`require-scopes-on-types > invalid > should report types that do not have the @requiresScopes directive 1`] = `
#### ⌨️ Code

      1 |         type TypeWithoutDirective {
      2 |           foo: String!
      3 |         }

#### ❌ Error

    > 1 |         type TypeWithoutDirective {
        |              ^^^^^^^^^^^^^^^^^^^^ All types must have the @requiresScopes directive applied to them.
      2 |           foo: String!
`;

exports[`require-scopes-on-types > invalid > should report types that have the @requireScopes directive but haven't defined any scopes 1`] = `
#### ⌨️ Code

      1 |         type TypeWithEmptyScopes @requiresScopes(scopes: []) {
      2 |           foo: String!
      3 |         }

#### ❌ Error

    > 1 |         type TypeWithEmptyScopes @requiresScopes(scopes: []) {
        |              ^^^^^^^^^^^^^^^^^^^ All types must have the @requiresScopes directive applied to them.
      2 |           foo: String!
`;
