import fs from 'node:fs/promises';
import path from 'node:path';
import {
  compileMdx,
  useMDXComponents as getDocsMDXComponents,
  MDXRemote,
} from '@theguild/components/server';

const docsComponents = getDocsMDXComponents({
  async ESLintConfigs({
    gitFolder,
    additionalFiles,
  }: {
    gitFolder: string;
    additionalFiles: Record<string, string>;
  }) {
    const user = 'graphql-hive';
    const repo = 'graphql-eslint';
    const branch = 'master';
    const docsPath = path.join(process.cwd(), '..', 'examples', gitFolder);

    const promises = Object.entries({
      ...additionalFiles,
      'ESLint Flat Config': 'eslint.config.js',
    }).map(async ([heading, filePath]) => {
      const { ext } = path.parse(filePath);
      return `## ${heading}

\`\`\`${ext.slice(1)} filename="${filePath}"
${(await fs.readFile(`${docsPath}/${filePath}`, 'utf8')).trim()}
\`\`\``;
    });
    const files = await Promise.all(promises);

    const hasLegacyConfig = await fs
      .access(`${docsPath}/.eslintrc.cjs`)
      .then(() => true)
      .catch(() => false);

    const legacyConfig = hasLegacyConfig
      ? `## ESLint Legacy Config

> [!WARNING]
>
> An eslintrc configuration file, is deprecated and support will be removed in ESLint v10.0.0. Migrate to an [\`eslint.config.js\` file](#eslint-flat-config)

\`\`\`js filename=".eslintrc.cjs"
${(await fs.readFile(`${docsPath}/.eslintrc.cjs`, 'utf8')).trim()}
\`\`\``
      : '';

    return (
      <MDXRemote
        compiledSource={await compileMdx(`
> [!NOTE]
>
> Check out
> [the official example${hasLegacyConfig ? 's' : ''}](https://github.com/${user}/${repo}/tree/${branch}/examples/${gitFolder})
> for
> [ESLint Flat Config](https://github.com/${user}/${repo}/blob/${branch}/examples/${gitFolder}/eslint.config.js)
${hasLegacyConfig ? `> or [ESLint Legacy Config](https://github.com/${user}/${repo}/blob/${branch}/examples/${gitFolder}/.eslintrc.cjs).` : '>.'}

${files.join('\n')}

${legacyConfig}`)}
      />
    );
  },
});

export const useMDXComponents: typeof getDocsMDXComponents = components => ({
  ...docsComponents,
  ...components,
});
