---
'@graphql-eslint/eslint-plugin': major
---

Upgrade `@graphql-tools/code-file-loader` to v9, `@graphql-tools/graphql-tag-pluck` to v9,
`@graphql-tools/utils` to v13 and `graphql-config` to v6. This fixes the
`@graphql-tools/utils` prototype pollution vulnerability
([GHSA-c4qx-w738-7hr3](https://github.com/advisories/GHSA-c4qx-w738-7hr3)).

The minimum supported Node.js version is now `>=22.18.0`, as required by the upgraded packages.
