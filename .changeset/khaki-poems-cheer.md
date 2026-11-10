---
'@graphql-eslint/eslint-plugin': patch
---

Decide whether the schema/document cache may skip its freshness check by looking at the process
entry point instead of `process.env.NODE`.

`NODE` is set by npm and pnpm for every lifecycle script they run, so it meant "launched from a
package-manager script" rather than "one-shot ESLint CLI run". As a result, long-lived processes
started with `npm run` / `pnpm run` (lint watchers, language servers, editor tasks) never expired
the cache and kept linting against a stale schema, while runs started as `npx eslint` or
`./node_modules/.bin/eslint` still expired entries mid-run.
