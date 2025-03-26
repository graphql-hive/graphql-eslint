import { parseForESLint } from '../src/parser.js';

describe('Parser', () => {
  it('should allow to pass inline schema string as input', () => {
    const code = /* GraphQL */ `
      type Query {
        foo: String
      }
    `;

    const result = parseForESLint(code, { schemaSdl: code, filePath: 'test.graphql' });
    expect(result.ast).toMatchSnapshot();
    expect(result.ast.tokens).toBeTruthy();
  });

  it('parseForESLint() should return ast and tokens', () => {
    const code = /* GraphQL */ `
      """
      generic query placeholder
      """
      type Query
    `;

    // @ts-expect-error -- empty object to run programmatic config
    const result = parseForESLint(code, { graphQLConfig: {}, filePath: 'test.graphql' });
    expect(result.ast).toMatchSnapshot();
    expect(result.ast.tokens).toBeTruthy();
  });

  it('should throw on invalid code', () => {
    const code = 'Hello World!';

    expect(() => {
      parseForESLint(code, { filePath: '' });
    }).toThrow();
  });

  it('should correctly preserve "type" property (as "gqlType" field)', () => {
    const code = /* GraphQL */ `
      query GetUser($userId: ID!) {
        user(id: $userId) {
          id
        }
      }
    `;

    // @ts-expect-error -- empty object to run programmatic config
    const result = parseForESLint(code, { graphQLConfig: {}, filePath: 'test.graphql' });
    const field = (result.ast.body[0] as any).definitions[0].variableDefinitions[0];

    expect(field.type).toBe('VariableDefinition');
    expect(field.gqlType.type).toBe('NonNullType');
  });

  it('should provide type info when available', () => {
    const schema = /* GraphQL */ `
      type User {
        id: ID!
      }

      type Query {
        user(id: ID!): User!
      }
    `;
    const code = /* GraphQL */ `
      query user($id: ID!) {
        user(id: $id) {
          id
        }
      }
    `;

    const result = parseForESLint(code, {
      filePath: 'test.graphql',
      graphQLConfig: { schema },
    });
    const { selectionSet } = (result.ast.body[0] as any).definitions[0];
    const typeInfo = selectionSet.typeInfo();
    expect(typeInfo).toBeDefined();
    expect(typeInfo.gqlType.name).toEqual('Query');
    expect(typeInfo.parentType.name).toEqual('Query');
  });
});
