---
'@graphql-eslint/eslint-plugin': patch
---

Improve `require-selections` handling of union members so each member is validated independently.

For a field typed as a union, selecting the id field in one member's inline fragment no longer
satisfies the requirement for a sibling member that omits it.
