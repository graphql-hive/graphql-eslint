/*
 * 🚨 IMPORTANT! Do not manually modify this file. Run: `pnpm generate:configs`
 */

import { rule as alphabetize } from './alphabetize/index.js';
import { rule as descriptionStyle } from './description-style/index.js';
import { GRAPHQL_JS_VALIDATIONS } from './graphql-js-validation.js';
import { rule as inputName } from './input-name/index.js';
import { rule as loneExecutableDefinition } from './lone-executable-definition/index.js';
import { rule as matchDocumentFilename } from './match-document-filename/index.js';
import { rule as namingConvention } from './naming-convention/index.js';
import { rule as noAnonymousOperations } from './no-anonymous-operations/index.js';
import { rule as noConflictingUnionMemberFields } from './no-conflicting-union-member-fields/index.js';
import { rule as noDeprecated } from './no-deprecated/index.js';
import { rule as noDuplicateFields } from './no-duplicate-fields/index.js';
import { rule as noHashtagDescription } from './no-hashtag-description/index.js';
import { rule as noOnePlaceFragments } from './no-one-place-fragments/index.js';
import { rule as noRootType } from './no-root-type/index.js';
import { rule as noScalarResultTypeOnMutation } from './no-scalar-result-type-on-mutation/index.js';
import { rule as noTypenamePrefix } from './no-typename-prefix/index.js';
import { rule as noUnreachableTypes } from './no-unreachable-types/index.js';
import { rule as noUnusedFields } from './no-unused-fields/index.js';
import { rule as relayArguments } from './relay-arguments/index.js';
import { rule as relayConnectionTypes } from './relay-connection-types/index.js';
import { rule as relayEdgeTypes } from './relay-edge-types/index.js';
import { rule as relayPageInfo } from './relay-page-info/index.js';
import { rule as requireDeprecationDate } from './require-deprecation-date/index.js';
import { rule as requireDeprecationReason } from './require-deprecation-reason/index.js';
import { rule as requireDescription } from './require-description/index.js';
import { rule as requireFieldOfTypeQueryInMutationResult } from './require-field-of-type-query-in-mutation-result/index.js';
import { rule as requireImportFragment } from './require-import-fragment/index.js';
import { rule as requireNullableFieldsWithOneof } from './require-nullable-fields-with-oneof/index.js';
import { rule as requireNullableResultInRoot } from './require-nullable-result-in-root/index.js';
import { rule as requireSelections } from './require-selections/index.js';
import { rule as requireTypePatternWithOneof } from './require-type-pattern-with-oneof/index.js';
import { rule as selectionSetDepth } from './selection-set-depth/index.js';
import { rule as strictIdInTypes } from './strict-id-in-types/index.js';
import { rule as uniqueEnumValueNames } from './unique-enum-value-names/index.js';
import { rule as uniqueFragmentName } from './unique-fragment-name/index.js';
import { rule as uniqueOperationName } from './unique-operation-name/index.js';

export const rules = {
  ...GRAPHQL_JS_VALIDATIONS,
  alphabetize,
  'description-style': descriptionStyle,
  'input-name': inputName,
  'lone-executable-definition': loneExecutableDefinition,
  'match-document-filename': matchDocumentFilename,
  'naming-convention': namingConvention,
  'no-anonymous-operations': noAnonymousOperations,
  'no-conflicting-union-member-fields': noConflictingUnionMemberFields,
  'no-deprecated': noDeprecated,
  'no-duplicate-fields': noDuplicateFields,
  'no-hashtag-description': noHashtagDescription,
  'no-one-place-fragments': noOnePlaceFragments,
  'no-root-type': noRootType,
  'no-scalar-result-type-on-mutation': noScalarResultTypeOnMutation,
  'no-typename-prefix': noTypenamePrefix,
  'no-unreachable-types': noUnreachableTypes,
  'no-unused-fields': noUnusedFields,
  'relay-arguments': relayArguments,
  'relay-connection-types': relayConnectionTypes,
  'relay-edge-types': relayEdgeTypes,
  'relay-page-info': relayPageInfo,
  'require-deprecation-date': requireDeprecationDate,
  'require-deprecation-reason': requireDeprecationReason,
  'require-description': requireDescription,
  'require-field-of-type-query-in-mutation-result': requireFieldOfTypeQueryInMutationResult,
  'require-import-fragment': requireImportFragment,
  'require-nullable-fields-with-oneof': requireNullableFieldsWithOneof,
  'require-nullable-result-in-root': requireNullableResultInRoot,
  'require-selections': requireSelections,
  'require-type-pattern-with-oneof': requireTypePatternWithOneof,
  'selection-set-depth': selectionSetDepth,
  'strict-id-in-types': strictIdInTypes,
  'unique-enum-value-names': uniqueEnumValueNames,
  'unique-fragment-name': uniqueFragmentName,
  'unique-operation-name': uniqueOperationName,
};
