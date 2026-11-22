import { readFileSync } from 'node:fs';
import { Linter } from 'eslint';
import { buildSchema, GraphQLObjectType, GraphQLSchema, GraphQLUnionType } from 'graphql';
import { beforeEach, describe, expect, it } from 'vitest';
import schemaAll from '../src/configs/schema-all.js';
import schemaRecommended from '../src/configs/schema-recommended.js';
import graphqlPlugin from '../src/index.js';
import { RuleOptions } from '../src/rules/no-conflicting-union-member-fields/index.js';
import { GraphQLESLintRule } from '../src/types.js';

describe('union member field conflicts', () => {
  const RULE_ID = 'no-conflicting-union-member-fields';
  let rule: GraphQLESLintRule<RuleOptions>;
  beforeEach(async () => {
    const modulePath = `../src/rules/${RULE_ID}/index.js`;
    ({ rule } = await import(modulePath));
  });
  type Case = {
    name: string;
    code: string;
    options?: RuleOptions[0];
    schema?: string | string[];
    schemaOverride?: GraphQLSchema;
    registered?: boolean;
  };

  function lint({ code, options, schema = code, schemaOverride, registered }: Case) {
    const parser = schemaOverride
      ? {
          parseForESLint(source: string, parserOptions: Record<string, unknown>) {
            const result = graphqlPlugin.parser.parseForESLint(source, {
              ...parserOptions,
              schemaSdl: source,
            } as any);
            result.services.schema = schemaOverride;
            return result;
          },
        }
      : graphqlPlugin.parser;

    return new Linter().verify(
      code,
      [
        {
          files: ['**/*.graphql'],
          languageOptions: {
            parser,
            parserOptions: schemaOverride ? {} : { graphQLConfig: { schema } },
          },
          plugins: {
            '@graphql-eslint': {
              rules: { [RULE_ID]: (registered ? graphqlPlugin.rules[RULE_ID] : rule) as any },
            },
          },
          rules: { [`@graphql-eslint/${RULE_ID}`]: options ? ['error', options] : 'error' },
        },
      ],
      { filename: 'schema.graphql' },
    );
  }

  const validCases: Case[] = [
    {
      name: 'allows a directive-only object extension without field conflicts',
      code: 'directive @tag on OBJECT type A { value: Int } type B { value: Int } extend type A @tag union Result = A | B',
    },
    {
      name: 'allows differently named union return types in response-shape mode',
      code: 'type Payload { id: ID } union FirstPayload = Payload union SecondPayload = Payload type A { value: [FirstPayload!]! } type B { value: [SecondPayload!]! } union Result = A | B',
      options: { mode: 'response-shape' },
    },
    {
      name: 'allows identical custom scalar leaves in response-shape mode',
      code: 'scalar DateTime type A { value: DateTime } type B { value: DateTime } union Result = A | B',
      options: { mode: 'response-shape' },
    },
    {
      name: 'allows a single-member union',
      code: 'type A { value: Int } union Result = A',
    },
    {
      name: 'does not compare unrelated objects',
      code: 'type A { value: Int } type B { value: String }',
    },
    {
      name: 'allows a field missing from one member',
      code: 'type A { value: Int } type B { other: String } union Result = A | B',
    },
    {
      name: 'allows identical nested wrappers',
      code: 'type A { value: [[ID!]!]! } type B { value: [[ID!]!]! } union Result = A | B',
    },
    {
      name: 'keeps different unions independent',
      code: `
    type A { value: Int }
    type B { value: String }
    type C { value: Int }
    type D { value: String }
    union First = A | C
    union Second = B | D
  `,
    },
    {
      name: 'allows different composite names in response-shape mode',
      code: `
    type FirstPayload { value: ID }
    type SecondPayload { value: ID }
    type A { data: [FirstPayload!]! }
    type B { data: [SecondPayload!]! }
    union Result = A | B
  `,
      options: { mode: 'response-shape' },
    },
    {
      name: 'allows object and interface names in response-shape mode',
      code: `
    interface Payload { value: ID }
    type Concrete implements Payload { value: ID }
    type A { data: Payload }
    type B { data: Concrete }
    union Result = A | B
  `,
      options: { mode: 'response-shape' },
    },
  ];

  const invalidCases: (Case & {
    conflicts: string[][];
  })[] = [
    {
      name: 'reports differently named custom scalar leaves',
      code: 'scalar DateTime scalar Timestamp type A { value: [DateTime!]! } type B { value: [Timestamp!]! } union Result = A | B',
      options: { mode: 'response-shape' },
      conflicts: [['Result', 'value', 'A', '[DateTime!]!', 'B', '[Timestamp!]!']],
    },
    {
      name: 'reports a custom scalar versus a union composite return',
      code: 'scalar DateTime type Payload { id: ID } union PayloadResult = Payload type A { value: DateTime } type B { value: PayloadResult } union Result = A | B',
      options: { mode: 'response-shape' },
      conflicts: [['Result', 'value', 'A', 'DateTime', 'B', 'PayloadResult']],
    },
    {
      name: 'reports the motivating scalar versus object conflict',
      code: `
    type Drn { country: String }
    type Novel { id: Drn }
    type Poem { id: Int }
    union Book = Poem | Novel
  `,
      conflicts: [['Book', 'id', 'Novel', 'Drn', 'Poem', 'Int']],
    },
    {
      name: 'reports different scalar names in response-shape mode',
      code: 'type A { value: Int } type B { value: String } union Result = A | B',
      options: { mode: 'response-shape' },
      conflicts: [['Result', 'value', 'A', 'Int', 'B', 'String']],
    },
    {
      name: 'reports enum versus scalar leaves',
      code: 'enum Status { OK } type A { value: Status } type B { value: String } union Result = A | B',
      options: { mode: 'response-shape' },
      conflicts: [['Result', 'value', 'A', 'Status', 'B', 'String']],
    },
    {
      name: 'reports leaf versus composite results',
      code: 'type Payload { id: ID } type A { data: Payload } type B { data: Int } union Result = A | B',
      options: { mode: 'response-shape' },
      conflicts: [['Result', 'data', 'A', 'Payload', 'B', 'Int']],
    },
    {
      name: 'reports different composite names in strict mode',
      code: `
    type FirstPayload { id: ID }
    type SecondPayload { id: ID }
    type A { data: FirstPayload }
    type B { data: SecondPayload }
    union Result = A | B
  `,
      conflicts: [['Result', 'data', 'A', 'FirstPayload', 'B', 'SecondPayload']],
    },
    {
      name: 'reports outer nullability differences',
      code: 'type A { value: [ID!]! } type B { value: [ID!] } union Result = A | B',
      options: { mode: 'response-shape' },
      conflicts: [['Result', 'value', 'A', '[ID!]!', 'B', '[ID!]']],
    },
    {
      name: 'reports inner nullability differences',
      code: 'type A { value: [[ID!]!] } type B { value: [[ID]!] } union Result = A | B',
      conflicts: [['Result', 'value', 'A', '[[ID!]!]', 'B', '[[ID]!]']],
    },
    {
      name: 'reports list nesting differences',
      code: 'type A { value: [[ID]] } type B { value: [ID] } union Result = A | B',
      options: { mode: 'response-shape' },
      conflicts: [['Result', 'value', 'A', '[[ID]]', 'B', '[ID]']],
    },
    {
      name: 'covers every conflict among three members without pair duplicates',
      code: `
    type A { value: Int }
    type B { value: String }
    type C { value: Boolean }
    union Result = A | B | C
  `,
      conflicts: [
        ['Result', 'value', 'A', 'Int', 'B', 'String'],
        ['Result', 'value', 'A', 'Int', 'C', 'Boolean'],
        ['Result', 'value', 'B', 'String', 'C', 'Boolean'],
      ],
    },
    {
      name: 'checks a shared member in multiple unions',
      code: `
    type A { value: Int }
    type B { value: String }
    type C { value: String }
    union First = A | B
    union Second = A | C
  `,
      conflicts: [
        ['First', 'value', 'A', 'Int', 'B', 'String'],
        ['Second', 'value', 'A', 'Int', 'C', 'String'],
      ],
    },
    {
      name: 'loads a union extension',
      code: 'type A { value: Int } type B { value: String } union Result = A extend union Result = B',
      conflicts: [['Result', 'value', 'A', 'Int', 'B', 'String']],
    },
    {
      name: 'loads an object extension',
      code: 'type A { value: Int } type B { other: String } extend type B { value: String } union Result = A | B',
      conflicts: [['Result', 'value', 'A', 'Int', 'B', 'String']],
    },
    {
      name: 'combines union, object, wrapper, and mode axes',
      code: `
    type A { value: [Int!] }
    type B { other: String }
    extend type B { value: [Int] }
    union Result = A
    extend union Result = B
  `,
      options: { mode: 'response-shape' },
      conflicts: [['Result', 'value', 'A', '[Int!]', 'B', '[Int]']],
    },
    {
      name: 'loads union members from separate schema sources',
      code: 'type B { value: String }',
      schema: ['type A { value: Int } union Result = A | B', 'type B { value: String }'],
      conflicts: [['Result', 'value', 'A', 'Int', 'B', 'String']],
    },
    {
      name: 'finds the same conflict with reversed declaration order',
      code: 'union Result = B | A type B { value: String } type A { value: Int }',
      conflicts: [['Result', 'value', 'A', 'Int', 'B', 'String']],
    },
    {
      name: 'reports outer nullability differences in default mode',
      code: 'type A { value: [ID!]! } type B { value: [ID!] } union Result = A | B',
      conflicts: [['Result', 'value', 'A', '[ID!]!', 'B', '[ID!]']],
    },
    {
      name: 'reports list nesting differences in default mode',
      code: 'type A { value: [[ID]] } type B { value: [ID] } union Result = A | B',
      conflicts: [['Result', 'value', 'A', '[[ID]]', 'B', '[ID]']],
    },
    {
      name: 'reports distinct enum names in response-shape mode',
      code: 'enum FirstStatus { OK } enum SecondStatus { OK } type A { value: FirstStatus } type B { value: SecondStatus } union Result = A | B',
      options: { mode: 'response-shape' },
      conflicts: [['Result', 'value', 'A', 'FirstStatus', 'B', 'SecondStatus']],
    },
    {
      name: 'accepts explicitly selected strict mode',
      code: 'type FirstPayload { id: ID } type SecondPayload { id: ID } type A { value: FirstPayload } type B { value: SecondPayload } union Result = A | B',
      options: { mode: 'strict' },
      conflicts: [['Result', 'value', 'A', 'FirstPayload', 'B', 'SecondPayload']],
    },
  ];

  function mentions(message: string, token: string) {
    const normalized = message.replace(/\s*([[\]!])\s*/g, '$1');
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?<![A-Za-z0-9_])${escaped}(?![A-Za-z0-9_])`).test(normalized);
  }

  describe(RULE_ID, () => {
    for (const testCase of validCases) {
      it(testCase.name, () => expect(lint(testCase)).toEqual([]));
    }
    for (const testCase of invalidCases) {
      it(testCase.name, () => {
        const messages = lint(testCase);
        expect(messages.length).toBeGreaterThan(0);
        if (testCase.conflicts.length === 1) {
          expect(messages).toHaveLength(1);
        }
        for (const conflict of testCase.conflicts) {
          expect(
            messages.some(message => conflict.every(token => mentions(message.message, token))),
          ).toBe(true);
        }
        for (const message of messages) {
          expect(message.ruleId).toBe(`@graphql-eslint/${RULE_ID}`);
          expect(
            testCase.conflicts.some(conflict =>
              conflict.every(token => mentions(message.message, token)),
            ),
          ).toBe(true);
          expect(message.message).toMatch(
            /renam|re[- ]?nam|(?:chang|different|distinct|unique|another|alternate|alternative|new|adjust|alter|revis|choos|select|use|giv|assign|pick)[\s\S]*(?:nam|identifier|label|key)|(?:nam|identifier|label|key)[\s\S]*(?:chang|different|distinct|unique|another|alternate|alternative|new|adjust|alter|revis)/i,
          );
        }
        const normalized = messages.map(message =>
          message.message.toLowerCase().replace(/[^a-z0-9_![\]]/g, ''),
        );
        expect(new Set(normalized).size).toBe(messages.length);
        expect(messages.every(message => message.suggestions === undefined)).toBe(true);
        expect(messages.every(message => message.fix === undefined)).toBe(true);
      });
    }
  });

  for (const mode of ['strict', 'response-shape'] as const) {
    for (const member of ['A', 'B'] as const) {
      it(`reports from either separately linted member: ${member}, ${mode}`, () => {
        const sources = [
          'type A {\n  value: Int\n}',
          'type B {\n  value: String\n}',
          'union Result = A | B',
        ];
        for (const schema of [sources, [...sources].reverse()]) {
          const messages = lint({
            name: 'separate member',
            code: sources[member === 'A' ? 0 : 1],
            schema,
            options: { mode },
          });
          expect(messages).toHaveLength(1);
          expect(messages[0].line).toBe(2);
          expect(
            ['Result', 'value', 'A', 'Int', 'B', 'String'].every(token =>
              mentions(messages[0].message, token),
            ),
          ).toBe(true);
        }
      });
    }
    it(`reports on an earlier member's local extension field: ${mode}`, () => {
      const code = 'extend type A {\n  value: Int\n}';
      const messages = lint({
        name: 'local extension',
        code,
        schema: ['type A { id: ID } type B { value: String } union Result = A | B', code],
        options: { mode },
      });
      expect(messages).toHaveLength(1);
      expect(messages[0].line).toBe(2);
    });
    it(`reports all local pairs when the middle member is linted alone: ${mode}`, () => {
      const code = 'type B {\n  value: String\n}';
      const messages = lint({
        name: 'middle member',
        code,
        schema: ['type A { value: Int } type C { value: Boolean } union Result = C | A | B', code],
        options: { mode },
      });
      expect(messages.length).toBeGreaterThan(0);
      for (const pair of [
        ['A', 'Int', 'B', 'String'],
        ['B', 'String', 'C', 'Boolean'],
      ]) {
        expect(
          messages.filter(message => pair.every(token => mentions(message.message, token))),
        ).toHaveLength(1);
      }
      expect(messages.every(message => message.line === 2)).toBe(true);
    });
    it(`falls back to a local union when all member fields are remote: ${mode}`, () => {
      const code = 'union Result = A | B';
      const messages = lint({
        name: 'union source',
        code,
        schema: ['type A { value: Int } type B { value: String }', code],
        options: { mode },
      });
      expect(messages).toHaveLength(1);
      expect(messages[0].line).toBe(1);
      expect(
        ['Result', 'value', 'A', 'Int', 'B', 'String'].every(token =>
          mentions(messages[0].message, token),
        ),
      ).toBe(true);
    });
    it(`prefers a local member field over the local union: ${mode}`, () => {
      const code = 'union Result = A | B\ntype A {\n  value: Int\n}';
      const messages = lint({
        name: 'local field and union',
        code,
        schema: ['type B { value: String }', code],
        options: { mode },
      });
      expect(messages).toHaveLength(1);
      expect(messages[0].line).toBe(3);
    });
  }

  it('preserves all conflicts across multi-field and multi-union declaration orders', () => {
    const definitions = [
      'type A { value: Int other: ID }',
      'type B { value: String other: ID }',
      'type C { value: Boolean other: Int }',
      'union First = A | B | C',
      'union Second = A | C',
    ];
    const conflicts = [
      ['First', 'value', 'A', 'Int', 'B', 'String'],
      ['First', 'value', 'A', 'Int', 'C', 'Boolean'],
      ['First', 'value', 'B', 'String', 'C', 'Boolean'],
      ['First', 'other', 'A', 'ID', 'C', 'Int'],
      ['First', 'other', 'B', 'ID', 'C', 'Int'],
      ['Second', 'value', 'A', 'Int', 'C', 'Boolean'],
      ['Second', 'other', 'A', 'ID', 'C', 'Int'],
    ];
    const reordered = [
      'union Second = C | A',
      'union First = C | B | A',
      'type C { other: Int value: Boolean }',
      'type B { other: ID value: String }',
      'type A { other: ID value: Int }',
    ];
    const found = [definitions, reordered].map(parts => {
      const messages = lint({ name: 'declaration order', code: parts.join('\n') });
      for (const message of messages) {
        expect(
          conflicts.some(conflict => conflict.every(token => mentions(message.message, token))),
        ).toBe(true);
      }
      for (const conflict of conflicts) {
        expect(
          messages.some(message => conflict.every(token => mentions(message.message, token))),
        ).toBe(true);
      }
      return conflicts.filter(conflict =>
        messages.some(message => conflict.every(token => mentions(message.message, token))),
      );
    });
    expect(found[0]).toEqual(conflicts);
    expect(found[1]).toEqual(found[0]);
  });

  it('registers the rule only in schema-all', () => {
    expect(
      lint({
        name: 'public registry',
        code: 'type A { value: Int } type B { value: String } union Result = A | B',
        registered: true,
      }),
    ).toHaveLength(1);
    expect(schemaAll.rules[`@graphql-eslint/${RULE_ID}`]).toBe('error');
    expect(schemaRecommended.rules).not.toHaveProperty(`@graphql-eslint/${RULE_ID}`);
  });

  it('documents both conflict modes', () => {
    const documentation = readFileSync(
      new URL(
        '../../../website/content/rules/no-conflicting-union-member-fields.mdx',
        import.meta.url,
      ),
      'utf8',
    );
    expect(documentation).toMatch(/\bmode\b/i);
    expect(documentation).toMatch(/\bstrict\b/i);
    expect(documentation).toMatch(/\bresponse-shape\b/i);
    // Documentation may use paragraphs, lists, tables, or headings.
    const prose = documentation.replace(/[`*]/g, '').replace(/\s+/g, ' ');
    expect(prose).toMatch(/default|omitt|unspecified/i);
    expect(prose).toMatch(/compar|equal|match/i);
    expect(prose).toMatch(/complete|full|entire|named/i);
    expect(prose).toMatch(/wrapper|list|nullab/i);
    expect(prose).toMatch(/scalar|leaf|leaves|enum/i);
    expect(prose).toMatch(/composite/i);
    expect(prose).toMatch(/ignor|allow|alone|differ|compatib/i);
    expect(documentation).toMatch(/(?:["']?mode["']?)\s*:\s*["']response-shape["']/i);
  });

  it('anchors an extension-only shared field on one of its local field definitions', () => {
    const code =
      'type A { id: ID }\ntype B { id: ID }\nextend type A {\n  value: Int\n}\nextend type B {\n  value: String\n}\nunion Result = A | B';
    const messages = lint({ name: 'extension anchors', code });
    expect(messages).toHaveLength(1);
    expect([4, 7]).toContain(messages[0].line);
  });

  it('emits one diagnostic for one conflicting pair with both source fields present', () => {
    const messages = lint({
      name: 'one pair',
      code: 'type A { value: Int } type B { value: String } union Result = A | B',
    });
    expect(messages).toHaveLength(1);
  });

  it('does not use an interface field as an object-member diagnostic anchor', () => {
    const schema = buildSchema(
      'type A { value: Int } type B { value: String } union Result = A | B',
    );
    (schema.getType('B') as GraphQLObjectType).getFields().value.astNode = undefined;
    const messages = lint({
      name: 'interface AST node',
      code: 'interface A {\n  value: Int\n}\ntype Query { value: Int }',
      schemaOverride: schema,
    });
    expect(messages.every(message => message.line !== 2)).toBe(true);
  });

  it('deduplicates a repeated resolved member', () => {
    const schema = buildSchema(
      'type A { value: Int } type B { value: String } union Result = A | B',
    );
    const union = schema.getType('Result') as GraphQLUnionType;
    const members = union.getTypes();
    const original = lint({
      name: 'distinct members',
      code: 'type A { value: Int } type B { value: String } union Result = A | B',
      schemaOverride: schema,
    });
    union.getTypes = () => [...members, members[1]];
    const messages = lint({
      name: 'duplicate member',
      code: 'type A { value: Int } type B { value: String } union Result = A | B',
      schemaOverride: schema,
    });
    expect(messages).toHaveLength(1);
    expect(messages).toEqual(original);
  });
});
