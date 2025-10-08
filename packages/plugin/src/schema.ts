import debugFactory from 'debug';
import { globSync } from 'tinyglobby';
import { BREAK, GraphQLSchema, visit } from 'graphql';
import { GraphQLProjectConfig } from 'graphql-config';
import { ModuleCache } from './cache.js';
import { Pointer, Schema } from './types.js';

const schemaCache = new ModuleCache<GraphQLProjectConfig['schema'], GraphQLSchema>();
const debug = debugFactory('graphql-eslint:schema');

export function getSchema(project: GraphQLProjectConfig): Schema {
  const schemaKey = project.schema;

  if (!schemaKey) {
    return null;
  }

  const cache = schemaCache.get(schemaKey);

  if (cache) {
    return cache;
  }

  debug('Loading schema from %o', project.schema);

  const opts = {
    pluckConfig: project.extensions.pluckConfig,
  };

  const typeDefs = project.loadSchemaSync(project.schema, 'DocumentNode', opts);
  let isFederation = false;

  visit(typeDefs, {
    SchemaExtension(node) {
      const linkDirective = node.directives?.find(d => d.name.value === 'link');
      if (!linkDirective) return BREAK;

      const urlArgument = linkDirective.arguments?.find(a => a.name.value === 'url');
      if (!urlArgument) return BREAK;

      if (urlArgument.value.kind !== 'StringValue') return BREAK;

      isFederation = urlArgument.value.value.includes('specs.apollo.dev/federation/');
    },
  });

  let schema: GraphQLSchema;

  if (isFederation) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- we inject createRequire in `tsup.config.ts`
    const { buildSubgraphSchema } = require('@apollo/subgraph');

    schema = buildSubgraphSchema({ typeDefs });
  } else {
    schema = project.loadSchemaSync(project.schema, 'GraphQLSchema', opts);
  }

  if (debug.enabled) {
    debug('Schema loaded: %o', schema instanceof GraphQLSchema);
    const schemaPaths = globSync(project.schema as Pointer, { absolute: true, expandDirectories: false });
    debug('Schema pointers %O', schemaPaths);
  }
  schemaCache.set(schemaKey, schema);

  return schema;
}
