---
'@graphql-eslint/eslint-plugin': patch
---

Update `@graphql-tools/utils` to v12.0.2, which fixes a prototype pollution vulnerability in
`mergeIncrementalResult` ([GHSA-c4qx-w738-7hr3](https://github.com/advisories/GHSA-c4qx-w738-7hr3)).
The vulnerable versions are `>= 10.10.1` and `<= 12.0.1`, which the previous `^10.0.0` range
allowed.
