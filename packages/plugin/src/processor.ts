import { relative } from 'node:path';
import { Linter } from 'eslint';
import { GraphQLConfig } from 'graphql-config';
import {
  gqlPluckFromCodeStringSync,
  GraphQLTagPluckOptions,
} from '@graphql-tools/graphql-tag-pluck';
import { asArray } from '@graphql-tools/utils';
import { loadOnDiskGraphQLConfig } from './graphql-config.js';
import { version } from './meta.js';
import { CWD, REPORT_ON_FIRST_CHARACTER } from './utils.js';

export type Block = Linter.ProcessorFile & {
  lineOffset: number;
  offset: number;
};

const blocksMap = new Map<string, Block[]>();

let onDiskConfig: GraphQLConfig;
let onDiskConfigLoaded = false;

const RELEVANT_KEYWORDS = ['gql', 'graphql', 'GraphQL'] as const;

export const processor = {
  meta: {
    name: '@graphql-eslint/processor',
    version,
  },
  supportsAutofix: true,
  preprocess(code, filePath) {
    // A later buffer may skip or fail extraction, so never reuse its previous offsets.
    blocksMap.delete(filePath);
    if (process.env.ESLINT_USE_FLAT_CONFIG !== 'false' && filePath.endsWith('.vue')) {
      throw new Error(
        "Processing of `.vue` files is no longer supported, follow the new official vue example for ESLint's flat config https://github.com/graphql-hive/graphql-eslint/tree/master/examples/vue-code-file",
      );
    }
    if (!onDiskConfigLoaded) {
      onDiskConfig = loadOnDiskGraphQLConfig(filePath);
      onDiskConfigLoaded = true;
    }

    let keywords: ReadonlyArray<string> = RELEVANT_KEYWORDS;
    const pluckConfig: GraphQLTagPluckOptions =
      onDiskConfig?.getProjectForFile(filePath).extensions.pluckConfig;

    if (pluckConfig) {
      const {
        modules = [],
        globalGqlIdentifierName = ['gql', 'graphql'],
        gqlMagicComment = 'GraphQL',
      } = pluckConfig;

      const mods = modules.map(({ identifier }) => identifier).filter((v): v is string => !!v);

      const result = [...mods, ...asArray(globalGqlIdentifierName), gqlMagicComment];
      keywords = [...new Set(result)];
    }

    if (keywords.every(keyword => !code.includes(keyword))) {
      return [code];
    }

    try {
      const sources = gqlPluckFromCodeStringSync(filePath, code, {
        skipIndent: true,
        ...pluckConfig,
      });

      // Index in `code` where each line starts, using the same line terminators as Babel.
      // "a\nbc" -> [0, 2]; "a\r\nbc" -> [0, 3]
      const lineStarts = [
        0,
        ...Array.from(
          code.matchAll(/\r\n|[\r\n\u2028\u2029]/g),
          match => match.index + match[0].length,
        ),
      ];

      const blocks: Block[] = sources.map(item => ({
        filename: 'document.graphql',
        text: item.body,
        lineOffset: item.locationOffset.line - 1,
        // `locationOffset` has a 1-based line and column, and the offset is the index after the
        // start position:
        // "a\nbc" with { line: 2, column: 1 } -> lineStarts[1] + 1 = 3
        // "a\r\nbc" with { line: 2, column: 2 } -> lineStarts[1] + 2 = 5
        // "abc" with { line: 1, column: 3 } -> lineStarts[0] + 3 = 3
        offset: lineStarts[item.locationOffset.line - 1] + item.locationOffset.column,
      }));
      blocksMap.set(filePath, blocks);

      return [...blocks, code /* source code must be provided and be last */];
    } catch (error) {
      if (error instanceof Error) {
        error.message = `[graphql-eslint] Error while preprocessing "${relative(
          CWD,
          filePath,
        )}" file\n\n${error.message}`;
      }
      // eslint-disable-next-line no-console
      console.error(error);
      // in case of parsing error return code as is
      return [code];
    }
  },
  postprocess(messages, filePath) {
    const blocks = blocksMap.get(filePath) || [];
    for (let i = 0; i < blocks.length; i += 1) {
      const { lineOffset, offset } = blocks[i];

      for (const message of messages[i] || []) {
        const isVueOrSvelte = /\.(vue|svelte)$/.test(filePath);
        if (isVueOrSvelte) {
          // We can't show correct report location because after processing with
          // graphql-tag-pluck location is incorrect, disable fixes as well
          delete message.endLine;
          delete message.endColumn;
          delete message.fix;
          delete message.suggestions;
          Object.assign(message, REPORT_ON_FIRST_CHARACTER);
          continue;
        }

        message.line += lineOffset;
        // endLine can not exist if only `loc: { start, column }` was provided to context.report
        if (typeof message.endLine === 'number') {
          message.endLine += lineOffset;
        }
        if (message.fix) {
          message.fix.range[0] += offset;
          message.fix.range[1] += offset;
        }
        for (const suggestion of message.suggestions || []) {
          // DO NOT mutate until https://github.com/eslint/eslint/issues/16716
          const [start, end] = suggestion.fix.range;
          suggestion.fix.range = [start + offset, end + offset];
        }
      }
    }

    const result = messages.flat();
    // sort eslint/graphql-eslint messages by line/column
    return result.sort((a, b) => a.line - b.line || a.column - b.column);
  },
} satisfies Linter.Processor<Block | string>;
