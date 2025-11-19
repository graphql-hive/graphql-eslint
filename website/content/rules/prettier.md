# `prettier` Rule

`eslint-plugin-prettier` supports `.graphql` files, and `v4.1.0` supports `graphql` blocks even
better. You need to do the following:

```json filename=".eslintrc.json"
{
  "overrides": [
    {
      "files": ["*.js"],
      "processor": "@graphql-eslint/graphql",
      "extends": ["plugin:prettier/recommended"]
    },
    {
      "files": ["*.graphql"],
      "parser": "@graphql-eslint/eslint-plugin",
      "plugins": ["@graphql-eslint"],
      "rules": {
        "prettier/prettier": "error"
      }
    }
  ]
}
```

You can take
[`this repository`](https://github.com/graphql-hive/graphql-eslint/tree/master/examples/prettier) as
example.
