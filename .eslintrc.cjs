module.exports = {
  ignorePatterns: ['examples', 'packages/plugin/__tests__/__snapshots__'],
  extends: [
    '@theguild',
    '@theguild/eslint-config/json',
    '@theguild/eslint-config/yml',
    '@theguild/eslint-config/mdx',
  ],
  rules: {
    'unicorn/prefer-array-some': 'error',
    'prefer-destructuring': ['error', { VariableDeclarator: { object: true } }],
    quotes: ['error', 'single', { avoidEscape: true }], // Matches Prettier, but also replaces backticks
  },
  overrides: [
    {
      files: ['**/*.{,c,m}ts{,x}'],
      excludedFiles: ['**/*.md{,x}/*'],
      // extends: [
      //   'plugin:@typescript-eslint/recommended-requiring-type-checking',
      //   'plugin:@typescript-eslint/strict',
      //   'prettier',
      // ],
      rules: {
        '@typescript-eslint/no-unnecessary-type-assertion': 'error',
        '@typescript-eslint/no-explicit-any': 'off', // too strict
        '@typescript-eslint/no-non-null-assertion': 'off', // too strict
        '@typescript-eslint/array-type': ['error', { readonly: 'generic' }],
        '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'no-type-imports' }],
      },
    },
    {
      files: ['**/rules/*.ts'],
      extends: ['plugin:eslint-plugin/rules-recommended'],
      rules: {
        'eslint-plugin/require-meta-docs-url': [
          'error',
          { pattern: 'https://the-guild.dev/graphql/eslint/rules/{{name}}' },
        ],
        'eslint-plugin/prefer-message-ids': 'off',
      },
    },
    {
      files: ['**/*.{spec,test}.ts'],
      extends: ['plugin:eslint-plugin/tests-recommended'],
      rules: {
        'eslint-plugin/test-case-shorthand-strings': 'error',
        'import/extensions': 'off',
      },
    },
    {
      files: ['**/__tests__/mocks/**/*.{ts,js}'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
    {
      files: ['scripts/**', '**/tsup.config.ts'],
      rules: {
        'no-console': 'off',
      },
      env: {
        node: true,
      },
    },
    {
      files: ['packages/plugin/src/rules/index.ts'],
      rules: {
        // file is generated
        'simple-import-sort/imports': 'off',
      },
    },
    {
      files: ['packages/plugin/src/configs/*.ts'],
      rules: {
        // eslint looks for export default
        'import/no-default-export': 'off',
      },
    },
    {
      files: ['website/**/*.mdx'],
      rules: {
        // The docs are rendered by Astro (the-guild-org/website), not React:
        // markup uses plain HTML and SVG attribute names.
        'react/no-unknown-property': 'off',
      },
    },
    {
      files: ['website/**/*.mdx/**'],
      rules: {
        'import/no-default-export': 'off',
        'no-dupe-keys': 'off', // Usage examples contains duplicate keys
      },
    },
  ],
};
