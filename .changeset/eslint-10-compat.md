---
"@graphql-eslint/eslint-plugin": patch
---

Replace deprecated `context.getSourceCode()` calls with `context.sourceCode ?? context.getSourceCode()` fallback for ESLint 10 compatibility
