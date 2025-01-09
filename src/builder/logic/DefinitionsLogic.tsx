
import { BlockType } from "../block/BlockType";

/**
 * Sanitizes a value so that it can be safely inserted into a Cypher string.
 * If the value is an object, it will be converted to a string and wrapped in
 * single quotes. Otherwise, the value is returned as is.
 * @param {any} value The value to sanitize
 * @returns {any} The sanitized value
 */
function sanitize(value: any) {
    if (typeof value === 'object') {
        return "'" + value.toString() + "'";
    }
    return value;
}

export function insertNodeDefinition(elements: any, alias: string, label: string) {
    const id = crypto.randomUUID();
    const text = ['(', alias, ':', label, ')'];
    elements[id] = {
        type: 'NODE',
        text: text
    };
    return id;
}

export function insertRelationshipDefinition(elements: any, alias: string, type: string, direction: string = '') {

    const id = crypto.randomUUID();
    const text = ['-', '[', alias, ':', type, ']', '-'];
    if (direction == 'INCOMING') {
        text[0] = '<-';
    }
    if (direction == 'OUTGOING') {
        text[6] = '->';
    }
    elements[id] = {
        type: 'RELATIONSHIP',
        text: text
    };
    return id;
}

export function insertComparisonDefinition(elements: any, var1: string, var2: string, comparison: string = '=') {
    const id = crypto.randomUUID();
    const text = [sanitize(var1), ' ' + comparison + ' ', sanitize(var2)];
    elements[id] = {
        type: 'COMPARISON',
        text: text
    };
    return id;
}

export function insertStringComparisonDefinition(elements: any, var1: string, var2: string, comparison = ' CONTAINS ') {
    const id = crypto.randomUUID();
    const text = [sanitize(var1), comparison, sanitize(var2)];
    elements[id] = {
        type: 'STRING_COMPARISON',
        text: text
    };
    return id;
}

export function insertNullComparisonDefinition(elements: any, var1: string) {
    const id = crypto.randomUUID();
    const text = [sanitize(var1), ' IS NULL '];
    elements[id] = {
        type: 'NULL_COMPARISON',
        text: text
    };
    return id;
}

export function insertVariableDefinition(elements: any, variable: string) {
    const id = crypto.randomUUID();
    const text = [sanitize(variable)];
    elements[id] = {
        type: 'VARIABLE',
        text: text
    };
    return id;
}

export function insertTransformationDefinition(elements: any, variable: string, value = '') {
    const id = crypto.randomUUID();
    const text = [sanitize(variable), value];
    elements[id] = {
        type: 'TRANSFORMER',
        text: text
    };
    return id;
}


export function insertClauseDefinition(elements: any, clause: string) {
    const id = crypto.randomUUID();
    const text = [clause];
    elements[id] = {
        type: 'CLAUSE',
        text: text
    };
    return id;
}

export function insertOperatorDefinition(elements: any, clause: string) {
    const id = crypto.randomUUID();
    const text = [clause];
    elements[id] = {
        type: 'OPERATOR',
        text: text
    };
    return id;
}

export function insertBracketDefinition(elements: any, clause: string) {
    const id = crypto.randomUUID();
    const text = [clause];
    elements[id] = {
        type: 'BRACKET',
        text: text
    };
    return id;
}

export function createElementsDefinition(words: any[], properties?: any) {
    const elements = {};
    words.map((word: any) => {
        const id = crypto.randomUUID();
        const components = BlockType[properties?.type]?.components ?? [];

        const text = components.map((component: any) => {
            if (component.type === 'fixed' || component.type === 'select') {
                return component.text;
            } else if (component.type === 'name') {
                return word;
            }
        })
        elements[id] = {
            type: properties?.type,
            text: text
        };
    });
    return elements;
}

export function insertFunctionDefinition(elements: any, name: string, alias: string = '') {
    const id = crypto.randomUUID();
    const text = [name, '(', alias, ')'];
    elements[id] = {
        type: 'FUNCTION',
        text: text
    };
    return id;
}