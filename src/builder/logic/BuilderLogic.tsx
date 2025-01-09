import { createElementsDefinition, insertBracketDefinition, insertClauseDefinition, insertFunctionDefinition, insertNodeDefinition, insertOperatorDefinition, insertRelationshipDefinition, insertTransformationDefinition, insertVariableDefinition } from "./DefinitionsLogic";

// There are 3 types of containers, on the sidebar, in the main query builder, and in the query builder footer.
// Between these containers, elements can be dragged.
// Containers on the sidebar that are duplicating. This represents the count of the containers.
export const SIDEBAR_CONTAINER_COUNT = 10;
// The number of containers in the footer.
// This is just one (the wizard)
export const FOOTER_CONTAINER_COUNT = 1;


export const clauses = ["MATCH", "OPTIONAL MATCH", "WHERE", "WITH", "RETURN"];
export const sidebarCategories = ['Clauses', 'Nodes', 'Relationships', 'Basic Comparisons', 'More Comparisons', 'Operators', 'Variables', 'Constants', 'Query Controls', 'Other']

export const NODE_LIMIT_SIDEBAR = 20;
export const REL_LIMIT_SIDEBAR = 20;
export const VAR_LIMIT_SIDEBAR = 25;



/**
 * Initialize the builder with the following elements:
 * - Clause elements
 * - Node elements
 * - Relationship elements
 * - Comparison elements
 * - Operator elements
 * - Variable elements
 * - Constant elements
 * - Control elements
 * - Misc Cypher elements (CYPHER, PROFILE, EXPLAIN)
 * - Wizard elements (MATCH, MERGE by default - but dynamically updated as the query changes)
 *
 * The function returns an object with two properties: `newItems` and `newElements`.
 * `newItems` is an array of arrays, where each inner array represents the items in a container.
 * `newElements` is an object with the elements, where each key is the id of the element.
 */
export function initializeBuilder() {
    const clauseElements = createElementsDefinition(clauses, { type: 'CLAUSE' });
    const nodeElements = {};
    insertNodeDefinition(nodeElements, 'n', '');

    const relationshipElements = {};
    insertRelationshipDefinition(relationshipElements, 'r', '');

    const comparisonElements = {};

    const advancedComparisonElements = {};

    const operatorElements = {};
    insertOperatorDefinition(operatorElements, ' AND ');
    insertOperatorDefinition(operatorElements, ' OR ');
    insertOperatorDefinition(operatorElements, ' XOR ');
    insertOperatorDefinition(operatorElements, ' NOT ');
    insertOperatorDefinition(operatorElements, ' EXISTS ');
    insertOperatorDefinition(operatorElements, '+');
    insertOperatorDefinition(operatorElements, '-');
    insertOperatorDefinition(operatorElements, '*');
    insertOperatorDefinition(operatorElements, '/');
    insertOperatorDefinition(operatorElements, '%');
    insertOperatorDefinition(operatorElements, '^');
    insertBracketDefinition(operatorElements, '(');
    insertBracketDefinition(operatorElements, ')');
    insertOperatorDefinition(operatorElements, ',');


    const variableElements = {};

    const constantElements = {};
    insertVariableDefinition(constantElements, '"text"');
    insertVariableDefinition(constantElements, '0');
    insertVariableDefinition(constantElements, '10');
    insertVariableDefinition(constantElements, '100');
    insertVariableDefinition(constantElements, '[]');
    insertVariableDefinition(constantElements, 'null');
    const controlElements = {};
    insertClauseDefinition(controlElements, 'RETURN');
    insertClauseDefinition(controlElements, 'WITH');
    insertOperatorDefinition(controlElements, ' DISTINCT ');
    insertTransformationDefinition(controlElements, 'SKIP ', '1000');
    insertTransformationDefinition(controlElements, 'LIMIT ', '1000');
    insertClauseDefinition(controlElements, 'ORDER BY');
    insertOperatorDefinition(controlElements, 'ASC');
    insertOperatorDefinition(controlElements, 'DESC');
    insertClauseDefinition(controlElements, 'UNION');
    insertClauseDefinition(controlElements, 'UNWIND');
    insertFunctionDefinition(controlElements, 'COLLECT');
    insertTransformationDefinition(controlElements, 'AS ');

    // createElementsDefinition(comparisons, { type: 'CLAUSE' });
    const allCypherElements = {};
    insertOperatorDefinition(allCypherElements, 'CYPHER ');
    insertOperatorDefinition(allCypherElements, 'PROFILE ');
    insertOperatorDefinition(allCypherElements, 'EXPLAIN ');
    const wizardElements = {};
    insertClauseDefinition(wizardElements, 'MATCH');
    insertClauseDefinition(wizardElements, 'MERGE');
    // insertClauseDefinition(wizardElements, 'WITH');


    const newElements = { ...clauseElements, ...nodeElements, ...relationshipElements, ...operatorElements, ...variableElements, ...constantElements, ...comparisonElements, ...controlElements, ...allCypherElements, ...wizardElements };
    const newItems = [
        [...Object.keys(clauseElements)],
        [...Object.keys(nodeElements)],
        [...Object.keys(relationshipElements)],
        [...Object.keys(comparisonElements)],
        [...Object.keys(advancedComparisonElements)],
        [...Object.keys(operatorElements)],
        [...Object.keys(variableElements)],
        [...Object.keys(constantElements)],
        [...Object.keys(controlElements)],
        [...Object.keys(allCypherElements)],
        [...Object.keys(wizardElements)],
        [],
        []
    ];
    return { newItems, newElements };
}


/**
 * Reset the builder query by deleting all non-sidebar query elements.
 *
 * This function is used when the user wants to start fresh with a new query.
 * It takes the current state of the builder and creates a new one by deleting all
 * non-sidebar elements from the old state.
 * @param {Object} oldItems The current state of the builder, which is an array of arrays of element UUIDs.
 * @param {Object} oldElements The current state of the builder, which is an object of element definitions.
 * @returns {Object} The new state of the builder, which is an object with two properties: items and elements.
 * @property {Array<Array<string>>} items The new state of the builder, which is an array of arrays of element UUIDs.
 * @property {Object} elements The new state of the builder, which is an object of element definitions.
 */
export function resetBuilderQuery(oldItems: any[][], oldElements: {}) {

    let newElements = { ...oldElements };
    const newItems = [...oldItems];

    // Iterate over oldItems and delete each UUID from newElements
    for (let i = SIDEBAR_CONTAINER_COUNT + FOOTER_CONTAINER_COUNT; i < newItems.length; i++) {
        newItems[i].forEach((uuid: string) => {
            if (newElements.hasOwnProperty(uuid)) {
                delete newElements[uuid];
            }
        });
        newItems[i] = [];
    }

    return { newItems, newElements }
}


/**
 * Updates the builder's sidebar based on a new schema.
 * The function finally combines all definitions and returns the updated items and elements.
 *
 * @param {any[][]} oldItems - The current state of the builder, an array of arrays of element UUIDs.
 * @param {Object} oldElements - The current state of the builder, an object of element definitions.
 * @param {Object} schema - The schema containing nodes and relationships to update the builder with.
 * @returns {Object} - The updated state of the builder, with properties `newItems` and `newElements`.
 * @property {Array<Array<string>>} newItems - The updated array of arrays of element UUIDs.
 * @property {Object} newElements - The updated object of element definitions.
 */

export function updateBuilderNodesRelationships(oldItems: any[][], oldElements: {}, schema: { nodes: {}; relationships: {}; }, variables: any[]) {

    let newElements = { ...oldElements };
    const newItems = [...oldItems];

    // Iterate over oldItems and delete each UUID from newElements
    oldItems[1].forEach((uuid: string | number) => {
        if (newElements.hasOwnProperty(uuid)) {
            delete newElements[uuid];
        }
    });
    oldItems[2].forEach((uuid: string | number) => {
        if (newElements.hasOwnProperty(uuid)) {
            delete newElements[uuid];
        }
    });
    // Nodes
    
    const nodeElements = {};
    const varName = assignUniqueVariableName(variables, 'n');
    insertNodeDefinition(nodeElements, varName, '');
    schema?.nodes && Object.keys(schema.nodes).forEach(nodeLabel => {
        if (nodeLabel) {
            const varName = assignUniqueVariableName(variables, nodeLabel[0].toLowerCase())
            insertNodeDefinition(nodeElements, varName, nodeLabel);
        }
    })

    newItems[1] = [...Object.keys(nodeElements)].slice(0, NODE_LIMIT_SIDEBAR);

    // Relationship
    const relElements = {};
    const relVarName = assignUniqueVariableName(variables, 'r');
    insertRelationshipDefinition(relElements, relVarName, '');
    schema?.relationships && Object.keys(schema.relationships).forEach(relType => {
        if (relType) {
            const varName = assignUniqueVariableName(variables, relType[0].toLowerCase())
            insertRelationshipDefinition(relElements, varName, relType);
        }
    })

    newItems[2] = [...Object.keys(relElements)].slice(0, REL_LIMIT_SIDEBAR);


    // Merge all element definitions
    newElements = { ...newElements, ...nodeElements, ...relElements };
    return { newItems, newElements }
}

export function assignUniqueVariableName(variables: any[], name: string) {
    let newName = name;
    let index = 1;
    while (variables.findIndex(v => v.text === newName) !== -1) {
        index++;
        newName = name + index;

        // Escape block if we somehow get stuck.
        if(index == 100){
            break;
        }
    }
    return newName;
}