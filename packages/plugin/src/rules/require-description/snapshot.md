// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html

exports[`require-description > invalid > Invalid #1 1`] = `
#### ⌨️ Code

      1 | type User { id: ID }

#### ⚙️ Options

    {
      "ObjectTypeDefinition": true
    }

#### ❌ Error

    > 1 | type User { id: ID }
        |      ^^^^ Description is required for type "User"
`;

exports[`require-description > invalid > Invalid #2 1`] = `
#### ⌨️ Code

      1 | interface Node { id: ID! }

#### ⚙️ Options

    {
      "InterfaceTypeDefinition": true
    }

#### ❌ Error

    > 1 | interface Node { id: ID! }
        |           ^^^^ Description is required for interface "Node"
`;

exports[`require-description > invalid > Invalid #3 1`] = `
#### ⌨️ Code

      1 | enum Role { ADMIN }

#### ⚙️ Options

    {
      "EnumTypeDefinition": true
    }

#### ❌ Error

    > 1 | enum Role { ADMIN }
        |      ^^^^ Description is required for enum "Role"
`;

exports[`require-description > invalid > Invalid #4 1`] = `
#### ⌨️ Code

      1 | scalar Email

#### ⚙️ Options

    {
      "ScalarTypeDefinition": true
    }

#### ❌ Error

    > 1 | scalar Email
        |        ^^^^^ Description is required for scalar "Email"
`;

exports[`require-description > invalid > Invalid #5 1`] = `
#### ⌨️ Code

      1 | input CreateUserInput { email: Email! }

#### ⚙️ Options

    {
      "InputObjectTypeDefinition": true
    }

#### ❌ Error

    > 1 | input CreateUserInput { email: Email! }
        |       ^^^^^^^^^^^^^^^ Description is required for input "CreateUserInput"
`;

exports[`require-description > invalid > Invalid #6 1`] = `
#### ⌨️ Code

      1 | union Media = Book | Movie

#### ⚙️ Options

    {
      "UnionTypeDefinition": true
    }

#### ❌ Error

    > 1 | union Media = Book | Movie
        |       ^^^^^ Description is required for union "Media"
`;

exports[`require-description > invalid > Invalid #7 1`] = `
#### ⌨️ Code

      1 | directive @auth(requires: Role!) on FIELD_DEFINITION

#### ⚙️ Options

    {
      "DirectiveDefinition": true
    }

#### ❌ Error

    > 1 | directive @auth(requires: Role!) on FIELD_DEFINITION
        |            ^^^^ Description is required for directive "auth"
`;

exports[`require-description > invalid > Invalid #8 1`] = `
#### ⌨️ Code

      1 | type User { email: Email! }

#### ⚙️ Options

    {
      "FieldDefinition": true
    }

#### ❌ Error

    > 1 | type User { email: Email! }
        |             ^^^^^ Description is required for field "email" in type "User"
`;

exports[`require-description > invalid > Invalid #9 1`] = `
#### ⌨️ Code

      1 | input CreateUserInput { email: Email! }

#### ⚙️ Options

    {
      "InputValueDefinition": true
    }

#### ❌ Error

    > 1 | input CreateUserInput { email: Email! }
        |                         ^^^^^ Description is required for input value "email" in input "CreateUserInput"
`;

exports[`require-description > invalid > Invalid #10 1`] = `
#### ⌨️ Code

      1 | enum Role { ADMIN }

#### ⚙️ Options

    {
      "EnumValueDefinition": true
    }

#### ❌ Error

    > 1 | enum Role { ADMIN }
        |             ^^^^^ Description is required for enum value "ADMIN" in enum "Role"
`;

exports[`require-description > invalid > Invalid #17 1`] = `
#### ⌨️ Code

      1 | type Query { user(id: String!): User! }

#### ⚙️ Options

    {
      "rootField": true
    }

#### ❌ Error

    > 1 | type Query { user(id: String!): User! }
        |              ^^^^ Description is required for field "user" in type "Query"
`;

exports[`require-description > invalid > Invalid #18 1`] = `
#### ⌨️ Code

      1 | type Mutation { createUser(id: [ID!]!): User! }

#### ⚙️ Options

    {
      "rootField": true
    }

#### ❌ Error

    > 1 | type Mutation { createUser(id: [ID!]!): User! }
        |                 ^^^^^^^^^^ Description is required for field "createUser" in type "Mutation"
`;

exports[`require-description > invalid > Invalid #19 1`] = `
#### ⌨️ Code

      1 |         type MySubscription {
      2 |           users: [User!]!
      3 |         }
      4 |         schema {
      5 |           subscription: MySubscription
      6 |         }

#### ⚙️ Options

    {
      "rootField": true
    }

#### ❌ Error

      1 |         type MySubscription {
    > 2 |           users: [User!]!
        |           ^^^^^ Description is required for field "users" in type "MySubscription"
      3 |         }
`;

exports[`require-description > invalid > ignoredSelectors 1`] = `
#### ⌨️ Code

       1 |         type Query {
       2 |           user: User
       3 |         }
       4 |         type User {
       5 |           id: ID!
       6 |           name: String!
       7 |           friends(first: Int, after: String): FriendConnection!
       8 |         }
       9 |         type FriendConnection {
      10 |           edges: [FriendEdge]
      11 |           pageInfo: PageInfo!
      12 |         }
      13 |         type FriendEdge {
      14 |           cursor: String!
      15 |           node: Friend!
      16 |         }
      17 |         type Friend {
      18 |           id: ID!
      19 |           name: String!
      20 |         }
      21 |         type PageInfo {
      22 |           hasPreviousPage: Boolean!
      23 |           hasNextPage: Boolean!
      24 |           startCursor: String
      25 |           endCursor: String
      26 |         }

#### ⚙️ Options

    {
      "types": true,
      "ignoredSelectors": [
        "[type=ObjectTypeDefinition][name.value=PageInfo]",
        "[type=ObjectTypeDefinition][name.value=/(Connection|Edge)$/]"
      ]
    }

#### ❌ Error 1/3

    > 1 |         type Query {
        |              ^^^^^ Description is required for type "Query"
      2 |           user: User

#### ❌ Error 2/3

      3 |         }
    > 4 |         type User {
        |              ^^^^ Description is required for type "User"
      5 |           id: ID!

#### ❌ Error 3/3

      16 |         }
    > 17 |         type Friend {
         |              ^^^^^^ Description is required for type "Friend"
      18 |           id: ID!
`;

exports[`require-description > invalid > rootField with more than one root type 1`] = `
#### ⌨️ Code

      1 |         type Query {
      2 |           user: User
      3 |         }
      4 |         type Mutation {
      5 |           createUser: User
      6 |         }
      7 |         type User {
      8 |           id: ID
      9 |         }

#### ⚙️ Options

    {
      "rootField": true
    }

#### ❌ Error 1/2

      1 |         type Query {
    > 2 |           user: User
        |           ^^^^ Description is required for field "user" in type "Query"
      3 |         }

#### ❌ Error 2/2

      4 |         type Mutation {
    > 5 |           createUser: User
        |           ^^^^^^^^^^ Description is required for field "createUser" in type "Mutation"
      6 |         }
`;

exports[`require-description > invalid > should disable description for ObjectTypeDefinition 1`] = `
#### ⌨️ Code

      1 |         type CreateOneUserPayload {
      2 |           recordId: MongoID
      3 |           record: User
      4 |         }

#### ⚙️ Options

    {
      "types": true,
      "ObjectTypeDefinition": false,
      "FieldDefinition": true
    }

#### ❌ Error 1/2

      1 |         type CreateOneUserPayload {
    > 2 |           recordId: MongoID
        |           ^^^^^^^^ Description is required for field "recordId" in type "CreateOneUserPayload"
      3 |           record: User

#### ❌ Error 2/2

      2 |           recordId: MongoID
    > 3 |           record: User
        |           ^^^^^^ Description is required for field "record" in type "CreateOneUserPayload"
      4 |         }
`;

exports[`require-description > invalid > should ignore comments before fragment definition 1`] = `
#### ⌨️ Code

       1 |         # BAD
       2 |         fragment UserFields on User {
       3 |           id
       4 |         }
       5 |
       6 |         query {
       7 |           user {
       8 |             ...UserFields
       9 |           }
      10 |         }

#### ⚙️ Options

    {
      "OperationDefinition": true
    }

#### ❌ Error

      5 |
    > 6 |         query {
        |         ^^^^^ Description is required for query
      7 |           user {
`;

exports[`require-description > invalid > should report because of linesBefore !== 1 1`] = `
#### ⌨️ Code

      1 |         # linesBefore !== 1
      2 |
      3 |         query {
      4 |           foo
      5 |         }

#### ⚙️ Options

    {
      "OperationDefinition": true
    }

#### ❌ Error

      2 |
    > 3 |         query {
        |         ^^^^^ Description is required for query
      4 |           foo
`;

exports[`require-description > invalid > should report because skips comment that starts with \`eslint\` 1`] = `
#### ⌨️ Code

      1 |         # eslint-disable-next-line semi
      2 |         query {
      3 |           foo
      4 |         }

#### ⚙️ Options

    {
      "OperationDefinition": true
    }

#### ❌ Error

      1 |         # eslint-disable-next-line semi
    > 2 |         query {
        |         ^^^^^ Description is required for query
      3 |           foo
`;

exports[`require-description > invalid > should validate mutation 1`] = `
#### ⌨️ Code

      1 | mutation createUser { foo }

#### ⚙️ Options

    {
      "OperationDefinition": true
    }

#### ❌ Error

    > 1 | mutation createUser { foo }
        | ^^^^^^^^ Description is required for mutation "createUser"
`;

exports[`require-description > invalid > should validate subscription 1`] = `
#### ⌨️ Code

      1 | subscription commentAdded { foo }

#### ⚙️ Options

    {
      "OperationDefinition": true
    }

#### ❌ Error

    > 1 | subscription commentAdded { foo }
        | ^^^^^^^^^^^^ Description is required for subscription "commentAdded"
`;
