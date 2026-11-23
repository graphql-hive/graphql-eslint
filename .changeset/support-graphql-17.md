---
'@graphql-eslint/eslint-plugin': major
---

Support `graphql` v17 and update to the latest major versions of `@graphql-tools/*` and
`graphql-config`.

**Breaking changes**

- Node.js `>=22.18.0` is required (previously `>=18`), as required by `graphql-config` v6 and
  `@graphql-tools/*` latest majors.
- Updated dependencies: `graphql-config` v5 → v6, `@graphql-tools/code-file-loader` v8 → v9,
  `@graphql-tools/graphql-tag-pluck` v8 → v9, `@graphql-tools/utils` v10 → v13.
- The optional `@apollo/subgraph` peer dependency is now `^2.16.0` (first version supporting graphql
  v17).

**Changes**

- `graphql` peer dependency is now `^16 || ^17`.
- Fix loading federation schemas with `@apollo/subgraph` >= 2.17, which no longer accepts a single
  schema module in `buildSubgraphSchema`.
- ESTree nodes keep the same shape with both graphql versions: list fields that graphql v17 leaves
  `undefined` when empty (e.g. `directives`, `arguments`, `fields`, `interfaces`) are normalized to
  `[]`, like graphql v16 does. `node.rawNode()` still returns the original graphql-js node.
- `selection-set-depth` no longer depends on the unmaintained `graphql-depth-limit` package (which
  is incompatible with graphql v17) and uses a built-in port of it instead.
