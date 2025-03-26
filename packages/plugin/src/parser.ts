import debugFactory from 'debug';
import { buildSchema, GraphQLError } from 'graphql';
import { GraphQLProjectConfig, IGraphQLProject } from 'graphql-config';
import { parseGraphQLSDL, Source } from '@graphql-tools/utils';
import { getDocuments } from './documents.js';
import { convertToESTree, extractComments, extractTokens } from './estree-converter/index.js';
import { getFirstExistingPath, loadGraphQLConfig } from './graphql-config.js';
import { version } from './meta.js';
import { getSchema } from './schema.js';
import { getSiblings } from './siblings.js';
import { GraphQLESLintParseResult, ParserOptions, Schema } from './types.js';
import { CWD } from './utils.js';

const debug = debugFactory('graphql-eslint:parser');

debug('cwd %o', CWD);

const LEGACY_PARSER_OPTIONS_KEYS = [
  'schema',
  'documents',
  'extensions',
  'include',
  'exclude',
  'projects',
  'schemaOptions',
  'graphQLParserOptions',
  'skipGraphQLConfig',
  'operations',
] as const;

export function parseForESLint(code: string, options: ParserOptions): GraphQLESLintParseResult {
  for (const key of LEGACY_PARSER_OPTIONS_KEYS) {
    if (key in options) {
      throw new Error(
        `\`parserOptions.${key}\` was removed in graphql-eslint@4. Use physical graphql-config for setting schema and documents or \`parserOptions.graphQLConfig\` for programmatic usage.`,
      );
    }
  }

  try {
    const { filePath } = options;
    // First parse code from file, in case of syntax error do not try load schema,
    // documents or even graphql-config instance
    const { document } = parseGraphQLSDL(filePath, code, { noLocation: false });
    let project: GraphQLProjectConfig;
    let schema: Schema,
      documents: Source[] = [];

    if ('schemaSdl' in options) {
      schema = buildSchema(options.schemaSdl);
    } else {
      if (typeof window === 'undefined') {
        const gqlConfig = loadGraphQLConfig(options);
        project = gqlConfig.getProjectForFile(getFirstExistingPath(filePath));
        documents = getDocuments(project);
      } else {
        documents = [
          parseGraphQLSDL(
            'operation.graphql',
            (options.graphQLConfig as IGraphQLProject).documents as string,
            { noLocation: true },
          ),
        ];
      }

      try {
        if (typeof window === 'undefined') {
          schema = getSchema(project!);
        } else {
          schema = buildSchema((options.graphQLConfig as IGraphQLProject).schema as string);
        }
      } catch (error) {
        if (error instanceof Error) {
          error.message = `Error while loading schema: ${error.message}`;
        }
        throw error;
      }
    }

    const rootTree = convertToESTree(document, schema);

    return {
      services: {
        schema,
        siblingOperations: getSiblings(documents),
      },
      ast: {
        comments: extractComments(document.loc),
        tokens: extractTokens(filePath, code),
        loc: rootTree.loc,
        range: rootTree.range as [number, number],
        type: 'Program',
        sourceType: 'script',
        body: [rootTree as any],
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      error.message = `[graphql-eslint] ${error.message}`;
    }
    // In case of GraphQL parser error, we report it to ESLint as a parser error that matches the requirements
    // of ESLint. This will make sure to display it correctly in IDEs and lint results.
    if (error instanceof GraphQLError) {
      const location = error.locations?.[0];
      const eslintError = {
        index: error.positions?.[0],
        ...(location && {
          lineNumber: location.line,
          column: location.column - 1,
        }),
        message: error.message,
      };
      throw eslintError;
    }
    throw error;
  }
}

export const parser = {
  parseForESLint,
  meta: {
    name: '@graphql-eslint/parser',
    version,
  },
};
