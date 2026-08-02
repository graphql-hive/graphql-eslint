---
'@graphql-eslint/eslint-plugin': patch
---

Fix `TypeError: context.getSourceCode is not a function` when running with ESLint v10

`context.getSourceCode()` was deprecated in ESLint v8.40 and removed in v10. All remaining call
sites now use the `context.sourceCode` property, which is available in every supported ESLint
version (peer dependency is `>=8.44.0`).
