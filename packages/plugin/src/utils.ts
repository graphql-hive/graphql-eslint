import { AST } from 'eslint';
import { Position } from 'estree';
import { ASTNode, GraphQLSchema, Kind } from 'graphql';
import lowerCase from 'lodash.lowercase';
import { GraphQLESTreeNode } from './estree-converter/index.js';
import { SiblingOperations } from './siblings.js';
import { GraphQLESLintRuleContext } from './types.js';

export function requireGraphQLOperations(
  ruleId: string,
  context: GraphQLESLintRuleContext,
): SiblingOperations | never {
  const { siblingOperations } = context.sourceCode.parserServices;
  if (!siblingOperations.available) {
    throw new Error(
      `Rule \`${ruleId}\` requires graphql-config \`documents\` field to be set and loaded. See https://the-guild.dev/graphql/eslint/docs/usage#providing-operations for more info`,
    );
  }
  return siblingOperations;
}

export function requireGraphQLSchema(
  ruleId: string,
  context: GraphQLESLintRuleContext,
): GraphQLSchema | never {
  const { schema } = context.sourceCode.parserServices;
  if (!schema) {
    throw new Error(
      `Rule \`${ruleId}\` requires graphql-config \`schema\` field to be set and loaded. See https://the-guild.dev/graphql/eslint/docs/usage#providing-schema for more info`,
    );
  }
  return schema;
}

const chalk = {
  red: (str: string) => `\x1b[31m${str}\x1b[39m`,
  yellow: (str: string) => `\x1b[33m${str}\x1b[39m`,
};

export const logger = {
  error: (...args: unknown[]) =>
    // eslint-disable-next-line no-console
    console.error(chalk.red('error'), '[graphql-eslint]', ...args),
  warn: (...args: unknown[]) =>
    // eslint-disable-next-line no-console
    console.warn(chalk.yellow('warning'), '[graphql-eslint]', ...args),
};

export const slash = (path: string): string => path.replaceAll('\\', '/');

// Match slash or backslash for Windows
export const VIRTUAL_DOCUMENT_REGEX = /[/\\]\d+_document.graphql$/;

export const CWD = process.cwd();

export const getTypeName = (node: ASTNode): string =>
  'type' in node ? getTypeName(node.type) : 'name' in node && node.name ? node.name.value : '';

export const TYPES_KINDS = [
  Kind.OBJECT_TYPE_DEFINITION,
  Kind.INTERFACE_TYPE_DEFINITION,
  Kind.ENUM_TYPE_DEFINITION,
  Kind.SCALAR_TYPE_DEFINITION,
  Kind.INPUT_OBJECT_TYPE_DEFINITION,
  Kind.UNION_TYPE_DEFINITION,
] as const;

export type CaseStyle = 'camelCase' | 'kebab-case' | 'PascalCase' | 'snake_case' | 'UPPER_CASE';

export const pascalCase = (str: string): string =>
  lowerCase(str)
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

export const camelCase = (str: string): string => {
  const result = pascalCase(str);
  return result.charAt(0).toLowerCase() + result.slice(1);
};

export const convertCase = (style: CaseStyle, str: string): string => {
  switch (style) {
    case 'camelCase':
      return camelCase(str);
    case 'PascalCase':
      return pascalCase(str);
    case 'snake_case':
      return lowerCase(str).replace(/ /g, '_');
    case 'UPPER_CASE':
      return lowerCase(str).replace(/ /g, '_').toUpperCase();
    case 'kebab-case':
      return lowerCase(str).replace(/ /g, '-');
  }
};

export function getLocation(start: Position, fieldName = ''): AST.SourceLocation {
  const { line, column } = start;
  return {
    start: {
      line,
      column,
    },
    end: {
      line,
      column: column + fieldName.length,
    },
  };
}

export const REPORT_ON_FIRST_CHARACTER = { column: 0, line: 1 };

export const ARRAY_DEFAULT_OPTIONS = {
  type: 'array',
  uniqueItems: true,
  minItems: 1,
  items: {
    type: 'string',
  },
} as const;

export const englishJoinWords = (words: string[]): string =>
  new Intl.ListFormat('en-US', { type: 'disjunction' }).format(words);

const DisplayNodeNameMap: Record<Kind, string> = {
  [Kind.ARGUMENT]: 'argument',
  [Kind.BOOLEAN]: 'boolean',
  [Kind.DIRECTIVE_DEFINITION]: 'directive',
  [Kind.DIRECTIVE]: 'directive',
  [Kind.DOCUMENT]: 'document',
  [Kind.ENUM_TYPE_DEFINITION]: 'enum',
  [Kind.ENUM_TYPE_EXTENSION]: 'enum',
  [Kind.ENUM_VALUE_DEFINITION]: 'enum value',
  [Kind.ENUM]: 'enum',
  [Kind.FIELD_DEFINITION]: 'field',
  [Kind.FIELD]: 'field',
  [Kind.FLOAT]: 'float',
  [Kind.FRAGMENT_DEFINITION]: 'fragment',
  [Kind.FRAGMENT_SPREAD]: 'fragment spread',
  [Kind.INLINE_FRAGMENT]: 'inline fragment',
  [Kind.INPUT_OBJECT_TYPE_DEFINITION]: 'input',
  [Kind.INPUT_OBJECT_TYPE_EXTENSION]: 'input',
  [Kind.INPUT_VALUE_DEFINITION]: 'input value',
  [Kind.INT]: 'int',
  [Kind.INTERFACE_TYPE_DEFINITION]: 'interface',
  [Kind.INTERFACE_TYPE_EXTENSION]: 'interface',
  [Kind.LIST_TYPE]: 'list type',
  [Kind.LIST]: 'list',
  [Kind.NAME]: 'name',
  [Kind.NAMED_TYPE]: 'named type',
  [Kind.NON_NULL_TYPE]: 'non-null type',
  [Kind.NULL]: 'null',
  [Kind.OBJECT_FIELD]: 'object field',
  [Kind.OBJECT_TYPE_DEFINITION]: 'type',
  [Kind.OBJECT_TYPE_EXTENSION]: 'type',
  [Kind.OBJECT]: 'object',
  [Kind.OPERATION_DEFINITION]: 'operation',
  [Kind.OPERATION_TYPE_DEFINITION]: 'operation type',
  [Kind.SCALAR_TYPE_DEFINITION]: 'scalar',
  [Kind.SCALAR_TYPE_EXTENSION]: 'scalar',
  [Kind.SCHEMA_DEFINITION]: 'schema',
  [Kind.SCHEMA_EXTENSION]: 'schema',
  [Kind.SELECTION_SET]: 'selection set',
  [Kind.STRING]: 'string',
  [Kind.UNION_TYPE_DEFINITION]: 'union',
  [Kind.UNION_TYPE_EXTENSION]: 'union',
  [Kind.VARIABLE_DEFINITION]: 'variable',
  [Kind.VARIABLE]: 'variable',
  // Kinds introduced in graphql v17 (string literals so the map also works with graphql v16)
  FragmentArgument: 'fragment argument',
  DirectiveExtension: 'directive',
  TypeCoordinate: 'type coordinate',
  MemberCoordinate: 'member coordinate',
  ArgumentCoordinate: 'argument coordinate',
  DirectiveCoordinate: 'directive coordinate',
  DirectiveArgumentCoordinate: 'directive argument coordinate',
} as const;

export function displayNodeName(node: GraphQLESTreeNode<ASTNode, boolean>): string {
  return `${
    node.kind === Kind.OPERATION_DEFINITION ? node.operation : DisplayNodeNameMap[node.kind]
    // @ts-expect-error -- fixme
  } "${('alias' in node && node.alias?.value) || ('name' in node && node.name?.value) || node.value}"`;
}

export function getNodeName(node: GraphQLESTreeNode<ASTNode>): string {
  switch (node.kind) {
    case Kind.OBJECT_TYPE_DEFINITION:
    case Kind.OBJECT_TYPE_EXTENSION:
    case Kind.INTERFACE_TYPE_DEFINITION:
    case Kind.ENUM_TYPE_DEFINITION:
    case Kind.SCALAR_TYPE_DEFINITION:
    case Kind.INPUT_OBJECT_TYPE_DEFINITION:
    case Kind.UNION_TYPE_DEFINITION:
    case Kind.DIRECTIVE_DEFINITION:
      return displayNodeName(node);
    case Kind.FIELD_DEFINITION:
    case Kind.INPUT_VALUE_DEFINITION:
    case Kind.ENUM_VALUE_DEFINITION:
      return `${displayNodeName(node)} in ${displayNodeName(node.parent)}`;
    case Kind.OPERATION_DEFINITION:
      return node.name ? displayNodeName(node) : node.operation;
  }
  return '';
}

export const eslintSelectorsTip = `> [!TIP]
>
> These fields are defined by ESLint [\`selectors\`](https://eslint.org/docs/developer-guide/selectors).
> Paste or drop code into the editor in [ASTExplorer](https://astexplorer.net) and inspect the generated AST to compose your selector.`;
