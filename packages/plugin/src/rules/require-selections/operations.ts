import * as ESTree from 'estree';
import {
  FieldNode,
  getNamedType,
  GraphQLCompositeType,
  GraphQLObjectType,
  isAbstractType,
  isCompositeType,
  Kind,
  OperationDefinitionNode,
  SelectionNode,
  SelectionSetNode,
} from 'graphql';
import { asArray } from '@graphql-tools/utils';
import { GraphQLESTreeNode } from '../../estree-converter/index.js';
import { GraphQLESLintRule, ReportDescriptor } from '../../types.js';
import { englishJoinWords, requireGraphQLOperations, requireGraphQLSchema } from '../../utils.js';
import { RuleOptions } from './index.js';

const RULE_ID = 'require-selections';
const DEFAULT_ID_FIELD_NAME = 'id';

type Selection = SelectionNode | GraphQLESTreeNode<SelectionNode, true>;
type SelectionSet = (
  | Omit<SelectionSetNode, 'selections'>
  | Omit<GraphQLESTreeNode<SelectionSetNode, true>, 'selections'>
) & { selections: ReadonlyArray<Selection> };
type Fragment = { selectionSet: SelectionSet; name?: { value: string } };
type Field = FieldNode | GraphQLESTreeNode<FieldNode, true>;
type SelectionEntry = {
  node: SelectionSet;
  type: GraphQLObjectType;
  loc: ESTree.Position;
  spreads: Set<string>;
};
type FieldEntry = Omit<SelectionEntry, 'type'> & { type: GraphQLCompositeType; parent: Field };

// This traversal is opt-in: the default visitor retains existing fragment and alias behavior.
export const createOperationVisitor: GraphQLESLintRule<RuleOptions, true>['create'] = context => {
  const schema = requireGraphQLSchema(RULE_ID, context);
  const siblings = requireGraphQLOperations(RULE_ID, context);
  const { fieldName = DEFAULT_ID_FIELD_NAME, requireAllFields } = context.options[0] || {};
  const idNames = asArray(fieldName);
  const reported = new Set<string>();
  const checkedChildren = new Set<string>();
  const nodeIds = new Map<SelectionSet, number>();

  // A spread contributes only to runtime object types matching its condition.
  // Shared interface selections apply to every implementor; sibling union branches do not.
  function getFragment(
    selection: Exclude<Selection, { kind: Kind.FIELD }>,
    type: GraphQLObjectType,
  ): Fragment | undefined {
    const fragment =
      selection.kind === Kind.FRAGMENT_SPREAD
        ? siblings.getFragment(selection.name.value)[0]?.document
        : selection;
    const condition = fragment?.typeCondition && schema.getType(fragment.typeCondition.name.value);
    return !condition ||
      condition === type ||
      (isAbstractType(condition) && schema.isSubType(condition, type))
      ? fragment
      : undefined;
  }
  // Merge fields by response name within one runtime type, just as execution does.
  // Recurse from operations so partial fragments are checked in their consumer's context.
  function checkChildren(entries: SelectionEntry[]): void {
    // Reuse identical subtree checks across runtime parent types. Include the full
    // merged selection, report location, and cycle guard to keep contexts isolated.
    const traversalKey = JSON.stringify(
      entries.map(({ node, type, loc, spreads }) => {
        if (!nodeIds.has(node)) nodeIds.set(node, nodeIds.size);
        return [nodeIds.get(node), type.name, loc.line, loc.column, [...spreads].sort()];
      }),
    );
    if (checkedChildren.has(traversalKey)) return;
    checkedChildren.add(traversalKey);
    const fields = new Map<string, FieldEntry[]>();
    function collect({ node, type, loc, spreads }: SelectionEntry): void {
      for (const selection of node.selections) {
        // Sibling ASTs can have numeric or missing locations from another file.
        // Only ESTree positions belong to this buffer; otherwise keep the consumer spread.
        const selectionLoc = typeof selection.loc?.start === 'object' ? selection.loc.start : loc;
        if (selection.kind === Kind.FIELD) {
          const fieldType = getNamedType(type.getFields()[selection.name.value]?.type);
          if (!selection.selectionSet || !isCompositeType(fieldType)) continue;
          const key = `${type.name}.${(selection.alias || selection.name).value}`;
          if (!fields.has(key)) fields.set(key, []);
          fields.get(key)!.push({
            node: selection.selectionSet,
            type: fieldType,
            loc:
              typeof selection.selectionSet.loc?.start === 'object'
                ? selection.selectionSet.loc.start
                : loc,
            parent: selection,
            spreads,
          });
        } else {
          const fragment = getFragment(selection, type);
          if (!fragment || (fragment.name && spreads.has(fragment.name.value))) continue;
          collect({
            node: fragment.selectionSet,
            type,
            loc: selectionLoc,
            spreads: fragment.name ? new Set([...spreads, fragment.name.value]) : spreads,
          });
        }
      }
    }
    for (const entry of entries) {
      collect(entry);
    }
    for (const group of fields.values()) {
      // Prefer a local field for suggestions; external offsets must never edit this file.
      const source = group.find(({ node }) => 'type' in node) || group[0];
      const node: SelectionSet = {
        ...source.node,
        selections: group.flatMap(entry => entry.node.selections),
      };
      // Enumerate possible response objects, not schema/interface definitions.
      // Keeping recursion inside this loop also isolates nested fields across branches.
      // A covariant return type can be concrete while the source selection is still abstract.
      const abstract = isAbstractType(
        'type' in source.node ? getNamedType(source.node.typeInfo().gqlType) : source.type,
      );
      for (const type of isAbstractType(source.type)
        ? schema.getPossibleTypes(source.type)
        : [source.type]) {
        checkSelections(node, type, source.loc, source.parent, abstract);
        checkChildren(group.map(entry => ({ ...entry, type })));
      }
    }
  }
  function checkSelections(
    node: SelectionSet,
    rawType: GraphQLObjectType,
    loc: ESTree.Position,
    parent: Field,
    abstract: boolean,
  ): void {
    const checkedFragmentSpreads = new Set<string>();
    checkFields(rawType);
    function checkFields(type: GraphQLObjectType): void {
      const fields = type.getFields();
      const idFieldsInType = idNames.filter(name => fields[name]);
      if (idFieldsInType.length === 0) {
        return;
      }
      if (requireAllFields) {
        for (const idName of idFieldsInType) {
          report([idName]);
        }
      } else {
        report(idFieldsInType);
      }
    }
    function report(names: string[]): void {
      const visited = new Set<string>();
      function hasIdField({ selections }: SelectionSet): boolean {
        return selections.some(selection => {
          if (selection.kind === Kind.FIELD) {
            if (!requireAllFields && selection.alias && names.includes(selection.alias.value)) {
              return true;
            }
            return names.includes(selection.name.value);
          }
          const fragment = getFragment(selection, rawType);
          if (fragment && (!fragment.name || !visited.has(fragment.name.value))) {
            if (fragment.name) {
              visited.add(fragment.name.value);
              checkedFragmentSpreads.add(fragment.name.value);
            }
            return hasIdField(fragment.selectionSet);
          }
          return false;
        });
      }
      const hasId = hasIdField(node);
      if (hasId) {
        return;
      }
      const fieldName = englishJoinWords(
        names.map(name => `\`${(parent.alias || parent.name).value}.${name}\``),
      );
      const pluralSuffix = names.length > 1 ? 's' : '';
      const addition =
        checkedFragmentSpreads.size === 0
          ? ''
          : ` or add to used fragment${
              checkedFragmentSpreads.size > 1 ? 's' : ''
            } ${englishJoinWords([...checkedFragmentSpreads].map(name => `\`${name}\``))}`;
      const problem: ReportDescriptor = {
        loc,
        messageId: RULE_ID,
        data: {
          pluralSuffix,
          fieldName,
          addition: addition + (abstract ? ` for type \`${rawType.name}\`` : ''),
        },
      };
      if ('type' in parent) {
        // Check every fragment branch: even mutually exclusive types must have compatible
        // response shapes. Do not insert a field whose name aliases another field already.
        const aliases = new Set<string>();
        const seen = new Set<string>();
        function collectAliases({ selections }: SelectionSet): void {
          for (const selection of selections) {
            if (selection.kind === Kind.FIELD) {
              if (selection.alias && selection.alias.value !== selection.name.value) {
                aliases.add(selection.alias.value);
              }
            } else {
              const fragment: Fragment | undefined =
                selection.kind === Kind.FRAGMENT_SPREAD
                  ? siblings.getFragment(selection.name.value)[0]?.document
                  : selection;
              if (!fragment || (fragment.name && seen.has(fragment.name.value))) continue;
              if (fragment.name) seen.add(fragment.name.value);
              collectAliases(fragment.selectionSet);
            }
          }
        }
        collectAliases(node);
        problem.suggest = names
          .filter(idName => !aliases.has(idName))
          .map(idName => ({
            desc: `Add \`${idName}\` selection`,
            fix: fixer => {
              // A concrete-only field cannot be added directly to an interface or union.
              const [start, end] = parent.selectionSet!.selections[0].range;
              return fixer.insertTextBeforeRange(
                [start, end],
                abstract ? `... on ${rawType.name} { ${idName} } ` : `${idName} `,
              );
            },
          }));
      }
      // Shared nested fields can be reached through several runtime parent types.
      // Do not repeat an identical diagnostic at the same consumer location.
      const key = JSON.stringify([loc, problem.data]);
      if (reported.has(key)) return;
      reported.add(key);
      context.report(problem);
    }
  }
  return {
    OperationDefinition(node: GraphQLESTreeNode<OperationDefinitionNode, true>) {
      const type = node.selectionSet.typeInfo().gqlType;
      if (!(type instanceof GraphQLObjectType)) return;
      checkChildren([
        {
          node: node.selectionSet,
          type,
          loc: node.loc.start,
          spreads: new Set(),
        },
      ]);
    },
  };
};
