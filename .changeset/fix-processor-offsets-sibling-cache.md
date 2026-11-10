---
'@graphql-eslint/eslint-plugin': patch
---

Clear stored processor offsets before each preprocessing pass so removing embedded GraphQL or
failing to extract it cannot shift JavaScript diagnostics, fixes, or suggestions on a later lint.

Weakly cache sibling-document indexes so obsolete document snapshots can be collected after the
document cache refreshes, while preserving index reuse for the same source array.
