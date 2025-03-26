---
'@graphql-eslint/eslint-plugin': minor
---

Improve `parseForESLint` API and allow to pass context schema as inline string.

You can now use it this way:

```ts
parseForESLint(code, { schemaSdl: "type Query { foo: String }", filePath: 'test.graphql' });
```
