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
      files: ['website/**'],
      extends: [
        '@theguild/eslint-config/react',
        '@theguild/eslint-config/mdx',
        'plugin:tailwindcss/recommended',
      ],
      rules: {
        'tailwindcss/classnames-order': 'off',
        'tailwindcss/enforces-negative-arbitrary-values': 'error',
        'tailwindcss/enforces-shorthand': 'error',
        'tailwindcss/migration-from-tailwind-2': 'error',
        'tailwindcss/no-custom-classname': [
          'error',
          {
            // TODO: figure out why there is an error only on CI
            whitelist: [
              'nextra-scrollbar',
              '_text-primary-600',
              '_underline',
              '_decoration-from-font',
            ],
          },
        ],
        'react/no-unknown-property': ['error', { ignore: ['jsx', 'global'] }],
      },
      settings: {
        tailwindcss: {
          config: 'website/tailwind.config.ts',
        },
      },
    },
    {
      files: ['website/**/*.mdx'],
      rules: {
        // TODO: remove `# {frontMatter.title}` and this override
        '@typescript-eslint/no-unused-expressions': 'off',
        'no-undef': 'off',
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
