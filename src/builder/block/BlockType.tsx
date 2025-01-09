/**
 * A collection of block types.
 *
 * A block type is an object that defines a set of components and their layout.
 * Each component is an object with a `type` property, and possibly a displayed text.
 */
export const BlockType = {
    'CLAUSE': {
        components: [
            {
                type: 'name'
            }
        ]
    },
    'OPERATOR': {
        components: [
            {
                type: 'name'
            }
        ]
    },
    'BRACKET': {
        components: [
            {
                type: 'name'
            }
        ]
    },
    'NODE': {
        components: [
            {
                type: 'fixed',
                text: '('
            },
            {
                type: 'select',
                text: '',
                id: 'alias',
                class: 'variable'
            },
            {
                type: 'fixed',
                text: ':',
                dependson: 3
            },
            {
                type: 'select',
                text: '',
                id: 'label',
                class: 'label',
            },
            {
                type: 'fixed',
                text: ')'
            },
        ]
    },
    'RELATIONSHIP': {
        components: [
            {
                type: 'option',
                text: '-',
                options: ['-', '<-']
            },
            {
                type: 'fixed',
                text: '['
            },
            {
                type: 'select',
                text: '',
                id: 'alias',
                class: 'variable'
            },
            {
                type: 'fixed',
                text: ':',
                dependson: 4
            },
            {
                type: 'select',
                text: '',
                id: 'type',
                class: 'reltype'
            },
            {
                type: 'fixed',
                text: ']'
            },
            {
                type: 'option',
                text: '-',
                options: ['-', '->']
            },
        ]
    },
    'COMPARISON': {
        components: [
            {
                type: 'select',
                text: '',
                id: 'var1',
                class: 'variable'
            },
            {
                type: 'option',
                text: ' = ',
                options: [' < ', ' <= ', ' = ', ' >= ', ' > ', ' <> ']
            },
            {
                type: 'select',
                text: '',
                id: 'var2',
                class: 'variable'
            }
        ]
    },
    'FUNCTION': {
        components: [
            {
                type: 'fixed',
                text: '',
                id: 'name',
            },
            {
                type: 'fixed',
                text: '(',
            },
            {
                type: 'select',
                text: '',
                id: 'param',
                class: 'variable'
            },
            {
                type: 'fixed',
                text: ')'
            },
        ]
    },
    'TRANSFORMER': {
        components: [
            {
                type: 'fixed',
                text: 'AS '
            },
            {
                type: 'select',
                text: '',
                id: 'param',
                class: 'variable'
            }
        ]
    },
    'NULL_COMPARISON': {
        components: [
            {
                type: 'select',
                text: '',
                id: 'var',
                class: 'variable'
            },
            {
                type: 'option',
                text: ' IS NULL ',
                options: [' IS NULL ', ' IS NOT NULL ']
            }
        ]
    },
    'STRING_COMPARISON': {
        components: [
            {
                type: 'select',
                text: '',
                id: 'var1',
                class: 'variable'
            },
            {
                type: 'option',
                text: ' CONTAINS ',
                options: [' CONTAINS ', ' STARTS WITH ', ' ENDS WITH ', ' =~ ']
            },
            {
                type: 'select',
                text: '',
                id: 'var2',
                class: 'variable'
            }
        ]
    },
    'VARIABLE': {
        components: [
            {
                type: 'select',
                text: '',
                id: 'variable',
                class: 'variable'
            },
        ]
    }
}
