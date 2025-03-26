// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html

exports[`Parser > parseForESLint() should return ast and tokens 1`] = `
{
  body: [
    {
      definitions: [
        {
          description: {
            block: true,
            kind: StringValue,
            leadingComments: [],
            loc: {
              end: {
                column: 51,
                line: 2,
              },
              source: 
      """
      generic query placeholder
      """
      type Query
    ,
              start: {
                column: 6,
                line: 2,
              },
            },
            range: [
              7,
              52,
            ],
            rawNode: [Function],
            type: StringValue,
            typeInfo: [Function],
            value: generic query placeholder,
          },
          directives: [],
          fields: [],
          interfaces: [],
          kind: ObjectTypeDefinition,
          leadingComments: [
            {
              type: Block,
              value: generic query placeholder,
            },
          ],
          loc: {
            end: {
              column: 11,
              line: 5,
            },
            source: 
      """
      generic query placeholder
      """
      type Query
    ,
            start: {
              column: 6,
              line: 2,
            },
          },
          name: {
            kind: Name,
            leadingComments: [],
            loc: {
              end: {
                column: 16,
                line: 5,
              },
              source: 
      """
      generic query placeholder
      """
      type Query
    ,
              start: {
                column: 11,
                line: 5,
              },
            },
            range: [
              64,
              69,
            ],
            rawNode: [Function],
            type: Name,
            typeInfo: [Function],
            value: Query,
          },
          range: [
            7,
            69,
          ],
          rawNode: [Function],
          type: ObjectTypeDefinition,
          typeInfo: [Function],
        },
      ],
      kind: Document,
      leadingComments: [],
      loc: {
        end: {
          column: 4,
          line: 6,
        },
        source: 
      """
      generic query placeholder
      """
      type Query
    ,
        start: {
          column: 0,
          line: 1,
        },
      },
      range: [
        0,
        74,
      ],
      rawNode: [Function],
      type: Document,
      typeInfo: [Function],
    },
  ],
  comments: [],
  loc: {
    end: {
      column: 4,
      line: 6,
    },
    source: 
      """
      generic query placeholder
      """
      type Query
    ,
    start: {
      column: 0,
      line: 1,
    },
  },
  range: [
    0,
    74,
  ],
  sourceType: script,
  tokens: [
    {
      loc: {
        end: {
          column: 51,
          line: 2,
        },
        start: {
          column: 6,
          line: 2,
        },
      },
      range: [
        7,
        52,
      ],
      type: BlockString,
      value: generic query placeholder,
    },
    {
      loc: {
        end: {
          column: 10,
          line: 5,
        },
        start: {
          column: 6,
          line: 5,
        },
      },
      range: [
        59,
        63,
      ],
      type: Name,
      value: type,
    },
    {
      loc: {
        end: {
          column: 16,
          line: 5,
        },
        start: {
          column: 11,
          line: 5,
        },
      },
      range: [
        64,
        69,
      ],
      type: Name,
      value: Query,
    },
  ],
  type: Program,
}
`;

exports[`Parser > should allow to pass inline schema string as input 1`] = `
{
  body: [
    {
      definitions: [
        {
          description: undefined,
          directives: [],
          fields: [
            {
              arguments: [],
              description: undefined,
              directives: [],
              gqlType: {
                kind: NamedType,
                leadingComments: [],
                loc: {
                  end: {
                    column: 19,
                    line: 3,
                  },
                  source: 
      type Query {
        foo: String
      }
    ,
                  start: {
                    column: 13,
                    line: 3,
                  },
                },
                name: {
                  kind: Name,
                  leadingComments: [],
                  loc: {
                    end: {
                      column: 19,
                      line: 3,
                    },
                    source: 
      type Query {
        foo: String
      }
    ,
                    start: {
                      column: 13,
                      line: 3,
                    },
                  },
                  range: [
                    33,
                    39,
                  ],
                  rawNode: [Function],
                  type: Name,
                  typeInfo: [Function],
                  value: String,
                },
                range: [
                  33,
                  39,
                ],
                rawNode: [Function],
                type: NamedType,
                typeInfo: [Function],
              },
              kind: FieldDefinition,
              leadingComments: [],
              loc: {
                end: {
                  column: 13,
                  line: 3,
                },
                source: 
      type Query {
        foo: String
      }
    ,
                start: {
                  column: 8,
                  line: 3,
                },
              },
              name: {
                kind: Name,
                leadingComments: [],
                loc: {
                  end: {
                    column: 11,
                    line: 3,
                  },
                  source: 
      type Query {
        foo: String
      }
    ,
                  start: {
                    column: 8,
                    line: 3,
                  },
                },
                range: [
                  28,
                  31,
                ],
                rawNode: [Function],
                type: Name,
                typeInfo: [Function],
                value: foo,
              },
              range: [
                28,
                39,
              ],
              rawNode: [Function],
              type: FieldDefinition,
              typeInfo: [Function],
            },
          ],
          interfaces: [],
          kind: ObjectTypeDefinition,
          leadingComments: [],
          loc: {
            end: {
              column: 46,
              line: 4,
            },
            source: 
      type Query {
        foo: String
      }
    ,
            start: {
              column: 6,
              line: 2,
            },
          },
          name: {
            kind: Name,
            leadingComments: [],
            loc: {
              end: {
                column: 16,
                line: 2,
              },
              source: 
      type Query {
        foo: String
      }
    ,
              start: {
                column: 11,
                line: 2,
              },
            },
            range: [
              12,
              17,
            ],
            rawNode: [Function],
            type: Name,
            typeInfo: [Function],
            value: Query,
          },
          range: [
            7,
            47,
          ],
          rawNode: [Function],
          type: ObjectTypeDefinition,
          typeInfo: [Function],
        },
      ],
      kind: Document,
      leadingComments: [],
      loc: {
        end: {
          column: 4,
          line: 5,
        },
        source: 
      type Query {
        foo: String
      }
    ,
        start: {
          column: 0,
          line: 1,
        },
      },
      range: [
        0,
        52,
      ],
      rawNode: [Function],
      type: Document,
      typeInfo: [Function],
    },
  ],
  comments: [],
  loc: {
    end: {
      column: 4,
      line: 5,
    },
    source: 
      type Query {
        foo: String
      }
    ,
    start: {
      column: 0,
      line: 1,
    },
  },
  range: [
    0,
    52,
  ],
  sourceType: script,
  tokens: [
    {
      loc: {
        end: {
          column: 10,
          line: 2,
        },
        start: {
          column: 6,
          line: 2,
        },
      },
      range: [
        7,
        11,
      ],
      type: Name,
      value: type,
    },
    {
      loc: {
        end: {
          column: 16,
          line: 2,
        },
        start: {
          column: 11,
          line: 2,
        },
      },
      range: [
        12,
        17,
      ],
      type: Name,
      value: Query,
    },
    {
      loc: {
        end: {
          column: 18,
          line: 2,
        },
        start: {
          column: 17,
          line: 2,
        },
      },
      range: [
        18,
        19,
      ],
      type: {,
      value: undefined,
    },
    {
      loc: {
        end: {
          column: 11,
          line: 3,
        },
        start: {
          column: 8,
          line: 3,
        },
      },
      range: [
        28,
        31,
      ],
      type: Name,
      value: foo,
    },
    {
      loc: {
        end: {
          column: 12,
          line: 3,
        },
        start: {
          column: 11,
          line: 3,
        },
      },
      range: [
        31,
        32,
      ],
      type: :,
      value: undefined,
    },
    {
      loc: {
        end: {
          column: 19,
          line: 3,
        },
        start: {
          column: 13,
          line: 3,
        },
      },
      range: [
        33,
        39,
      ],
      type: Name,
      value: String,
    },
    {
      loc: {
        end: {
          column: 7,
          line: 4,
        },
        start: {
          column: 6,
          line: 4,
        },
      },
      range: [
        46,
        47,
      ],
      type: },
      value: undefined,
    },
  ],
  type: Program,
}
`;
