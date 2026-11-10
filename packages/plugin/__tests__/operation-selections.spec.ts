import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ESLint } from 'eslint';
import { buildSchema, GraphQLSchema, parse, print, validate } from 'graphql';
import graphqlPlugin from '../src/index.js';
import { RuleOptions } from '../src/rules/require-selections/index.js';

const ruleId = '@graphql-eslint/require-selections';
const schema = `
    type Query { both: Both encidOnly: EncidOnly idOnly: IdOnly neither: Neither node: Node search: Search container: Container }
    type Mutation { update: Both }
    interface Node { id: ID child: Both }
    interface Container { child: Node }
    type ConcreteContainer implements Container { child: Both }
    union Search = Both | IdOnly
    type Both implements Node { encid: ID id: ID name: String child: Both }
    type Other implements Node { id: ID child: Both }
    type EncidOnly { encid: ID name: String }
    type IdOnly { id: ID name: String }
    type Neither { name: String child: Both }
`;
const lint = async (
  document: string,
  {
    documents = [],
    options = { fieldName: ['encid', 'id'], requireAllFields: true, operationsOnly: true },
    schemaText = schema,
  }: {
    documents?: ReturnType<typeof parse>[];
    options?: Partial<RuleOptions[0]>;
    schemaText?: string;
  } = {},
) => {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: {
      files: ['**/*.graphql'],
      languageOptions: {
        parser: graphqlPlugin.parser,
        parserOptions: {
          graphQLConfig: {
            schema: schemaText,
            // Use the existing inline-document loader, including its per-source parse options.
            // Register local definitions too: standard loading does not overlay the current AST.
            documents: [
              document,
              ...documents.map(source => ({ [print(source)]: { noLocation: !source.loc } })),
            ],
          },
        },
      },
      plugins: { '@graphql-eslint': graphqlPlugin as unknown as ESLint.Plugin },
      rules: { [ruleId]: ['error', options] },
    },
  });
  return (await eslint.lintText(document, { filePath: 'required-ids.graphql' }))[0];
};

it.each<[string, string[]]>([
  ['{ both { encid id name } }', []],
  ['{ both { encid name } }', ['both.id']],
  ['{ both { id name } }', ['both.encid']],
  ['{ both { name } }', ['both.encid', 'both.id']],
  ['{ encidOnly { encid } }', []],
  ['{ encidOnly { name } }', ['encidOnly.encid']],
  ['{ idOnly { id } }', []],
  ['{ idOnly { name } }', ['idOnly.id']],
  ['{ neither { name } }', []],
  ['mutation { update { encid } }', ['update.id']],
  ['fragment Partial on Both { name child { name } }', []],
  ['{ both { id ...Partial } } fragment Partial on Both { encid }', []],
  ['{ both { ...Partial } } fragment Partial on Both { encid }', ['both.id']],
  ['{ both { encid id ...Partial } } fragment Partial on Both { child { encid } }', ['child.id']],
  ['{ neither { ...Partial } } fragment Partial on Neither { child { encid } }', ['child.id']],
  ['{ ...Root } fragment Root on Query { both { name } }', ['both.encid', 'both.id']],
  [
    '{ ...Root } fragment Root on Query { ...Nested } fragment Nested on Query { both { encid id } }',
    [],
  ],
  ['mutation { ...Root } fragment Root on Mutation { update { encid } }', ['update.id']],
  [
    '{ both { encid id child { encid id } ...Details } } fragment Details on Both { child { name } }',
    [],
  ],
  [
    '{ both { encid id ...A ...B } } fragment A on Both { child { encid } } fragment B on Both { child { id } }',
    [],
  ],
  [
    '{ both { encid id ...A ...B } } fragment A on Both { child { encid } } fragment B on Both { child { name } }',
    ['child.id'],
  ],
  ['{ both { encid child { encid } } both { id child { id } } }', []],
  ['{ ...Root both { id } } fragment Root on Query { both { encid } }', []],
  [
    '{ both { encid id ...A ...B } } fragment A on Both { child { encid } } fragment B on Both { other: child { id } }',
    ['child.id', 'other.encid'],
  ],
  ['query A { both { encid } } query B { both { id } }', ['both.id', 'both.encid']],
  ['{ both { encid id child { encid } ... on Both { child { id } } } }', []],
  ['{ both { id: encid } }', ['both.id']],
  ['{ both { encid: id } }', ['both.encid']],
  ['{ both { businessId: id businessEncid: encid } }', []],
  ['{ node { id ... on Both { name } } }', ['node.encid']],
  ['{ node { id ... on Both { encid } } }', []],
  ['{ node { id } }', ['node.encid']],
  ['{ node { id ... on Node { ... on Both { encid } } } }', []],
  ['{ node { ... { id } ...Fields } } fragment Fields on Both { encid }', []],
  ['{ search { ... on Both { encid id } ... on IdOnly { name } } }', ['search.id']],
  ['{ search { ... on Both { name } ... on IdOnly { id } } }', ['search.encid', 'search.id']],
  ['{ search { ... on Both { encid id } ... on IdOnly { id } } }', []],
  ['{ search { ... on Both { encid id } } }', ['search.id']],
  ['{ search { ... on Node { id ... on Both { encid } } ... on IdOnly { id } } }', []],
  [
    '{ search { ...Members } } fragment Members on Search { ... on Both { encid id } ... on IdOnly { name } }',
    ['search.id'],
  ],
  [
    '{ search { ...Business ...Other } } fragment Business on Both { encid id } fragment Other on IdOnly { name }',
    ['search.id'],
  ],
  ['{ node { id child { encid } ... on Both { encid child { id } } } }', ['child.id']],
  ['{ node { id child { encid id } ... on Both { encid child { name } } } }', []],
  ['{ node { id ... on Both { encid } child { encid } } }', ['child.id']],
  ['{ node { id ... on Both { encid child { name } } } }', ['child.encid', 'child.id']],
  ['fragment Partial on Node { ... on Both { name child { name } } }', []],
  // Invalid scalar selections are handled by GraphQL validation, not by crashing this rule.
  ['{ both { encid { name } id } }', []],
  ['{ both { encid id ...Missing } }', []],
  ['{ unknown { name } }', []],
  [
    '{ both { ...A } } fragment A on Both { ...B } fragment B on Both { ...A }',
    ['both.encid', 'both.id'],
  ],
  ['{ both { ...A } } fragment A on Both { id encid child { ...A } }', []],
])(
  'requires all available IDs in operations, not standalone fragments: %s',
  async (document, missingFields) => {
    const result = await lint(document);
    expect(result.messages).toEqual(
      missingFields.map(field =>
        expect.objectContaining({
          ruleId,
          severity: 2,
          message: expect.stringContaining(`\`${field}\``),
        }),
      ),
    );
  },
);

it.each([
  [true, 'name'],
  [false, 'name'],
  [true, 'id'],
  [false, 'id'],
] as const)(
  'checks sibling abstract branches (noLocation: %s, fields: %s)',
  async (noLocation, fields) => {
    const documents = [
      parse(
        `
      fragment Root on Query { search { ...Members } }
      fragment Members on Search { ... on Both { encid id } ...OtherFields }
      fragment OtherFields on IdOnly { ${fields} }
    `,
        { noLocation },
      ),
    ];
    const { messages } = await lint('{ ...Root }', { documents });
    if (fields === 'id') {
      expect(messages).toEqual([]);
    } else {
      expect(messages).toEqual([
        expect.objectContaining({
          ruleId,
          severity: 2,
          line: 1,
          column: 3,
          message: expect.stringContaining('search.id'),
        }),
      ]);
      expect(messages[0].message).toContain('type `IdOnly`');
      expect(messages[0].suggestions).toBeUndefined();
    }
  },
);

it.each([
  ['{ node { id ... on Both { name } } }', 'Both', 'node.encid'],
  ['{ container { child { id ... on Both { name } } } }', 'Both', 'child.encid'],
  ['{ search { ... on Both { encid id } ... on IdOnly { name } } }', 'IdOnly', 'search.id'],
  [
    '{ search { ...Members } } fragment Members on Search { ... on Both { encid id } ... on IdOnly { name } }',
    'IdOnly',
    'search.id',
  ],
])('offers a type-safe suggestion for abstract selections: %s', async (document, type, field) => {
  const result = await lint(document);
  expect(result.messages).toEqual([
    expect.objectContaining({ ruleId, message: expect.stringContaining(field) }),
  ]);
  expect(result.messages[0].message).toContain(`type \`${type}\``);
  const { fix } = result.messages[0].suggestions![0];
  const corrected = document.slice(0, fix.range[0]) + fix.text + document.slice(fix.range[1]);
  expect(validate(buildSchema(schema), parse(corrected))).toEqual([]);
  const after = await lint(corrected);
  expect(after.messages).toEqual([]);
});

it('offers a consumer-file suggestion when merged fields also come from a fragment', async () => {
  const document = `
        { ...Root both { child { name } } }
        fragment Root on Query { both { encid id child { encid } } }
    `;
  const result = await lint(document);
  expect(result.messages).toEqual([
    expect.objectContaining({ ruleId, message: expect.stringContaining('child.id') }),
  ]);
  const { fix } = result.messages[0].suggestions![0];
  expect(document.slice(fix.range[0])).toMatch(/^name/);
  const corrected = document.slice(0, fix.range[0]) + fix.text + document.slice(fix.range[1]);
  expect(validate(buildSchema(schema), parse(corrected))).toEqual([]);
  const after = await lint(corrected);
  expect(after.messages).toEqual([]);
});

// Both omitting and explicitly disabling the new option retain upstream behavior.
it.each([undefined, false])(
  'preserves legacy rule behavior with operationsOnly=%s',
  async operationsOnly => {
    const options = {
      fieldName: ['encid', 'id'],
      requireAllFields: true,
      ...(operationsOnly === undefined ? {} : { operationsOnly }),
    };
    const lintLegacy = async (document: string) => (await lint(document, { options })).messages;
    expect(await lintLegacy('fragment Partial on Both { name }')).toHaveLength(2);
    expect(await lintLegacy('{ both { id: encid } }')).toEqual([]);
    expect(await lintLegacy('{ node { id } }')).toEqual([]);
    expect(
      await lintLegacy('{ search { ... on Both { encid id } ... on IdOnly { name } } }'),
    ).toEqual([]);
  },
);

it.each([
  '{ both { id: encid } }',
  '{ both { id encid: name } }',
  '{ both { id ... on Both { encid: name } } }',
  '{ both { id ...Aliased } } fragment Aliased on Both { encid: name }',
  '{ both { id } both { encid: name } }',
  '{ node { id ... on Both { encid: name } } }',
  '{ search { ... on Both { id } ... on IdOnly { id encid: name } } }',
])('does not suggest a field that conflicts with an existing alias: %s', async document => {
  expect(validate(buildSchema(schema), parse(document))).toEqual([]);
  const result = await lint(document);
  expect(result.messages).toHaveLength(1);
  expect(result.messages[0].ruleId).toBe(ruleId);
  expect(result.messages[0].suggestions).toBeUndefined();
});

it.each([false, true])(
  'checks alias collisions in sibling fragments (noLocation: %s)',
  async noLocation => {
    const fragment = 'fragment Aliased on Both { encid: name }';
    const document = '{ both { id ...Aliased } }';
    expect(validate(buildSchema(schema), parse(`${document} ${fragment}`))).toEqual([]);
    const result = await lint(document, { documents: [parse(fragment, { noLocation })] });
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].message).toContain('both.encid');
    expect(result.messages[0].suggestions).toBeUndefined();
  },
);

it('keeps safe suggestions when an alias belongs to a different nested object', async () => {
  const document = '{ both { encid child { id: name actualId: id encid } } }';
  expect(validate(buildSchema(schema), parse(document))).toEqual([]);
  const result = await lint(document);
  expect(result.messages).toHaveLength(1);
  expect(result.messages[0].message).toContain('both.id');
  const { fix } = result.messages[0].suggestions![0];
  const corrected = document.slice(0, fix.range[0]) + fix.text + document.slice(fix.range[1]);
  expect(validate(buildSchema(schema), parse(corrected))).toEqual([]);
  const after = await lint(corrected);
  expect(after.messages).toEqual([]);
});

it('bounds traversal work for repeated abstract subtrees', async () => {
  const recursiveSchema = `
        type Query { node: Node }
        interface Node { id: ID encid: ID child: Node }
        ${Array.from(
          { length: 6 },
          (_, index) => `type T${index} implements Node { id: ID encid: ID child: Node }`,
        ).join('\n')}
    `;
  let selection = 'id encid';
  for (let depth = 0; depth < 5; depth += 1) selection = `id encid child { ${selection} }`;
  const document = `{ node { ${selection} } }`;
  expect(validate(buildSchema(recursiveSchema), parse(document))).toEqual([]);
  // Count work instead of relying on machine-dependent elapsed time.
  const visits = vi.spyOn(GraphQLSchema.prototype, 'getPossibleTypes');
  try {
    const result = await lint(document, { schemaText: recursiveSchema });
    expect(result.messages).toEqual([]);
    expect(visits.mock.calls.length).toBeLessThan(200);
  } finally {
    visits.mockRestore();
  }
});

it('keeps shared sibling fragment diagnostics at each consumer location', async () => {
  const shared = parse('fragment Shared on Both { id encid child { name } }', { noLocation: true });
  const result = await lint('{\n first: both { ...Shared }\n second: both { ...Shared }\n}', {
    documents: [shared],
  });
  expect(result.messages).toHaveLength(4);
  expect(result.messages.map(message => message.line)).toEqual([2, 2, 3, 3]);
  expect(result.messages.every(message => message.ruleId === ruleId)).toBe(true);
});

it.each([true, false])(
  'reports nested sibling selections at the consumer spread (noLocation: %s)',
  async noLocation => {
    const document = '{ both { ...Fields } }';
    const result = await lint(document, {
      documents: [
        parse(
          `
        fragment Fields on Both { id encid child { ...Child } }
        fragment Child on Both { id encid child { name } }
      `,
          { noLocation },
        ),
      ],
    });
    expect(result.messages).toEqual(
      ['encid', 'id'].map(field =>
        expect.objectContaining({
          ruleId,
          line: 1,
          column: document.indexOf('...') + 1,
          message: expect.stringContaining(`child.${field}`),
        }),
      ),
    );
    expect(result.messages.every(message => !message.suggestions)).toBe(true);
  },
);

it.each([
  ['{ both { name } }', { operationsOnly: true }, ['both.id']],
  ['{ both { identifier: id } }', { operationsOnly: true }, []],
  ['{ both { id: name } }', { operationsOnly: true }, []],
  ['{ both { encid } }', { operationsOnly: true, fieldName: ['id', 'encid'] }, []],
  ['{ both { encid } }', { operationsOnly: true, fieldName: 'name' }, ['both.name']],
  ['{ both { name } }', { operationsOnly: true, fieldName: 'name', requireAllFields: true }, []],
] satisfies [string, Partial<RuleOptions[0]>, string[]][])(
  'supports default, any-field and custom requirements: %s',
  async (document, options, missing) => {
    const result = await lint(document, { options });
    expect(result.messages).toEqual(
      missing.map(field =>
        expect.objectContaining({
          ruleId,
          message: expect.stringContaining(field),
        }),
      ),
    );
  },
);

it('checks subscription payloads without requiring fields on the operation root', async () => {
  const result = await lint('subscription { updated { id } }', {
    schemaText: `${schema}\ntype Subscription { id: ID updated: Both }`,
  });
  expect(result.messages).toEqual([
    expect.objectContaining({ ruleId, message: expect.stringContaining('updated.encid') }),
  ]);
});

it('checks ordinary sibling files with the default document loader', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'graphql-eslint-selections-'));
  try {
    const fragmentPath = path.join(root, 'fields.graphql');
    fs.writeFileSync(fragmentPath, 'fragment Fields on Both { encid }');
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: {
        files: ['**/*.graphql'],
        languageOptions: {
          parser: graphqlPlugin.parser,
          parserOptions: { graphQLConfig: { schema, documents: fragmentPath } },
        },
        plugins: { '@graphql-eslint': graphqlPlugin as unknown as ESLint.Plugin },
        rules: {
          [ruleId]: [
            'error',
            {
              fieldName: ['id', 'encid'],
              requireAllFields: true,
              operationsOnly: true,
            },
          ],
        },
      },
    });
    // Reuse ESLint to ensure rule traversal state never survives a lint pass.
    for (const code of [
      '{ both { id ...Fields } }',
      '{ both { ...Fields } }',
      '{ both { id ...Fields } }',
    ]) {
      const [result] = await eslint.lintText(code, { filePath: 'consumer.graphql' });
      expect(result.messages).toEqual(
        code.includes(' id ')
          ? []
          : [expect.objectContaining({ ruleId, message: expect.stringContaining('both.id') })],
      );
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
