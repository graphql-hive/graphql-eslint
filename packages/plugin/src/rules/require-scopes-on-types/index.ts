import {GraphQLESLintRule, GraphQLESTreeNode} from "@/types.js";
import {
    ConstListValueNode,
    ObjectTypeDefinitionNode,
    TypeExtensionNode
} from "graphql";

const RULE_ID = 'require-scopes-on-types';

export const rule: GraphQLESLintRule = {
    meta: {
        type: 'problem',
        docs: {
            category: 'Schema',
            description: '',
            url: `https://the-guild.dev/graphql/eslint/rules/${RULE_ID}`,
            examples: [
                {
                    title: 'Incorrect',
                    code: /* GraphQL */ `
                        type InvalidType { foo: String }
                    `,
                },
                {
                    title: 'Correct',
                    code: /* GraphQL */ `
                        type ValidType @requiresScopes(scopes: ["my-scope"]) { foo: String }
                    `,
                },
            ]
        },
        messages: {
            [RULE_ID]: 'All types must have the @requiresScopes directive applied to them.'
        },
        schema: [],
    },
    create(context) {
        function hasDefinedScopes(node: GraphQLESTreeNode<ObjectTypeDefinitionNode> | TypeExtensionNode): boolean {
            const scopeDirective = (node.directives || []).find((dir) => dir.name.value === 'requiresScopes');
            if (!scopeDirective) {
                return false;
            }

            return (scopeDirective.arguments || []).filter(a => a.name.value === 'scopes')
                .some(v => (v.value as ConstListValueNode).values.length === 0);
        }

        function report(node: GraphQLESTreeNode<ObjectTypeDefinitionNode>) {
            context.report({
                node: node as any,
                messageId: RULE_ID
            });
        }

        return {
            ObjectTypeDefinition(node) {
                if (!hasDefinedScopes(node)) {
                    report(node);
                }
            }
        }
    }
}