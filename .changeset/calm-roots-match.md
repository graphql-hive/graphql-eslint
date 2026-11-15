---
'@graphql-eslint/eslint-plugin': patch
---

`require-description`: report `rootField` definitions when the schema has more than one root type.
The selector joined the root type names with `,` instead of `|`, so it matched no type name.
