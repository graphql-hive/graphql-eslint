import { parse } from 'graphql';
import { getSiblings } from '../src/siblings.js';

describe('sibling document snapshots', () => {
  it('reuses the index while the loaded document array is unchanged', () => {
    const documents = [
      { location: 'fields.graphql', document: parse('fragment Fields on User { id }') },
    ];
    const siblings = getSiblings(documents);
    const fragments = siblings.getFragments();

    expect(getSiblings(documents)).toBe(siblings);
    expect(getSiblings(documents).getFragments()).toBe(fragments);
  });

  it('keeps refreshed fragments and operations separate from the previous snapshot', () => {
    const load = (field: string) => [
      {
        location: 'document.graphql',
        document: parse(`query Example { user { ${field} } } fragment Fields on User { ${field} }`),
      },
    ];
    const previousDocuments = load('id');
    const previous = getSiblings(previousDocuments);
    const previousFragments = previous.getFragments();
    const previousOperations = previous.getOperations();
    const currentDocuments = load('name');
    const current = getSiblings(currentDocuments);

    expect(current).not.toBe(previous);
    expect(current.getFragment('Fields')[0].document).toBe(
      currentDocuments[0].document.definitions[1],
    );
    expect(current.getOperation('Example')[0].document).toBe(
      currentDocuments[0].document.definitions[0],
    );
    expect(getSiblings(previousDocuments).getFragments()).toBe(previousFragments);
    expect(getSiblings(previousDocuments).getOperations()).toBe(previousOperations);
    expect(previousFragments[0].document).toBe(previousDocuments[0].document.definitions[1]);
    expect(previousOperations[0].document).toBe(previousDocuments[0].document.definitions[0]);
  });
});
