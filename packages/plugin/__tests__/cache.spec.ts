const ORIGINAL_ARGV1 = process.argv[1];
const ORIGINAL_NODE = process.env.NODE;

const ESLINT_CLI = '/project/node_modules/eslint/bin/eslint.js';
const LANGUAGE_SERVER = '/project/node_modules/vscode-eslint/server/out/eslintServer.js';

let elapsedSeconds: number;

async function createCache(argv1: string) {
  process.argv[1] = argv1;
  vi.resetModules();
  const { ModuleCache } = await import('../src/cache.js');
  return new ModuleCache<string, string>();
}

describe('ModuleCache', () => {
  beforeEach(() => {
    elapsedSeconds = 0;
    vi.spyOn(process, 'hrtime').mockImplementation(((previous?: [number, number]) =>
      previous ? [elapsedSeconds, 0] : [0, 0]) as typeof process.hrtime);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    process.argv[1] = ORIGINAL_ARGV1;
    if (ORIGINAL_NODE === undefined) {
      delete process.env.NODE;
    } else {
      process.env.NODE = ORIGINAL_NODE;
    }
  });

  it('expires entries after `lifetime` seconds in a long-lived process', async () => {
    const cache = await createCache(LANGUAGE_SERVER);
    cache.set('schema', 'old');

    elapsedSeconds = 9;
    expect(cache.get('schema')).toBe('old');

    elapsedSeconds = 11;
    expect(cache.get('schema')).toBeUndefined();
  });

  it('keeps entries for the whole run when invoked as the ESLint CLI', async () => {
    const cache = await createCache(ESLINT_CLI);
    cache.set('schema', 'old');

    elapsedSeconds = 3600;
    expect(cache.get('schema')).toBe('old');
  });

  // `process.env.NODE` is set by npm and pnpm for every lifecycle script they run, so it cannot
  // tell a one-shot CLI run from a long-lived process started by `npm run` / `pnpm run`.
  it('does not treat `process.env.NODE` as an ESLint CLI run', async () => {
    process.env.NODE = '/usr/local/bin/node';
    const cache = await createCache(LANGUAGE_SERVER);
    cache.set('schema', 'old');

    elapsedSeconds = 11;
    expect(cache.get('schema')).toBeUndefined();
  });
});
