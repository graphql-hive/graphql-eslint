/* eslint sort-keys: error */
import { defineConfig, PRODUCTS } from '@theguild/components';

export default defineConfig({
  description: PRODUCTS.ESLINT.title,
  docsRepositoryBase: 'https://github.com/B2o5T/graphql-eslint/tree/master/website', // base URL for the docs repository
  backgroundColor: {
    dark: '15,17,20',
    light: '250,250,250',
  },
  logo: PRODUCTS.ESLINT.logo({ className: 'w-9' }),
  websiteName: 'GraphQL-ESLint',
});
