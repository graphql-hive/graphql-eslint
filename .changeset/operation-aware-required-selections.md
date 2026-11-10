---
'@graphql-eslint/eslint-plugin': minor
---

Add the optional `operationsOnly` setting to `require-selections`. When enabled, check required
fields in composed operations and allow partial standalone fragments. Merge matching response fields
and check each concrete interface/union member independently, including nested selections.

In this mode, `requireAllFields` requires the actual configured schema fields. Report sibling
fragment errors at the consumer spread, offer edits only to local nodes, and avoid suggestions that
conflict with aliases or select fields on the wrong concrete type. Guard fragment cycles and reuse
equivalent traversal work within each lint pass.

The option defaults to false and is not enabled by existing presets. Existing behavior is preserved
when it is omitted or disabled. This works with ordinary GraphQL Config document loading and does
not add a loader API or dependency.
