import path from 'node:path';
import { ESLint, Linter } from 'eslint';
import { parser } from '../src/parser.js';
import { processor } from '../src/processor.js';

describe('processor state between editor buffers', () => {
  it('fixes JavaScript at its own offsets after GraphQL is removed', async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      fix: true,
      overrideConfig: [
        {
          files: ['**/*.js'],
          processor,
          rules: { semi: ['error', 'always'] },
        },
        {
          files: ['**/*.graphql'],
          languageOptions: {
            parser,
            parserOptions: { schemaSdl: 'type Query { id: ID }' },
          },
        },
      ],
    });
    const filePath = path.resolve('processor-buffer.js');
    await eslint.lintText('const query = gql`{ id }`;', { filePath });

    const [result] = await eslint.lintText('const answer = 1\n', { filePath });

    expect(result.output).toBe('const answer = 1;\n');
    expect(result.messages).toEqual([]);
  });

  it.each([
    ['skipped', 'const answer = 1;'],
    ['failed', 'const gql = ;'],
  ])('preserves JavaScript message positions when extraction is %s', (mode, code) => {
    const filePath = path.resolve(`processor-${mode}.js`);
    processor.preprocess('\nconst query = gql`\n{ id }\n`;', filePath);
    processor.postprocess([[], []], filePath);

    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(processor.preprocess(code, filePath)).toEqual([code]);
      expect(error).toHaveBeenCalledTimes(mode === 'failed' ? 1 : 0);
    } finally {
      error.mockRestore();
    }

    const message: Linter.LintMessage = {
      ruleId: 'example',
      severity: 2,
      message: 'JavaScript diagnostic',
      line: 1,
      column: 1,
      endLine: 1,
      endColumn: 6,
      fix: { range: [0, 5], text: 'let' },
      suggestions: [{ desc: 'Use let', fix: { range: [0, 5], text: 'let' } }],
    };
    const expected = structuredClone(message);

    expect(processor.postprocess([[message]], filePath)).toEqual([expected]);
  });

  it('uses fresh offsets when the next buffer still contains GraphQL', () => {
    const filePath = path.resolve('processor-updated.js');
    processor.preprocess('\n\nconst previous = gql`\n{ id }\n`;', filePath);
    processor.postprocess([[], []], filePath);

    const code = 'const query = gql`{ id }`;';
    processor.preprocess(code, filePath);
    const message: Linter.LintMessage = {
      ruleId: 'example',
      severity: 2,
      message: 'GraphQL diagnostic',
      line: 1,
      column: 3,
      fix: { range: [2, 4], text: '__typename' },
    };
    const [result] = processor.postprocess([[message], []], filePath);

    expect(result.line).toBe(1);
    expect(result.fix?.range).toEqual([code.indexOf('id'), code.indexOf('id') + 2]);
  });
});
