import js from '@eslint/js';
import graphqlPlugin from '@graphql-eslint/eslint-plugin';

export default [
  {
    files: ['**/*.js'],
    processor: graphqlPlugin.processor,
    rules: {
      ...js.configs.recommended.rules,
      'no-console': 'error',
    },
  },
  {
    files: ['**/*.graphql'],
    languageOptions: {
      parser: graphqlPlugin.parser,
    },
    plugins: {
      '@graphql-eslint': graphqlPlugin,
    },
    rules: {
      '@graphql-eslint/no-anonymous-operations': 'error',
      '@graphql-eslint/naming-convention': [
        'error',
        {
          OperationDefinition: {
            style: 'PascalCase',
            forbiddenPrefixes: ['Query', 'Mutation', 'Subscription', 'Get'],
            forbiddenSuffixes: ['Query', 'Mutation', 'Subscription'],
          },
        },
      ],
    },
  },
];
