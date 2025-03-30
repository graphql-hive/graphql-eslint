import path from 'node:path';
import debugFactory from 'debug';
import { globSync } from 'tinyglobby';
import { GraphQLProjectConfig } from 'graphql-config';
import { Source } from '@graphql-tools/utils';
import { ModuleCache } from './cache.js';
import { Pointer } from './types.js';

const debug = debugFactory('graphql-eslint:operations');
const operationsCache = new ModuleCache<GraphQLProjectConfig['documents'], Source[]>();

const handleVirtualPath = (documents: Source[]): Source[] => {
  const filepathMap: Record<string, number> = Object.create(null);

  return documents.map(source => {
    const location = source.location!;
    if (['.gql', '.graphql'].some(extension => location.endsWith(extension))) {
      return {
        ...source,
        // When using glob pattern e.g. `**/*.gql` location contains always forward slashes even on
        // Windows
        location: path.resolve(location),
      };
    }
    filepathMap[location] ??= -1;
    const index = (filepathMap[location] += 1);
    return {
      ...source,
      location: path.resolve(location, `${index}_document.graphql`),
    };
  });
};

export const getDocuments = (project: GraphQLProjectConfig): Source[] => {
  const documentsKey = project.documents;
  if (!documentsKey) {
    return [];
  }

  let siblings = operationsCache.get(documentsKey);

  if (!siblings) {
    debug('Loading operations from %o', project.documents);
    const documents = project.loadDocumentsSync(project.documents, {
      skipGraphQLImport: true,
      pluckConfig: project.extensions.pluckConfig,
    });
    if (debug.enabled) {
      debug('Loaded %d operations', documents.length);
      const operationsPaths = globSync(project.documents as Pointer, { absolute: true, expandDirectories: false });
      debug('Operations pointers %O', operationsPaths);
    }
    siblings = handleVirtualPath(documents);
    operationsCache.set(documentsKey, siblings);
  }

  return siblings;
};
