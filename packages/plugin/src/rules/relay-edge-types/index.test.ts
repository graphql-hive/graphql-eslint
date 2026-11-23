import { ruleTester, withSchema } from '../../../__tests__/test-utils.js';
import { rule, RuleOptions } from './index.js';

ruleTester.run<RuleOptions>('relay-edge-types', rule, {
  valid: [
    withSchema({
      name: 'when cursor returns string',
      options: [{ shouldImplementNode: false }],
      code: /* GraphQL */ `
        type AEdge {
          node: Int!
          cursor: String!
        }
        type AConnection {
          edges: [AEdge]
        }
      `,
    }),
    withSchema({
      name: 'cursor returns scalar',
      code: /* GraphQL */ `
        scalar Email
        type AEdge {
          node: Email!
          cursor: Email!
        }
        type AConnection {
          edges: [AEdge]
        }
      `,
    }),
    withSchema({
      name: 'with Edge suffix',
      options: [{ withEdgeSuffix: true }],
      code: /* GraphQL */ `
        scalar Email
        type AEdge {
          node: Email!
          cursor: Email!
        }
        type AConnection {
          edges: [AEdge]
        }
      `,
    }),
    withSchema({
      name: 'should implements Node',
      options: [{ shouldImplementNode: true }],
      code: /* GraphQL */ `
        interface Node {
          id: ID!
        }
        type User implements Node {
          id: ID!
        }
        type AEdge {
          node: User!
          cursor: String!
        }
        type AConnection {
          edges: [AEdge]
        }
      `,
    }),
    withSchema({
      name: 'should not throw when not Object type is used',
      code: /* GraphQL */ `
        type AEdge {
          node: Int!
          cursor: String!
        }
        type AConnection {
          edges: [AEdge]
        }
      `,
    }),
  ],
  invalid: [
    withSchema({
      name: 'Edge type must be Object type',
      options: [{ shouldImplementNode: false, listTypeCanWrapOnlyEdgeType: false }],
      code: /* GraphQL */ `
        type PageInfo
        type BConnection
        type DConnection
        scalar AEdge
        union BEdge = PageInfo
        enum CEdge
        interface DEdge
        type AConnection {
          edges: [AEdge]
          pageInfo: PageInfo!
        }
        extend type BConnection {
          edges: [BEdge!]
          pageInfo: PageInfo!
        }
        type CConnection {
          edges: [CEdge]!
          pageInfo: PageInfo!
        }
        extend type DConnection {
          edges: [DEdge!]!
          pageInfo: PageInfo!
        }
      `,
      errors: 4,
    }),
    withSchema({
      name: 'should report when fields is missing',
      code: /* GraphQL */ `
        type PageInfo
        type AEdge
        type AConnection {
          edges: [AEdge]
          pageInfo: PageInfo!
        }
      `,
      errors: 2,
    }),
    withSchema({
      name: 'should report cursor when list is used',
      options: [{ shouldImplementNode: false, listTypeCanWrapOnlyEdgeType: false }],
      code: /* GraphQL */ `
        type PageInfo
        type AEdge {
          node: [PageInfo!]!
          cursor: [PageInfo!]!
        }
        type AConnection {
          edges: [AEdge]
          pageInfo: PageInfo!
        }
      `,
      errors: 2,
    }),
    withSchema({
      name: 'should report when without Edge suffix',
      options: [{ withEdgeSuffix: true }],
      code: /* GraphQL */ `
        scalar Email
        type Aedge {
          node: Email!
          cursor: Email!
        }
        type AConnection {
          edges: [Aedge]
        }
      `,
      errors: 1,
    }),
    withSchema({
      name: 'list type',
      options: [{ listTypeCanWrapOnlyEdgeType: true }],
      code: /* GraphQL */ `
        type AEdge {
          node: Int!
          cursor: String!
        }
        type AConnection {
          edges: [AEdge]
        }
        type User {
          comments: [Int]
          likes: [Int!]
          messages: [Int]!
          posts: [Int!]!
        }
      `,
      errors: 4,
    }),
    withSchema({
      name: 'should implements Node',
      options: [{ shouldImplementNode: true }],
      code: /* GraphQL */ `
        type User {
          id: ID!
        }
        type AEdge {
          node: User!
          cursor: String!
        }
        type AConnection {
          edges: [AEdge]
        }
      `,
      errors: 1,
    }),
  ],
});
