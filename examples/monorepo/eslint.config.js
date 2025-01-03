import js from '@eslint/js';
import graphqlPlugin from '@graphql-eslint/eslint-plugin';

export default [
  {
    files: ['**/*.{js,tsx}'],
    rules: js.configs.recommended.rules,
  },
  {
    files: ['client/**/*.tsx'],
    // Setup processor for operations/fragments definitions on code-files
    processor: graphqlPlugin.processor,
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  {
    // Setup GraphQL Parser
    files: ['**/*.{graphql,gql}'],
    languageOptions: {
      parser: graphqlPlugin.parser,
    },
    plugins: {
      '@graphql-eslint': graphqlPlugin,
    },
  },
  {
    // Setup recommended config for schema files
    files: ['server/**/*.gql'],
    rules: graphqlPlugin.configs['flat/schema-recommended'].rules,
  },
  {
    // Setup recommended config for operations files
    files: ['client/**/*.{graphql,gql}'],
    rules: graphqlPlugin.configs['flat/operations-recommended'].rules,
  },
];
