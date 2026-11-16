import { ASTKindToNode, Kind, NameNode } from 'graphql';
import { FromSchema } from 'json-schema-to-ts';
import { GraphQLESTreeNode } from '../../estree-converter/index.js';
import { GraphQLESLintRule, GraphQLESLintRuleListener, ValueOf } from '../../types.js';
import {
  ARRAY_DEFAULT_OPTIONS,
  CaseStyle,
  convertCase,
  displayNodeName,
  englishJoinWords,
  TYPES_KINDS,
} from '../../utils.js';

const KindToDisplayName = {
  // types
  [Kind.OBJECT_TYPE_DEFINITION]: 'Type',
  [Kind.INTERFACE_TYPE_DEFINITION]: 'Interface',
  [Kind.ENUM_TYPE_DEFINITION]: 'Enumerator',
  [Kind.SCALAR_TYPE_DEFINITION]: 'Scalar',
  [Kind.INPUT_OBJECT_TYPE_DEFINITION]: 'Input type',
  [Kind.UNION_TYPE_DEFINITION]: 'Union',
  // fields
  [Kind.FIELD_DEFINITION]: 'Field',
  [Kind.INPUT_VALUE_DEFINITION]: 'Input property',
  [Kind.ARGUMENT]: 'Argument',
  [Kind.DIRECTIVE_DEFINITION]: 'Directive',
  // rest
  [Kind.ENUM_VALUE_DEFINITION]: 'Enumeration value',
  [Kind.OPERATION_DEFINITION]: 'Operation',
  [Kind.FRAGMENT_DEFINITION]: 'Fragment',
  [Kind.VARIABLE_DEFINITION]: 'Variable',
};

type AllowedKind = keyof typeof KindToDisplayName;
type AllowedStyle = 'camelCase' | 'PascalCase' | 'snake_case' | 'UPPER_CASE';

const StyleToRegex: Record<AllowedStyle, RegExp> = {
  camelCase: /^[a-z][\dA-Za-z]*$/,
  PascalCase: /^[A-Z][\dA-Za-z]*$/,
  snake_case: /^[a-z][\d_a-z]*[\da-z]*$/,
  UPPER_CASE: /^[A-Z][\dA-Z_]*[\dA-Z]*$/,
};

const ALLOWED_KINDS = Object.keys(KindToDisplayName).sort() as AllowedKind[];
const ALLOWED_STYLES = Object.keys(StyleToRegex) as AllowedStyle[];

const schemaOption = {
  oneOf: [{ $ref: '#/definitions/asString' }, { $ref: '#/definitions/asObject' }],
} as const;

const descriptionPrefixesSuffixes = (name: 'forbiddenPatterns' | 'requiredPattern', id: string) =>
  `> [!WARNING]
>
> This option is deprecated and will be removed in the next major release. Use [\`${name}\`](#${id}) instead.`;

const caseSchema = {
  enum: ALLOWED_STYLES,
  description: `One of: ${ALLOWED_STYLES.map(t => `\`${t}\``).join(', ')}`,
};

const schema = {
  definitions: {
    asString: caseSchema,
    asObject: {
      type: 'object',
      additionalProperties: false,
      properties: {
        style: caseSchema,
        prefix: { type: 'string' },
        suffix: { type: 'string' },
        forbiddenPatterns: {
          ...ARRAY_DEFAULT_OPTIONS,
          items: {
            type: 'object',
          },
          description: 'Should be of instance of `RegEx`',
        },
        requiredPattern: {
          type: 'object',
          description: 'Should be of instance of `RegEx`',
        },
        forbiddenPrefixes: {
          ...ARRAY_DEFAULT_OPTIONS,
          description: descriptionPrefixesSuffixes('forbiddenPatterns', 'forbiddenpatterns-array'),
        },
        forbiddenSuffixes: {
          ...ARRAY_DEFAULT_OPTIONS,
          description: descriptionPrefixesSuffixes('forbiddenPatterns', 'forbiddenpatterns-array'),
        },
        requiredPrefixes: {
          ...ARRAY_DEFAULT_OPTIONS,
          description: descriptionPrefixesSuffixes('requiredPattern', 'requiredpattern-object'),
        },
        requiredSuffixes: {
          ...ARRAY_DEFAULT_OPTIONS,
          description: descriptionPrefixesSuffixes('requiredPattern', 'requiredpattern-object'),
        },
        ignorePattern: {
          type: 'string',
          description: 'Option to skip validation of some words, e.g. acronyms',
        },
      },
    },
  },
  type: 'array',
  maxItems: 1,
  items: {
    type: 'object',
    additionalProperties: false,
    properties: {
      types: {
        ...schemaOption,
        description: `Includes:\n${TYPES_KINDS.map(kind => `- \`${kind}\``).join('\n')}`,
      },
      ...Object.fromEntries(
        ALLOWED_KINDS.map(kind => [
          kind,
          {
            ...schemaOption,
            description: `> [!NOTE]
>
> Read more about this kind on [spec.graphql.org](https://spec.graphql.org/October2021/#${kind}).`,
          },
        ]),
      ),
      allowLeadingUnderscore: {
        type: 'boolean',
        default: false,
      },
      allowTrailingUnderscore: {
        type: 'boolean',
        default: false,
      },
    },
    patternProperties: {
      [`^(${ALLOWED_KINDS.join('|')})(.+)?$`]: schemaOption,
    },
    description: [
      "> It's possible to use a [`selector`](https://eslint.org/docs/developer-guide/selectors) that starts with allowed `ASTNode` names which are described below.",
      '>',
      '> Paste or drop code into the editor in [ASTExplorer](https://astexplorer.net) and inspect the generated AST to compose your selector.',
      '>',
      '> Example: pattern property `FieldDefinition[parent.name.value=Query]` will match only fields for type `Query`.',
    ].join('\n'),
  },
} as const;

export type RuleOptions = FromSchema<typeof schema, { keepDefaultedPropertiesOptional: true }>;

type PropertySchema = {
  style?: AllowedStyle;
  suffix?: string;
  prefix?: string;
  forbiddenPatterns?: RegExp[];
  requiredPattern?: RegExp;
  forbiddenPrefixes?: string[];
  forbiddenSuffixes?: string[];
  requiredPrefixes?: string[];
  requiredSuffixes?: string[];
  ignorePattern?: string;
};

type Options = AllowedStyle | PropertySchema;

type AllowedKindToNode = Pick<ASTKindToNode, AllowedKind>;

export const rule: GraphQLESLintRule<RuleOptions> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require names to follow specified conventions.',
      category: 'Schema-and-operations',
      recommended: true,
      url: 'https://the-guild.dev/graphql/eslint/rules/naming-convention',
      examples: [
        {
          title: 'Incorrect',
          usage: [{ types: 'PascalCase', FieldDefinition: 'camelCase' }],
          code: /* GraphQL */ `
            type user {
              first_name: String!
            }
          `,
        },
        {
          title: 'Incorrect',
          usage: [
            {
              FragmentDefinition: {
                style: 'PascalCase',
                forbiddenPatterns: [/(^fragment)|(fragment$)/i],
              },
            },
          ],
          code: /* GraphQL */ `
            fragment UserFragment on User {
              # ...
            }
          `,
        },
        {
          title: 'Incorrect',
          usage: [{ 'FieldDefinition[parent.name.value=Query]': { forbiddenPatterns: [/^get/i] } }],
          code: /* GraphQL */ `
            type Query {
              getUsers: [User!]!
            }
          `,
        },
        {
          title: 'Correct',
          usage: [{ types: 'PascalCase', FieldDefinition: 'camelCase' }],
          code: /* GraphQL */ `
            type User {
              firstName: String
            }
          `,
        },
        {
          title: 'Correct',
          usage: [
            {
              FragmentDefinition: {
                style: 'PascalCase',
                forbiddenPatterns: [/(^fragment)|(fragment$)/i],
              },
            },
          ],
          code: /* GraphQL */ `
            fragment UserFields on User {
              # ...
            }
          `,
        },
        {
          title: 'Correct',
          usage: [{ 'FieldDefinition[parent.name.value=Query]': { forbiddenPatterns: [/^get/i] } }],
          code: /* GraphQL */ `
            type Query {
              users: [User!]!
            }
          `,
        },
        {
          title: 'Correct',
          usage: [{ FieldDefinition: { style: 'camelCase', ignorePattern: '^(EAN13|UPC|UK)' } }],
          code: /* GraphQL */ `
            type Product {
              EAN13: String
              UPC: String
              UKFlag: String
            }
          `,
        },
        {
          title: 'Correct',
          usage: [
            {
              'FieldDefinition[gqlType.name.value=Boolean]': {
                style: 'camelCase',
                requiredPattern: /^(is|has)/,
              },
              'FieldDefinition[gqlType.gqlType.name.value=Boolean]': {
                style: 'camelCase',
                requiredPattern: /^(is|has)/,
              },
            },
          ],
          code: /* GraphQL */ `
            type Product {
              isBackordered: Boolean
              isNew: Boolean!
              hasDiscount: Boolean!
            }
          `,
        },
        {
          title: 'Correct',
          usage: [
            {
              'FieldDefinition[gqlType.gqlType.name.value=SensitiveSecret]': {
                style: 'camelCase',
                requiredPattern: /SensitiveSecret$/,
              },
            },
          ],
          code: /* GraphQL */ `
            scalar SensitiveSecret

            type Account {
              accountSensitiveSecret: SensitiveSecret!
            }
          `,
        },
        {
          title: 'Correct (Relay fragment convention `<module_name>_<property_name>`)',
          usage: [
            {
              FragmentDefinition: {
                style: 'PascalCase',
                requiredPattern: /_(?<camelCase>.+?)$/,
              },
            },
          ],
          code: /* GraphQL */ `
            # schema
            type User {
              # ...
            }
            # operations
            fragment UserFields_data on User {
              # ...
            }
          `,
        },
      ],
      configOptions: {
        schema: [
          {
            types: 'PascalCase',
            FieldDefinition: 'camelCase',
            InputValueDefinition: 'camelCase',
            Argument: 'camelCase',
            DirectiveDefinition: 'camelCase',
            EnumValueDefinition: 'UPPER_CASE',
            'FieldDefinition[parent.name.value=Query]': {
              forbiddenPatterns: [/^(query|get)/i, /query$/i],
            },
            'FieldDefinition[parent.name.value=Mutation]': {
              forbiddenPatterns: [/(^mutation)|(mutation$)/i],
            },
            'FieldDefinition[parent.name.value=Subscription]': {
              forbiddenPatterns: [/(^subscription)|(subscription$)/i],
            },
            'EnumTypeDefinition,EnumTypeExtension': {
              forbiddenPatterns: [/(^enum)|(enum$)/i],
            },
            'InterfaceTypeDefinition,InterfaceTypeExtension': {
              forbiddenPatterns: [/(^interface)|(interface$)/i],
            },
            'UnionTypeDefinition,UnionTypeExtension': {
              forbiddenPatterns: [/(^union)|(union$)/i],
            },
            'ObjectTypeDefinition,ObjectTypeExtension': {
              forbiddenPatterns: [/(^type)|(type$)/i],
            },
          },
        ],
        operations: [
          {
            VariableDefinition: 'camelCase',
            OperationDefinition: {
              style: 'PascalCase',
              forbiddenPatterns: [
                /^(query|mutation|subscription|get)/i,
                /(query|mutation|subscription)$/i,
              ],
            },
            FragmentDefinition: {
              style: 'PascalCase',
              forbiddenPatterns: [/(^fragment)|(fragment$)/i],
            },
          },
        ],
      },
    },
    hasSuggestions: true,
    schema,
  },
  create(context) {
    const options = context.options[0] || {};
    const { allowLeadingUnderscore, allowTrailingUnderscore, types, ...restOptions } = options;
    const ignoredNodes = new Set<unknown>();

    function normalisePropertyOption(kind: string): PropertySchema {
      const style = (restOptions[kind] || types) as Options;
      return typeof style === 'object' ? style : { style };
    }

    function report(
      node: GraphQLESTreeNode<NameNode>,
      message: string,
      suggestedNames: string[],
    ): void {
      context.report({
        node,
        message,
        suggest: suggestedNames.map(suggestedName => ({
          desc: `Rename to \`${suggestedName}\``,
          fix: fixer => fixer.replaceText(node as any, suggestedName),
        })),
      });
    }

    const checkNode = (selector: string) => (n: GraphQLESTreeNode<ValueOf<AllowedKindToNode>>) => {
      const { name: node } = n.kind === Kind.VARIABLE_DEFINITION ? n.variable : n;
      if (!node) {
        return;
      }
      const {
        prefix,
        suffix,
        forbiddenPrefixes,
        forbiddenSuffixes,
        style,
        ignorePattern,
        requiredPrefixes,
        requiredSuffixes,
        forbiddenPatterns,
        requiredPattern,
      } = normalisePropertyOption(selector);
      const nodeName = node.value;
      const error = getError();
      if (error) {
        const { errorMessage, renameToNames } = error;
        const [leadingUnderscores] = nodeName.match(/^_*/) as RegExpMatchArray;
        const [trailingUnderscores] = nodeName.match(/_*$/) as RegExpMatchArray;
        const suggestedNames = renameToNames.map(
          renameToName => leadingUnderscores + renameToName + trailingUnderscores,
        );
        const name = displayNodeName(n);
        report(
          node,
          `${name[0].toUpperCase()}${name.slice(1)} should ${errorMessage}`,
          suggestedNames,
        );
      }

      function getError(): {
        errorMessage: string;
        renameToNames: string[];
      } | void {
        let name = nodeName;
        if (allowLeadingUnderscore) name = name.replace(/^_+/, '');
        if (allowTrailingUnderscore) name = name.replace(/_+$/, '');
        if (ignorePattern && new RegExp(ignorePattern, 'u').test(name)) {
          if ('name' in n) {
            ignoredNodes.add(n.name);
          }
          return;
        }
        if (prefix && !name.startsWith(prefix)) {
          return {
            errorMessage: `have "${prefix}" prefix`,
            renameToNames: [prefix + name],
          };
        }
        if (suffix && !name.endsWith(suffix)) {
          return {
            errorMessage: `have "${suffix}" suffix`,
            renameToNames: [name + suffix],
          };
        }
        if (requiredPattern) {
          if (requiredPattern.source.includes('(?<')) {
            try {
              name = name.replace(requiredPattern, (originalString, ...args) => {
                const groups = args.at(-1);
                // eslint-disable-next-line no-unreachable-loop -- expected
                for (const [styleName, value] of Object.entries(groups)) {
                  if (!(styleName in StyleToRegex)) {
                    throw new Error('Invalid case style in `requiredPatterns` option');
                  }
                  if (value === convertCase(styleName as CaseStyle, value as string)) {
                    return '';
                  }
                  throw new Error(`contain the required pattern: ${requiredPattern}`);
                }
                return originalString;
              });
              if (name === nodeName) {
                throw new Error(`contain the required pattern: ${requiredPattern}`);
              }
            } catch (error) {
              return {
                errorMessage: (error as Error).message,
                renameToNames: [],
              };
            }
          } else if (!requiredPattern.test(name)) {
            return {
              errorMessage: `contain the required pattern: ${requiredPattern}`,
              renameToNames: [],
            };
          }
        }
        const forbidden = forbiddenPatterns?.find(pattern => pattern.test(name));
        if (forbidden) {
          return {
            errorMessage: `not contain the forbidden pattern "${forbidden}"`,
            renameToNames: [name.replace(forbidden, '')],
          };
        }
        const forbiddenPrefix = forbiddenPrefixes?.find(prefix => name.startsWith(prefix));
        if (forbiddenPrefix) {
          return {
            errorMessage: `not have "${forbiddenPrefix}" prefix`,
            renameToNames: [name.replace(new RegExp(`^${forbiddenPrefix}`), '')],
          };
        }
        const forbiddenSuffix = forbiddenSuffixes?.find(suffix => name.endsWith(suffix));
        if (forbiddenSuffix) {
          return {
            errorMessage: `not have "${forbiddenSuffix}" suffix`,
            renameToNames: [name.replace(new RegExp(`${forbiddenSuffix}$`), '')],
          };
        }
        if (
          requiredPrefixes &&
          !requiredPrefixes.some(requiredPrefix => name.startsWith(requiredPrefix))
        ) {
          return {
            errorMessage: `have one of the following prefixes: ${englishJoinWords(
              requiredPrefixes,
            )}`,
            renameToNames: style
              ? requiredPrefixes.map(prefix => convertCase(style, `${prefix} ${name}`))
              : requiredPrefixes.map(prefix => `${prefix}${name}`),
          };
        }
        if (
          requiredSuffixes &&
          !requiredSuffixes.some(requiredSuffix => name.endsWith(requiredSuffix))
        ) {
          return {
            errorMessage: `have one of the following suffixes: ${englishJoinWords(
              requiredSuffixes,
            )}`,
            renameToNames: style
              ? requiredSuffixes.map(suffix => convertCase(style, `${name} ${suffix}`))
              : requiredSuffixes.map(suffix => `${name}${suffix}`),
          };
        }
        // Style is optional
        if (!style) {
          return;
        }
        const caseRegex = StyleToRegex[style];
        if (!caseRegex.test(name)) {
          return {
            errorMessage: `be in ${style} format`,
            renameToNames: [convertCase(style, name)],
          };
        }
      }
    };

    const checkUnderscore = (isLeading: boolean) => (node: GraphQLESTreeNode<NameNode>) => {
      if (ignoredNodes.has(node)) {
        return;
      }
      if (node.parent.kind === 'Field' && node.parent.alias !== node) {
        return;
      }
      const suggestedName = node.value.replace(isLeading ? /^_+/ : /_+$/, '');
      report(node, `${isLeading ? 'Leading' : 'Trailing'} underscores are not allowed`, [
        suggestedName,
      ]);
    };

    const listeners: GraphQLESLintRuleListener = {};

    if (!allowLeadingUnderscore) {
      listeners['Name[value=/^_/]'] = checkUnderscore(true);
    }
    if (!allowTrailingUnderscore) {
      listeners['Name[value=/_$/]'] = checkUnderscore(false);
    }

    const selectors = new Set(
      [types && TYPES_KINDS, Object.keys(restOptions)].filter(v => !!v).flat(),
    );

    for (const selector of selectors) {
      listeners[selector] = checkNode(selector);
    }
    return listeners;
  },
};
