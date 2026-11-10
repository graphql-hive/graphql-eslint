import {
  FragmentDefinitionNode,
  Kind,
  OperationDefinitionNode,
  OperationTypeNode,
  SelectionSetNode,
  visit,
} from 'graphql';
import { Source } from '@graphql-tools/utils';
import { logger } from './utils.js';

export type FragmentSource = { filePath: string; document: FragmentDefinitionNode };
export type OperationSource = { filePath: string; document: OperationDefinitionNode };

export type SiblingOperations = {
  available: boolean;
  getFragment(fragmentName: string): FragmentSource[];
  getFragments(): FragmentSource[];
  getFragmentByType(typeName: string): FragmentSource[];
  getFragmentsInUse(
    baseOperation: FragmentDefinitionNode | OperationDefinitionNode | SelectionSetNode,
    recursive?: boolean,
  ): FragmentDefinitionNode[];
  getOperation(operationName: string): OperationSource[];
  getOperations(): OperationSource[];
  getOperationByType(operationType: OperationTypeNode): OperationSource[];
};

// Document loading can replace source arrays when its cache expires. Let obsolete
// snapshots and their indexes be collected instead of retaining them for the process lifetime.
const siblingOperationsCache = new WeakMap<Source[], SiblingOperations>();

export function getSiblings(documents: Source[]): SiblingOperations {
  if (documents.length === 0) {
    let printed = false;

    const noopWarn = () => {
      if (!printed) {
        logger.warn(
          'getSiblingOperations was called without any operations. Make sure to set graphql-config `documents` field to make this feature available! See https://the-guild.dev/graphql/config/docs/user/documents for more info',
        );
        printed = true;
      }
      return [];
    };

    return {
      available: false,
      getFragment: noopWarn,
      getFragments: noopWarn,
      getFragmentByType: noopWarn,
      getFragmentsInUse: noopWarn,
      getOperation: noopWarn,
      getOperations: noopWarn,
      getOperationByType: noopWarn,
    };
  }

  // Reuse the index while document loading returns the same source array.
  const value = siblingOperationsCache.get(documents);

  if (value) {
    return value;
  }

  let fragmentsCache: FragmentSource[] | null = null;

  const getFragments = (): FragmentSource[] => {
    if (fragmentsCache === null) {
      const result: FragmentSource[] = [];

      for (const source of documents) {
        for (const definition of source.document?.definitions || []) {
          if (definition.kind === Kind.FRAGMENT_DEFINITION) {
            result.push({
              filePath: source.location!,
              document: definition,
            });
          }
        }
      }
      fragmentsCache = result;
    }
    return fragmentsCache;
  };

  let cachedOperations: OperationSource[] | null = null;

  const getOperations = (): OperationSource[] => {
    if (cachedOperations === null) {
      const result: OperationSource[] = [];

      for (const source of documents) {
        for (const definition of source.document?.definitions || []) {
          if (definition.kind === Kind.OPERATION_DEFINITION) {
            result.push({
              filePath: source.location!,
              document: definition,
            });
          }
        }
      }
      cachedOperations = result;
    }
    return cachedOperations;
  };

  const getFragment = (name: string) => getFragments().filter(f => f.document.name.value === name);

  const collectFragments = (
    selectable: FragmentDefinitionNode | OperationDefinitionNode | SelectionSetNode,
    recursive: boolean,
    collected = new Map<string, FragmentDefinitionNode>(),
  ) => {
    visit(selectable, {
      FragmentSpread(spread) {
        const fragmentName = spread.name.value;
        const [fragment] = getFragment(fragmentName);

        if (!fragment) {
          logger.warn(
            `Unable to locate fragment named "${fragmentName}", please make sure it's loaded using "parserOptions.operations"`,
          );
          return;
        }
        if (!collected.has(fragmentName)) {
          collected.set(fragmentName, fragment.document);
          if (recursive) {
            collectFragments(fragment.document, recursive, collected);
          }
        }
      },
    });
    return collected;
  };

  const siblingOperations: SiblingOperations = {
    available: true,
    getFragment,
    getFragments,
    getFragmentByType: typeName =>
      getFragments().filter(f => f.document.typeCondition.name.value === typeName),
    getFragmentsInUse: (selectable, recursive = true) =>
      Array.from(collectFragments(selectable, recursive).values()),
    getOperation: name => getOperations().filter(o => o.document.name?.value === name),
    getOperations,
    getOperationByType: type => getOperations().filter(o => o.document.operation === type),
  };

  siblingOperationsCache.set(documents, siblingOperations);
  return siblingOperations;
}
