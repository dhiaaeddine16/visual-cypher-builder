
import { BlockType } from "../block/BlockType";
import { FOOTER_CONTAINER_COUNT, SIDEBAR_CONTAINER_COUNT, VAR_LIMIT_SIDEBAR } from "./BuilderLogic";
import { createComparisons } from "./ComparisonsLogic";
import { insertVariableDefinition } from "./DefinitionsLogic";


/**
 * Updates the builder's variables based on a new set of variables.
 * The function takes the current state of the builder, an array of variables, and a schema.
 * It then constructs new element definitions for the variables and comparisons.
 * The function finally combines all definitions and returns the updated items and elements.
 *
 * @param {any[][]} oldItems - The current state of the builder, an array of arrays of element UUIDs.
 * @param {Object} oldElements - The current state of the builder, an object of element definitions.
 * @param {any[]} variables - The new set of variables.
 * @param {any} schema - The schema containing nodes and relationships.
 * @returns {Object} - The updated state of the builder, with properties `newItems` and `newElements`.
 * @property {Array<Array<string>>} newItems - The updated array of arrays of element UUIDs.
 * @property {Object} newElements - The updated object of element definitions.
 */
export function updateBuilderVariables(oldItems: any[][], oldElements: {}, variables: any[], schema: any) {

    let newElements = { ...oldElements };
    const newItems = [...oldItems];

    // Iterate over oldItems and delete each UUID from newElements
    newItems[3].forEach((uuid: string | number) => { // Comparisons
        if (newElements.hasOwnProperty(uuid)) {
            delete newElements[uuid];
        }
    });
    newItems[4].forEach((uuid: string | number) => { // Advanced Comparisons
        if (newElements.hasOwnProperty(uuid)) {
            delete newElements[uuid];
        }
    });
    newItems[6].forEach((uuid: string | number) => { // Variables
        if (newElements.hasOwnProperty(uuid)) {
            delete newElements[uuid];
        }
    });
    // Variables
    [...variables].reverse();
    const uniqueVariableElements = constructComplexVariables(variables, schema);
    newItems[6] = [...Object.keys(uniqueVariableElements)].slice(0, VAR_LIMIT_SIDEBAR);
    // Comparisons
    const { comparisonElements, advancedComparisonElements } = createComparisons(variables, schema);
    newItems[3] = [...Object.keys(comparisonElements)].slice(0, VAR_LIMIT_SIDEBAR);
    newItems[4] = [...Object.keys(advancedComparisonElements)].slice(0, VAR_LIMIT_SIDEBAR);

    // Merge all element definitions
    newElements = { ...newElements, ...uniqueVariableElements, ...comparisonElements, ...advancedComparisonElements };

    return { newItems, newElements }
}

/**
 * Reusable function to go over all variables, check if some are nodes/rels, and add the properties for each as seperate variable.
 * i.e. "n" --> "n.name", "n.born"
 */
export function constructComplexVariables(variables: any[], schema: any, maxNested = 1000, addDescriptors = false) {
    const variableElements = {};
    variables.forEach(variable => {
        insertVariableDefinition(variableElements, variable.text);
    });
    variables.forEach(variable => {
        variable.classes.forEach((className) => {
            if (className == 'label' && schema.nodes) {
                variable.types.forEach((variableType) => {
                    const schemaDefinition = schema.nodes[variableType];
                    schemaDefinition && schemaDefinition.properties.slice(0, maxNested).forEach((property: any) => {
                        insertVariableDefinition(variableElements, variable.text + '.' + property.key);
                    });
                    if (addDescriptors) {
                        if (schemaDefinition && schemaDefinition.properties.map(p => p.key).includes('name')) {
                            insertVariableDefinition(variableElements, variable.text + '.name');
                        }
                        if (schemaDefinition && schemaDefinition.properties.map(p => p.key).includes('title')) {
                            insertVariableDefinition(variableElements, variable.text + '.title');
                        }
                    }
                });
            }
            if (className == 'reltype' && schema.relationships) {
                variable.types.forEach((variableType) => {
                    const schemaDefinition = schema.relationships[variableType];
                    schemaDefinition && schemaDefinition.properties.slice(0, maxNested).forEach((property: any) => {
                        insertVariableDefinition(variableElements, variable.text + '.' + property.key);
                    });
                });
            }
        });
    });

    const uniqueElements = Object.fromEntries(
        // @ts-ignore
        Object.entries(variableElements).filter(([, value], index, self) => !self.slice(0, index).some(([_, v]) => v.text.join() === value.text.join())
        )
    );
    return uniqueElements;
}

/**
 * Extracts and categorizes variables from provided items and elements.
 *
 * This function analyzes blocks of items and elements to infer variables and
 * their associated types and classes. It processes the blocks to identify 
 * and map out variables, labels, and relationship types, assigning types to 
 * variables based on detected patterns and rules.
 *
 * @param {any[]} items - An array of items containing block definitions.
 * @param {{ [x: string]: any }} elements - A mapping of element UUIDs to their data.
 * @returns {Array} - Returns a list of objects, each representing a unique variable
 *                    with its associated classes and types.
 */
export function extractVariables(items: any[], elements: { [x: string]: any; }) {

    // Infer variables by looking at all the blocks
    const builderElements = items.slice(SIDEBAR_CONTAINER_COUNT + FOOTER_CONTAINER_COUNT).flat().map((uuid: any) => elements[uuid]);
    const typedBuilderElements = builderElements.map((element: any) => { return { 'text': element?.text, 'type': BlockType[element?.type]?.components }; });

    const variablesAndClasses = typedBuilderElements.map((item: any) => {
        return item?.text?.map((value: any, index: string | number) => ({
            text: value,
            class: item.type[index].class
        })).filter((item: { class: undefined; }) => item.class !== undefined);
    });

    const pairsList = variablesAndClasses.map((subarray: any[]) => {
        // Extract labels or reltypes
        if (!subarray) {
            return [];
        }
        const typeItems = subarray.filter((item: { class: string; }) => item.class === 'label' || item.class === 'reltype');
        const types = typeItems.map((item: { text: any; }) => item.text);
        const newClass = typeItems.length > 0 ? typeItems[0].class : 'text'; // Use label/reltype or default to 'text'

        // Determine type assignments
        return subarray
            .filter((item: { class: string; }) => item.class !== 'label' && item.class !== 'reltype') // Exclude labels and reltypes
            .map((item: { class: string; }) => {
                if (item.class === 'variable') {
                    if (types.length === 0) {
                        // Rule 1: No label or reltype -> type is 'string'
                        return { ...item, class: newClass, type: 'text' };
                    } else if (types.length === 1) {
                        // Rule 2: Single label or reltype -> assign that type
                        return { ...item, class: newClass, type: types[0] };
                    } else {
                        // Rule 3: Multiple labels or reltypes -> assign full set of types
                        return { ...item, class: newClass, type: types.join(', ') };
                    }
                }
                return item; // Non-variable items remain unchanged
            });
    });

    const flatList = pairsList.flat()
        // @ts-ignore
        .filter((item) => isNaN(item.text))
        // @ts-ignore
        .filter((item) => !item.text.includes('"') && !item.text.includes("'") && !item.text.includes('`'));
    const merged = {};

    flatList.forEach((item: { text: string | number; class: any; type: any; }) => {
        if (!merged[item.text]) {
            merged[item.text] = { text: item.text, classes: [], types: [] };
        }

        if (!merged[item.text].classes.includes(item.class)) {
            merged[item.text].classes.push(item.class);
        }

        if (!merged[item.text].types.includes(item.type)) {
            merged[item.text].types.push(item.type);
        }
    });

    return Object.values(merged);
}