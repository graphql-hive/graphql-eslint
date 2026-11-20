/**
 * Port of `graphql-depth-limit` (MIT, https://github.com/stems/graphql-depth-limit).
 *
 * The original package is no longer maintained and reports via `new GraphQLError(message, [node])`,
 * a signature removed in graphql v17 (the error then has no `locations`). This port reports the
 * offending AST node directly instead, which works with every graphql version.
 */
import {
  DefinitionNode,
  DocumentNode,
  FragmentDefinitionNode,
  Kind,
  OperationDefinitionNode,
  SelectionNode,
} from 'graphql';

type DepthNode = SelectionNode | FragmentDefinitionNode | OperationDefinitionNode;

type DepthLimitOptions = {
  maxDepth: number;
  /** Stops recursive depth checking for matching field names, strings are used as RegExp */
  ignore: ReadonlyArray<string | RegExp | ((fieldName: string) => boolean)>;
  onDepthExceeded: (node: DepthNode, operationName: string) => void;
};

export function checkDepthLimit(document: DocumentNode, options: DepthLimitOptions): void {
  const fragments = getDefinitionsByName<FragmentDefinitionNode>(
    document.definitions,
    Kind.FRAGMENT_DEFINITION,
  );
  const operations = getDefinitionsByName<OperationDefinitionNode>(
    document.definitions,
    Kind.OPERATION_DEFINITION,
  );

  for (const [operationName, operation] of Object.entries(operations)) {
    determineDepth(operation, fragments, 0, operationName, options);
  }
}

function getDefinitionsByName<T extends FragmentDefinitionNode | OperationDefinitionNode>(
  definitions: ReadonlyArray<DefinitionNode>,
  kind: T['kind'],
): Record<string, T> {
  const map: Record<string, T> = {};
  for (const definition of definitions) {
    if (definition.kind === kind) {
      map[(definition as T).name?.value ?? ''] = definition as T;
    }
  }
  return map;
}

function determineDepth(
  node: DepthNode,
  fragments: Record<string, FragmentDefinitionNode>,
  depthSoFar: number,
  operationName: string,
  options: DepthLimitOptions,
): number {
  if (depthSoFar > options.maxDepth) {
    options.onDepthExceeded(node, operationName);
    return depthSoFar;
  }

  switch (node.kind) {
    case Kind.FIELD: {
      // by default, ignore the introspection fields which begin with double underscores
      const shouldIgnore =
        node.name.value.startsWith('__') || isIgnored(node.name.value, options.ignore);

      if (shouldIgnore || !node.selectionSet) {
        return 0;
      }
      return (
        1 +
        Math.max(
          ...node.selectionSet.selections.map(selection =>
            determineDepth(selection, fragments, depthSoFar + 1, operationName, options),
          ),
        )
      );
    }
    case Kind.FRAGMENT_SPREAD: {
      const fragment = fragments[node.name.value];
      if (!fragment) {
        throw new Error(`Unknown fragment "${node.name.value}"`);
      }
      return determineDepth(fragment, fragments, depthSoFar, operationName, options);
    }
    case Kind.INLINE_FRAGMENT:
    case Kind.FRAGMENT_DEFINITION:
    case Kind.OPERATION_DEFINITION:
      return Math.max(
        ...node.selectionSet.selections.map(selection =>
          determineDepth(selection, fragments, depthSoFar, operationName, options),
        ),
      );
  }
}

function isIgnored(fieldName: string, ignore: DepthLimitOptions['ignore']): boolean {
  return ignore.some(rule =>
    typeof rule === 'function' ? rule(fieldName) : fieldName.match(rule),
  );
}
