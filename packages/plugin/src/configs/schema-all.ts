/*
 * 🚨 IMPORTANT! Do not manually modify this file. Run: `pnpm generate:configs`
 */

import { Linter } from 'eslint';

export default {
  extends: './configs/schema-recommended',
  rules: {
    '@graphql-eslint/alphabetize': [
      'error',
      {
        definitions: true,
        fields: ['ObjectTypeDefinition', 'InterfaceTypeDefinition', 'InputObjectTypeDefinition'],
        values: true,
        arguments: ['FieldDefinition', 'Field', 'DirectiveDefinition', 'Directive'],
        groups: ['id', '*', 'createdAt', 'updatedAt'],
      },
    ],
    '@graphql-eslint/input-name': 'error',
    '@graphql-eslint/no-conflicting-union-member-fields': 'error',
    '@graphql-eslint/no-root-type': ['error', { disallow: ['mutation', 'subscription'] }],
    '@graphql-eslint/no-scalar-result-type-on-mutation': 'error',
    '@graphql-eslint/require-deprecation-date': 'error',
    '@graphql-eslint/require-field-of-type-query-in-mutation-result': 'error',
    '@graphql-eslint/require-nullable-fields-with-oneof': 'error',
    '@graphql-eslint/require-nullable-result-in-root': 'error',
    '@graphql-eslint/require-type-pattern-with-oneof': 'error',
  },
} satisfies Linter.LegacyConfig;
