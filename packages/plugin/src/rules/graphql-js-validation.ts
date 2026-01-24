import { AST } from 'eslint';
import {
  ASTVisitor,
  DirectiveNode,
  DocumentNode,
  ExecutableDefinitionNode,
  FragmentDefinitionNode,
  GraphQLSchema,
  Kind,
  validate,
  ValidationRule,
  visit,
} from 'graphql';
import {
  ExecutableDefinitionsRule,
  FieldsOnCorrectTypeRule,
  FragmentsOnCompositeTypesRule,
  KnownArgumentNamesRule,
  KnownDirectivesRule,
  KnownFragmentNamesRule,
  KnownTypeNamesRule,
  LoneAnonymousOperationRule,
  LoneSchemaDefinitionRule,
  NoFragmentCyclesRule,
  NoUndefinedVariablesRule,
  NoUnusedFragmentsRule,
  NoUnusedVariablesRule,
  OverlappingFieldsCanBeMergedRule,
  PossibleFragmentSpreadsRule,
  PossibleTypeExtensionsRule,
  ProvidedRequiredArgumentsRule,
  ScalarLeafsRule,
  SingleFieldSubscriptionsRule,
  UniqueArgumentNamesRule,
  UniqueDirectiveNamesRule,
  UniqueDirectivesPerLocationRule,
  // UniqueEnumValueNamesRule, -- Superseded by graphql-eslint's `unique-enum-value-names` rule
  UniqueFieldDefinitionNamesRule,
  UniqueInputFieldNamesRule,
  UniqueOperationTypesRule,
  UniqueTypeNamesRule,
  UniqueVariableNamesRule,
  ValuesOfCorrectTypeRule,
  VariablesAreInputTypesRule,
  VariablesInAllowedPositionRule,
} from 'graphql/validation/index.js';
import { validateSDL } from 'graphql/validation/validate.js';
import { SDLValidationRule } from 'graphql/validation/ValidationContext.js';
import { JSONSchema } from 'json-schema-to-ts';
import { GraphQLESLintRule, GraphQLESLintRuleContext, RuleDocsInfo } from '../types.js';
import {
  ARRAY_DEFAULT_OPTIONS,
  REPORT_ON_FIRST_CHARACTER,
  requireGraphQLOperations,
  requireGraphQLSchema,
} from '../utils.js';

type GraphQLJSRule = ValidationRule | SDLValidationRule;

function validateDocument({
  context,
  schema = null,
  documentNode,
  rule,
  hasDidYouMeanSuggestions,
}: {
  context: GraphQLESLintRuleContext;
  schema: GraphQLSchema | null;
  documentNode: DocumentNode;
  rule: GraphQLJSRule;
  hasDidYouMeanSuggestions?: boolean;
}): void {
  if (documentNode.definitions.length === 0) {
    return;
  }
  try {
    const validationErrors = schema
      ? validate(schema, documentNode, [rule as ValidationRule])
      : validateSDL(documentNode, null, [rule as any]);

    for (const error of validationErrors) {
      const { line, column } = error.locations![0];
      const sourceCode = context.getSourceCode();
      const { tokens } = sourceCode.ast;
      const token = tokens.find(
        token => token.loc.start.line === line && token.loc.start.column === column - 1,
      );

      let loc: AST.SourceLocation | { line: number; column: number } = {
        line,
        column: column - 1,
      };
      if (token) {
        loc =
          // if cursor on `@` symbol than use next node
          (token.type as any) === '@'
            ? sourceCode.getNodeByRangeIndex(token.range[1] + 1)!.loc!
            : token.loc;
      }
      const didYouMeanContent = error.message.match(/Did you mean (?<content>.*)\?$/)?.groups!
        .content;
      const matches = didYouMeanContent ? [...didYouMeanContent.matchAll(/"(?<name>[^"]*)"/g)] : [];

      context.report({
        loc,
        message: error.message,
        suggest: hasDidYouMeanSuggestions
          ? matches.map(match => {
              const { name } = match.groups!;
              return {
                desc: `Rename to \`${name}\``,
                fix: fixer => fixer.replaceText(token!, name),
              };
            })
          : [],
      });
    }
  } catch (error) {
    context.report({
      loc: REPORT_ON_FIRST_CHARACTER,
      message: (error as Error).message,
    });
  }
}

type GetFragmentDefsAndFragmentSpreads = {
  fragmentDefs: Set<string>;
  fragmentSpreads: Set<string>;
};

const getFragmentDefsAndFragmentSpreads = (
  node: DocumentNode,
): GetFragmentDefsAndFragmentSpreads => {
  const fragmentDefs = new Set<string>();
  const fragmentSpreads = new Set<string>();

  const visitor: ASTVisitor = {
    FragmentDefinition(node) {
      fragmentDefs.add(node.name.value);
    },
    FragmentSpread(node) {
      fragmentSpreads.add(node.name.value);
    },
  };

  visit(node, visitor);
  return { fragmentDefs, fragmentSpreads };
};

const getMissingFragments = (node: DocumentNode): string[] => {
  const { fragmentDefs, fragmentSpreads } = getFragmentDefsAndFragmentSpreads(node);
  return [...fragmentSpreads].filter(name => !fragmentDefs.has(name));
};

type GetDocumentNode = (props: {
  ruleId: string;
  context: GraphQLESLintRuleContext;
  node: DocumentNode;
}) => DocumentNode;

const handleMissingFragments: GetDocumentNode = ({ ruleId, context, node }) => {
  const missingFragments = getMissingFragments(node);
  if (missingFragments.length > 0) {
    const siblings = requireGraphQLOperations(ruleId, context);
    const fragmentsToAdd: FragmentDefinitionNode[] = [];

    for (const fragmentName of missingFragments) {
      const [foundFragment] = siblings.getFragment(fragmentName).map(source => source.document);
      if (foundFragment) {
        fragmentsToAdd.push(foundFragment);
      }
    }

    if (fragmentsToAdd.length > 0) {
      // recall fn to make sure to add fragments inside fragments
      return handleMissingFragments({
        ruleId,
        context,
        node: {
          kind: Kind.DOCUMENT,
          definitions: [...node.definitions, ...fragmentsToAdd],
        },
      });
    }
  }
  return node;
};

const validationToRule = (
  {
    ruleId,
    rule,
    getDocumentNode,
    schema = [],
    hasDidYouMeanSuggestions,
  }: {
    ruleId: string;
    rule: GraphQLJSRule;
    getDocumentNode?: GetDocumentNode;
    schema?: JSONSchema | [];
    hasDidYouMeanSuggestions?: boolean;
  },
  docs: RuleDocsInfo<any>,
): Record<typeof ruleId, GraphQLESLintRule<[], true>> => {
  return {
    [ruleId]: {
      meta: {
        docs: {
          recommended: true,
          ...docs,
          graphQLJSRuleName: rule.name,
          url: `https://the-guild.dev/graphql/eslint/rules/${ruleId}`,
          description: `${docs.description}\n> This rule is a wrapper around a \`graphql-js\` validation function.`,
        },
        schema,
        hasSuggestions: hasDidYouMeanSuggestions,
      },
      create(context) {
        return {
          Document(node) {
            const schema = docs.requiresSchema ? requireGraphQLSchema(ruleId, context) : null;

            const documentNode = getDocumentNode
              ? getDocumentNode({ ruleId, context, node: node.rawNode() })
              : node.rawNode();

            validateDocument({
              context,
              schema,
              documentNode,
              rule,
              hasDidYouMeanSuggestions,
            });
          },
        };
      },
    },
  };
};

export const GRAPHQL_JS_VALIDATIONS: Record<string, GraphQLESLintRule> = Object.assign(
  {},
  validationToRule(
    {
      ruleId: 'executable-definitions',
      rule: ExecutableDefinitionsRule,
    },
    {
      category: 'Operations',
      description:
        'A GraphQL document is only valid for execution if all definitions are either operation or fragment definitions.',
      requiresSchema: true,
    },
  ),
  validationToRule(
    {
      ruleId: 'fields-on-correct-type',
      rule: FieldsOnCorrectTypeRule,
      hasDidYouMeanSuggestions: true,
    },
    {
      category: 'Operations',
      description:
        'A GraphQL document is only valid if all fields selected are defined by the parent type, or are an allowed meta field such as `__typename`.',
      requiresSchema: true,
    },
  ),
  validationToRule(
    {
      ruleId: 'fragments-on-composite-type',
      rule: FragmentsOnCompositeTypesRule,
    },
    {
      category: 'Operations',
      description:
        'Fragments use a type condition to determine if they apply, since fragments can only be spread into a composite type (object, interface, or union), the type condition must also be a composite type.',
      requiresSchema: true,
    },
  ),
  validationToRule(
    {
      ruleId: 'known-argument-names',
      rule: KnownArgumentNamesRule,
      hasDidYouMeanSuggestions: true,
    },
    {
      category: ['Schema', 'Operations'],
      description:
        'A GraphQL field is only valid if all supplied arguments are defined by that field.',
      requiresSchema: true,
    },
  ),
  validationToRule(
    {
      ruleId: 'known-directives',
      rule: KnownDirectivesRule,
      getDocumentNode({ context, node: documentNode }) {
        const { ignoreClientDirectives = [] } = context.options[0] || {};
        if (ignoreClientDirectives.length === 0) {
          return documentNode;
        }

        const filterDirectives = (node: { directives?: ReadonlyArray<DirectiveNode> }) => ({
          ...node,
          directives: node.directives?.filter(
            directive => !ignoreClientDirectives.includes(directive.name.value),
          ),
        });

        return visit(documentNode, {
          Field: filterDirectives,
          FragmentDefinition: filterDirectives,
          FragmentSpread: filterDirectives,
          InlineFragment: filterDirectives,
          OperationDefinition: filterDirectives,
        });
      },
      schema: {
        type: 'array',
        maxItems: 1,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['ignoreClientDirectives'],
          properties: {
            ignoreClientDirectives: ARRAY_DEFAULT_OPTIONS,
          },
        },
      },
    },
    {
      category: ['Schema', 'Operations'],
      description:
        'A GraphQL document is only valid if all `@directive`s are known by the schema and legally positioned.',
      requiresSchema: true,
      examples: [
        {
          title: 'Valid',
          usage: [{ ignoreClientDirectives: ['client'] }],
          code: /* GraphQL */ `
            {
              product {
                someClientField @client
              }
            }
          `,
        },
      ],
    },
  ),
  validationToRule(
    {
      ruleId: 'known-fragment-names',
      rule: KnownFragmentNamesRule,
      getDocumentNode: handleMissingFragments,
    },
    {
      category: 'Operations',
      description:
        'A GraphQL document is only valid if all `...Fragment` fragment spreads refer to fragments defined in the same document.',
      requiresSchema: true,
      requiresSiblings: true,
      examples: [
        {
          title: 'Incorrect',
          code: /* GraphQL */ `
            query {
              user {
                id
                ...UserFields # fragment not defined in the document
              }
            }
          `,
        },
        {
          title: 'Correct',
          code: /* GraphQL */ `
            fragment UserFields on User {
              firstName
              lastName
            }

            query {
              user {
                id
                ...UserFields
              }
            }
          `,
        },
        {
          title: 'Correct (`UserFields` fragment located in a separate file)',
          code: /* GraphQL */ `
            # user.gql
            query {
              user {
                id
                ...UserFields
              }
            }

            # user-fields.gql
            fragment UserFields on User {
              id
            }
          `,
        },
      ],
    },
  ),
  validationToRule(
    {
      ruleId: 'known-type-names',
      rule: KnownTypeNamesRule,
      hasDidYouMeanSuggestions: true,
    },
    {
      category: ['Schema', 'Operations'],
      description:
        'A GraphQL document is only valid if referenced types (specifically variable definitions and fragment conditions) are defined by the type schema.',
      requiresSchema: true,
    },
  ),
  validationToRule(
    {
      ruleId: 'lone-anonymous-operation',
      rule: LoneAnonymousOperationRule,
    },
    {
      category: 'Operations',
      description:
        'A GraphQL document that contains an anonymous operation (the `query` short-hand) is only valid if it contains only that one operation definition.',
      requiresSchema: true,
    },
  ),
  validationToRule(
    {
      ruleId: 'lone-schema-definition',
      rule: LoneSchemaDefinitionRule,
    },
    {
      category: 'Schema',
      description: 'A GraphQL document is only valid if it contains only one schema definition.',
    },
  ),
  validationToRule(
    {
      ruleId: 'no-fragment-cycles',
      rule: NoFragmentCyclesRule,
    },
    {
      category: 'Operations',
      description:
        'A GraphQL fragment is only valid when it does not have cycles in fragments usage.',
      requiresSchema: true,
    },
  ),
  validationToRule(
    {
      ruleId: 'no-undefined-variables',
      rule: NoUndefinedVariablesRule,
      getDocumentNode: handleMissingFragments,
    },
    {
      category: 'Operations',
      description:
        'A GraphQL operation is only valid if all variables encountered, both directly and via fragment spreads, are defined by that operation.',
      requiresSchema: true,
      requiresSiblings: true,
    },
  ),
  validationToRule(
    {
      ruleId: 'no-unused-fragments',
      rule: NoUnusedFragmentsRule,
      getDocumentNode: ({ ruleId, context, node }) => {
        const siblings = requireGraphQLOperations(ruleId, context);
        const FilePathToDocumentsMap = [
          ...siblings.getOperations(),
          ...siblings.getFragments(),
        ].reduce<Record<string, ExecutableDefinitionNode[]>>((map, { filePath, document }) => {
          map[filePath] ??= [];
          map[filePath].push(document);
          return map;
        }, Object.create(null));

        const getParentNode = (currentFilePath: string, node: DocumentNode): DocumentNode => {
          const { fragmentDefs } = getFragmentDefsAndFragmentSpreads(node);
          if (fragmentDefs.size === 0) {
            return node;
          }
          // skip iteration over documents for current filepath
          delete FilePathToDocumentsMap[currentFilePath];

          for (const [filePath, documents] of Object.entries(FilePathToDocumentsMap)) {
            const missingFragments = getMissingFragments({
              kind: Kind.DOCUMENT,
              definitions: documents,
            });
            const isCurrentFileImportFragment = missingFragments.some(fragment =>
              fragmentDefs.has(fragment),
            );

            if (isCurrentFileImportFragment) {
              return getParentNode(filePath, {
                kind: Kind.DOCUMENT,
                definitions: [...node.definitions, ...documents],
              });
            }
          }
          return node;
        };

        return getParentNode(context.filename, node);
      },
    },
    {
      category: 'Operations',
      description:
        'A GraphQL document is only valid if all fragment definitions are spread within operations, or spread within other fragments spread within operations.',
      requiresSchema: true,
      requiresSiblings: true,
    },
  ),
  validationToRule(
    {
      ruleId: 'no-unused-variables',
      rule: NoUnusedVariablesRule,
      getDocumentNode: handleMissingFragments,
    },
    {
      category: 'Operations',
      description:
        'A GraphQL operation is only valid if all variables defined by an operation are used, either directly or within a spread fragment.',
      requiresSchema: true,
      requiresSiblings: true,
    },
  ),
  validationToRule(
    {
      ruleId: 'overlapping-fields-can-be-merged',
      rule: OverlappingFieldsCanBeMergedRule,
    },
    {
      category: 'Operations',
      description:
        'A selection set is only valid if all fields (including spreading any fragments) either correspond to distinct response names or can be merged without ambiguity.',
      requiresSchema: true,
    },
  ),
  validationToRule(
    {
      ruleId: 'possible-fragment-spread',
      rule: PossibleFragmentSpreadsRule,
    },
    {
      category: 'Operations',
      description:
        'A fragment spread is only valid if the type condition could ever possibly be true: if there is a non-empty intersection of the possible parent types, and possible types which pass the type condition.',
      requiresSchema: true,
    },
  ),
  validationToRule(
    {
      ruleId: 'possible-type-extension',
      rule: PossibleTypeExtensionsRule,
      hasDidYouMeanSuggestions: true,
    },
    {
      category: 'Schema',
      description: 'A type extension is only valid if the type is defined and has the same kind.',
      recommended: true,
      requiresSchema: true,
    },
  ),
  validationToRule(
    {
      ruleId: 'provided-required-arguments',
      rule: ProvidedRequiredArgumentsRule,
    },
    {
      category: ['Schema', 'Operations'],
      description:
        'A field or directive is only valid if all required (non-null without a default value) field arguments have been provided.',
      requiresSchema: true,
    },
  ),
  validationToRule(
    {
      ruleId: 'scalar-leafs',
      rule: ScalarLeafsRule,
      hasDidYouMeanSuggestions: true,
    },
    {
      category: 'Operations',
      description:
        'A GraphQL document is valid only if all leaf fields (fields without sub selections) are of scalar or enum types.',
      requiresSchema: true,
    },
  ),
  validationToRule(
    {
      ruleId: 'one-field-subscriptions',
      rule: SingleFieldSubscriptionsRule,
    },
    {
      category: 'Operations',
      description: 'A GraphQL subscription is valid only if it contains a single root field.',
      requiresSchema: true,
    },
  ),
  validationToRule(
    {
      ruleId: 'unique-argument-names',
      rule: UniqueArgumentNamesRule,
    },
    {
      category: 'Operations',
      description:
        'A GraphQL field or directive is only valid if all supplied arguments are uniquely named.',
      requiresSchema: true,
    },
  ),
  validationToRule(
    {
      ruleId: 'unique-directive-names',
      rule: UniqueDirectiveNamesRule,
    },
    {
      category: 'Schema',
      description: 'A GraphQL document is only valid if all defined directives have unique names.',
    },
  ),
  validationToRule(
    {
      ruleId: 'unique-directive-names-per-location',
      rule: UniqueDirectivesPerLocationRule,
    },
    {
      category: ['Schema', 'Operations'],
      description:
        'A GraphQL document is only valid if all non-repeatable directives at a given location are uniquely named.',
      requiresSchema: true,
    },
  ),
  validationToRule(
    {
      ruleId: 'unique-field-definition-names',
      rule: UniqueFieldDefinitionNamesRule,
    },
    {
      category: 'Schema',
      description: 'A GraphQL complex type is only valid if all its fields are uniquely named.',
    },
  ),
  validationToRule(
    {
      ruleId: 'unique-input-field-names',
      rule: UniqueInputFieldNamesRule,
    },
    {
      category: 'Operations',
      description:
        'A GraphQL input object value is only valid if all supplied fields are uniquely named.',
    },
  ),
  validationToRule(
    {
      ruleId: 'unique-operation-types',
      rule: UniqueOperationTypesRule,
    },
    {
      category: 'Schema',
      description: 'A GraphQL document is only valid if it has only one type per operation.',
    },
  ),
  validationToRule(
    {
      ruleId: 'unique-type-names',
      rule: UniqueTypeNamesRule,
    },
    {
      category: 'Schema',
      description: 'A GraphQL document is only valid if all defined types have unique names.',
    },
  ),
  validationToRule(
    {
      ruleId: 'unique-variable-names',
      rule: UniqueVariableNamesRule,
    },
    {
      category: 'Operations',
      description: 'A GraphQL operation is only valid if all its variables are uniquely named.',
      requiresSchema: true,
    },
  ),
  validationToRule(
    {
      ruleId: 'value-literals-of-correct-type',
      rule: ValuesOfCorrectTypeRule,
      hasDidYouMeanSuggestions: true,
    },
    {
      category: 'Operations',
      description:
        'A GraphQL document is only valid if all value literals are of the type expected at their position.',
      requiresSchema: true,
    },
  ),
  validationToRule(
    {
      ruleId: 'variables-are-input-types',
      rule: VariablesAreInputTypesRule,
    },
    {
      category: 'Operations',
      description:
        'A GraphQL operation is only valid if all the variables it defines are of input types (scalar, enum, or input object).',
      requiresSchema: true,
    },
  ),
  validationToRule(
    {
      ruleId: 'variables-in-allowed-position',
      rule: VariablesInAllowedPositionRule,
    },
    {
      category: 'Operations',
      description: 'Variables passed to field arguments conform to type.',
      requiresSchema: true,
    },
  ),
);
