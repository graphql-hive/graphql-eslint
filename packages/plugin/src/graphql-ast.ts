import {
  ASTNode,
  Visitor,
  TypeInfo,
  GraphQLSchema,
  ASTKindToNode,
  visit,
  isInterfaceType,
  visitWithTypeInfo,
} from 'graphql';
import { SiblingOperations } from './sibling-operations';

export type ReachableTypes = Set<string>;

let reachableTypes: ReachableTypes;

export function getReachableTypes(schema: GraphQLSchema): ReachableTypes {
  // We don't want cache reachableTypes on test environment
  // Otherwise reachableTypes will be same for all tests
  if (process.env.NODE_ENV !== 'test' && reachableTypes) {
    return reachableTypes;
  }
  reachableTypes = new Set();
  const getTypeName = node => ('type' in node ? getTypeName(node.type) : node.name.value);

  const collect = (node: ASTNode): false | void => {
    const typeName = getTypeName(node);
    if (reachableTypes.has(typeName)) {
      // skip visiting this node if type is already visited
      return false;
    }
    reachableTypes.add(typeName);
    const type = schema.getType(typeName) || schema.getDirective(typeName);

    if (isInterfaceType(type)) {
      const { objects, interfaces } = schema.getImplementations(type);
      for (const { astNode } of [...objects, ...interfaces]) {
        visit(astNode, visitor);
      }
    } else {
      visit(type.astNode, visitor);
    }
  };

  const visitor: Visitor<ASTKindToNode> = {
    ObjectTypeDefinition(node) {
      node.interfaces.forEach(collect);
      return collect(node);
    },
    UnionTypeDefinition(node) {
      node.types.forEach(collect);
      return collect(node);
    },
    InterfaceTypeDefinition: collect,
    InputValueDefinition: collect,
    FieldDefinition: collect,
    Directive: collect,
  };

  for (const type of [schema.getQueryType(), schema.getMutationType(), schema.getSubscriptionType()]) {
    if (type) {
      visit(type.astNode, visitor);
    }
  }
  return reachableTypes;
}

export type UsedFields = Record<string, Set<string>>;

let usedFields: UsedFields;

export function getUsedFields(schema: GraphQLSchema, operations: SiblingOperations): UsedFields {
  // We don't want cache usedFields on test environment
  // Otherwise usedFields will be same for all tests
  if (process.env.NODE_ENV !== 'test' && usedFields) {
    return usedFields;
  }
  usedFields = Object.create(null);
  const typeInfo = new TypeInfo(schema);

  const visitor = visitWithTypeInfo(typeInfo, {
    Field(node): false | void {
      const fieldDef = typeInfo.getFieldDef();
      if (!fieldDef) {
        // skip visiting this node if field is not defined in schema
        return false;
      }
      const parentTypeName = typeInfo.getParentType().name;
      const fieldName = node.name.value;

      usedFields[parentTypeName] ??= new Set();
      usedFields[parentTypeName].add(fieldName);
    },
  });

  const allDocuments = [...operations.getOperations(), ...operations.getFragments()];
  for (const { document } of allDocuments) {
    visit(document, visitor);
  }
  return usedFields;
}
