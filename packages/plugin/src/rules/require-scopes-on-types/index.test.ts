import {ruleTester} from '../../../__tests__/test-utils.js';
import {rule} from './index.js';

const TYPE_WITH_SCOPES = /* GraphQL */ `
    type ValidType @requiresScopes(scopes: ["my-scope"]) {
        foo: String!
    }
`;

const TYPE_WITHOUT_SCOPES = /* GraphQL */ `
    type InvalidType {
        foo: String!
    }
`;

const TYPE_WITH_EMPTY_SCOPES = /* GraphQL */ `
    type InvalidType @requiresScopes(scopes: []) {
        foo: String!
    }
`;

ruleTester.run('require-scopes-on-types', rule, {
    valid: [
        {
            name: 'should ignore types that have the @requiresScopes directive',
            code: TYPE_WITH_SCOPES,
        }
    ],
    invalid: [{
        name: 'should report types that do not have the @requiresScopes directive',
        code: TYPE_WITHOUT_SCOPES
    },
        {
            name: 'should report types that have the @requireScopes directive but havent defined any scopes',
            code: TYPE_WITH_EMPTY_SCOPES
        }
    ]
});