// Based on the `eslint-plugin-import`'s cache
// https://github.com/import-js/eslint-plugin-import/blob/main/utils/ModuleCache.js
import debugFactory from 'debug';

const log = debugFactory('graphql-eslint:ModuleCache');

/**
 * `true` when this process is a one-shot ESLint CLI run, in which case cached entries never need
 * to be re-validated - nothing on disk changes while the run is in progress, and expiring entries
 * mid-run means reloading schemas and documents over and over (see #1246).
 *
 * This used to be inferred from `process.env.NODE`, but npm and pnpm both set `NODE` for every
 * lifecycle script they run, so it really means "launched from a package-manager script" - which
 * is neither necessary nor sufficient:
 *
 * - A long-lived process started with `npm run` / `pnpm run` (a lint watcher, a language server,
 *   an editor task) got an immortal cache, so schema edits were never picked up - undoing #1222.
 * - A one-shot run started as `npx eslint` or `./node_modules/.bin/eslint`, or invoked directly
 *   by a CI image, has `NODE` unset, so entries still expired mid-run - leaving #1246 unfixed for
 *   those users.
 *
 * Checking the entry point instead answers the actual question, and is stable across
 * `npm`/`pnpm`/`npx`/`.bin` launches (Node resolves `process.argv[1]` to the real script path).
 */
const IS_ESLINT_CLI = /[/\\]eslint[/\\]bin[/\\]eslint\.js$/.test(process.argv[1] ?? '');

export class ModuleCache<K, T> {
  map = new Map<K, { lastSeen: [number, number]; result: T }>();

  set(cacheKey: K, result: T): void {
    // Remove server-side cache code in browser
    if (typeof window !== 'undefined') return;

    this.map.set(cacheKey, { lastSeen: process.hrtime(), result });
    log('setting entry for', cacheKey);
  }

  get(cacheKey: K, settings = { lifetime: 10 /* seconds */ }): T | void {
    // Remove server-side cache code in browser
    if (typeof window !== 'undefined') return;

    const value = this.map.get(cacheKey);
    if (!value) {
      log('cache miss for', cacheKey);
      return;
    }
    const { lastSeen, result } = value;
    // check freshness
    if (IS_ESLINT_CLI || process.hrtime(lastSeen)[0] < settings.lifetime) {
      return result;
    }
  }
}
