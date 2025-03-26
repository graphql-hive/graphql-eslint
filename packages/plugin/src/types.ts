import { AST, Linter, Rule } from 'eslint';
import * as ESTree from 'estree';
import { ASTKindToNode, GraphQLSchema } from 'graphql';
import { IGraphQLConfig } from 'graphql-config';
import { JSONSchema } from 'json-schema-to-ts';
import { GraphQLESTreeNode } from './estree-converter/index.js';
import { SiblingOperations } from './siblings.js';

export type Schema = GraphQLSchema | null;
export type Pointer = string | string[];
export type { GraphQLESTreeNode } from './estree-converter/types.js';

export type ParserConfigGraphQLConfig = {
  graphQLConfig?: IGraphQLConfig;
  filePath: string;
};

export type ParserConfigProgrammatic = {
  schemaSdl: string;
  filePath: string;
};

export type ParserOptions = ParserConfigGraphQLConfig | ParserConfigProgrammatic;

export type ParserServices = {
  schema: Schema;
  siblingOperations: SiblingOperations;
};

export type GraphQLESLintParseResult = Linter.ESLintParseResult & {
  services: ParserServices;
};

type Location = AST.SourceLocation | ESTree.Position;

type ReportDescriptorLocation = { loc: Location } | { node: { loc: Location } };
export type ReportDescriptor = ReportDescriptorLocation &
  Rule.ReportDescriptorMessage &
  Rule.ReportDescriptorOptions;

export type GraphQLESLintRuleContext<Options = any[]> = Omit<
  Rule.RuleContext,
  'options' | 'parserServices' | 'report'
> & {
  options: Options;
  parserServices: ParserServices;
  report(descriptor: ReportDescriptor): void;
};

export type CategoryType = 'Operations' | 'Schema';

type RuleMetaDataDocs = Required<Rule.RuleMetaData>['docs'];

export type RuleDocsInfo<T> = Omit<RuleMetaDataDocs, 'category' | 'suggestion'> & {
  category: CategoryType | CategoryType[];
  requiresSchema?: true;
  requiresSiblings?: true;
  examples?: {
    title: string;
    code: string;
    usage?: T;
  }[];
  configOptions?: T | { schema?: T; operations?: T };
  graphQLJSRuleName?: string;
  isDisabledForAllConfig?: true;
  whenNotToUseIt?: string;
};

export type GraphQLESLintRuleListener<WithTypeInfo extends boolean = false> = Record<
  string,
  any
> & {
  [K in keyof ASTKindToNode]?: (node: GraphQLESTreeNode<ASTKindToNode[K], WithTypeInfo>) => void;
};

export type GraphQLESLintRule<Options = [], WithTypeInfo extends boolean = false> = {
  meta: Omit<Rule.RuleMetaData, 'docs' | 'schema'> & {
    docs?: RuleDocsInfo<Options>;
    schema: Readonly<JSONSchema> | [];
  };
  create(context: GraphQLESLintRuleContext<Options>): GraphQLESLintRuleListener<WithTypeInfo>;
};

export type ValueOf<T> = T[keyof T];

type Id<T> = { [P in keyof T]: T[P] } & {};

type OmitDistributive<T, K extends PropertyKey> = T extends object ? Id<OmitRecursively<T, K>> : T;
export type OmitRecursively<T extends object, K extends PropertyKey> = Omit<
  { [P in keyof T]: OmitDistributive<T[P], K> },
  K
>;

export type ConfigName =
  | 'operations-all'
  | 'operations-recommended'
  | 'schema-all'
  | 'schema-recommended'
  | 'schema-relay';
