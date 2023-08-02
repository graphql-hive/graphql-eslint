import { defineConfig, Options } from 'tsup';
import fs from 'node:fs/promises';
import path from 'node:path';
import packageJson from './package.json';

const opts: Options = {
  entry: ['src/**/*.ts'],
  clean: true,
  bundle: false,
  dts: true,
  env: {
    IS_BROWSER: 'false',
    ...(process.env.NODE_ENV && { NODE_ENV: process.env.NODE_ENV }),
  },
  format: 'esm',
  minifySyntax: true,
};

const CWD = process.cwd();
export default defineConfig([
  {
    ...opts,
    outDir: 'dist/esm',
    outExtension: () => ({ js: '.js' }),
    async onSuccess() {
      await fs.copyFile(
        path.join(CWD, '..', '..', 'README.md'),
        path.join(CWD, 'dist', 'README.md'),
      );
      await fs.writeFile(path.join(CWD, 'dist', 'esm', 'package.json'), '{"type": "module"}');
      await fs.writeFile(
        path.join(CWD, 'dist', 'package.json'),
        JSON.stringify(
          {
            ...packageJson,
            devDependencies: undefined,
            scripts: undefined,
          },
          null,
          2,
        ).replaceAll('dist/', ''),
      );
      console.log('✅ Success!');
    },
  },
  {
    ...opts,
    format: 'cjs',
    outDir: 'dist/cjs',
  },
  {
    ...opts,
    entry: {
      'index.browser': 'src/index.browser.ts',
    },
    outDir: 'dist',
    dts: false,
    bundle: true,
    env: {
      NODE_ENV: 'production',
      IS_BROWSER: 'true',
    },
  },
]);
