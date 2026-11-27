import { ruleTester } from '../../../__tests__/test-utils.js';
import { rule, RuleOptions } from './index.js';

const INLINE_SDL = /* GraphQL */ `
  " Test "
  type CreateOneUserPayload {
    "Created document ID"
    recordId: MongoID

    "Created document"
    record: User
  }
`;

export const BLOCK_SDL = /* GraphQL */ `
  enum EnumUserLanguagesSkill {
    """
    basic
    """
    basic
    """
    fluent
    """
    fluent
    """
    native
    """
    native
  }
`;

ruleTester.run<RuleOptions>('description-style', rule, {
  valid: [
    BLOCK_SDL,
    {
      code: INLINE_SDL,
      options: [{ style: 'inline' }],
    },
  ],
  invalid: [
    {
      code: BLOCK_SDL,
      options: [{ style: 'inline' }],
      errors: 3,
    },
    {
      code: INLINE_SDL,
      errors: 3,
    },
    {
      name: 'block suggestion keeps the parsed value of an inline description with escapes',
      code: 'type Query {\n  "say \\"hi\\" now"\n  a: Int\n}',
      errors: [
        {
          message: 'Unexpected inline description for field "a" in type "Query"',
          suggestions: [
            {
              desc: 'Change to block style description',
              output: 'type Query {\n  """say "hi" now"""\n  a: Int\n}',
            },
          ],
        },
      ],
    },
    {
      name: 'block suggestion does not let a trailing quote swallow the closing delimiter',
      code: 'type Query {\n  "Returns \\"ok\\""\n  a: Int\n}',
      errors: [
        {
          message: 'Unexpected inline description for field "a" in type "Query"',
          suggestions: [
            {
              desc: 'Change to block style description',
              output: 'type Query {\n  """\nReturns "ok"\n"""\n  a: Int\n}',
            },
          ],
        },
      ],
    },
    {
      name: 'inline suggestion escapes quotes and backslashes of a block description',
      options: [{ style: 'inline' }],
      code: 'type Query {\n  """\n  Returns "ok" for C:\\dir\n  """\n  a: Int\n}',
      errors: [
        {
          message: 'Unexpected block description for field "a" in type "Query"',
          suggestions: [
            {
              desc: 'Change to inline style description',
              output: 'type Query {\n  " Returns \\"ok\\" for C:\\\\dir "\n  a: Int\n}',
            },
          ],
        },
      ],
    },
  ],
});
