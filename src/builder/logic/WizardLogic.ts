import { SIDEBAR_CONTAINER_COUNT, FOOTER_CONTAINER_COUNT, NODE_LIMIT_SIDEBAR, assignUniqueVariableName } from "./BuilderLogic";
import { createComparisons } from "./ComparisonsLogic";
import { insertClauseDefinition, insertNodeDefinition, insertRelationshipDefinition, insertComparisonDefinition, insertOperatorDefinition, insertVariableDefinition, insertTransformationDefinition } from "./DefinitionsLogic";
import { constructComplexVariables } from "./VariablesLogic";

/**
 * Update the builder's suggested blocks.
 * The function iterates over the query containers, and generates a wizard based on the content.
 * @param {any[][]} oldItems - The current state of the builder, an array of arrays of element UUIDs.
 * @param {Object} oldElements - The current state of the builder, an object of element definitions.
 * @param {any[]} variables - The variables to be used in the wizard.
 * @param {Object} schema - The schema containing nodes and relationships to update the builder with.
 * @returns {Object} - The updated state of the builder, with properties `newItems` and `newElements`.
 * @property {Array<Array<string>>} newItems - The updated array of arrays of element UUIDs.
 * @property {Object} newElements - The updated object of element definitions.
 * @property {string} caption - A caption to be displayed in the wizard sidebar.
 */
export function updateCypherWizard(oldItems: any[][], oldElements: {}, variables: any[], schema: { nodes: {}; relationships: {}; }) {

    let newElements = { ...oldElements };
    const newItems = [...oldItems];

    // Iterate over oldItems and delete each UUID from newElements
    oldItems[SIDEBAR_CONTAINER_COUNT].forEach((uuid: string | number) => {
        if (newElements.hasOwnProperty(uuid)) {
            delete newElements[uuid];
        }
    });

    // Wizard
    const { wizardElements, caption } = generateWizardSuggestions(oldItems, oldElements, variables, schema);
    newItems[SIDEBAR_CONTAINER_COUNT] = [...Object.keys(wizardElements)].slice(0, NODE_LIMIT_SIDEBAR);

    // Merge all element definitions
    newElements = { ...newElements, ...wizardElements };
    return { newItems, newElements, caption }
}

/**
 * Generates wizard suggestions for the query builder based on the current query state.
 * The function analyzes the items and elements in the query builder to determine the
 * current state of the query and suggests appropriate next steps or blocks to add.
 *
 * @param {any[][]} items - The current state of the builder, an array of arrays of element UUIDs.
 * @param {Object} elements - The current state of the builder, an object of element definitions.
 * @param {any[]} variables - The variables available for use in the wizard.
 * @param {Object} schema - The schema containing nodes and relationships in the graph.
 * @returns {Object} - An object containing the suggested wizard elements and a caption for the sidebar.
 * @property {Object} wizardElements - The suggested elements to add to the query based on the current state.
 * @property {string} caption - A caption providing guidance on the next step in building the query.
 */
function generateWizardSuggestions(items: any[][], elements: {}, variables: any[], schema: { nodes: {}; relationships: {}; }) {
    let caption = '';
    let wizardElements = {};
    const queryContainerLength = SIDEBAR_CONTAINER_COUNT + FOOTER_CONTAINER_COUNT;
    let lastClause = undefined;
    let lastElement = undefined;

    // Find last clause and last element
    items.slice(queryContainerLength).forEach((container: any) => {
        container.forEach((item: any) => {
            const type = elements[item]?.type;
            const textArray = elements[item]?.text || [];
            lastElement = elements[item];
            if (type == 'CLAUSE') {
                // Clause is always a single text element.
                lastClause = textArray[0];
            }
        });
    });
    // Case 1: empty query
    if (lastClause == undefined || lastClause == 'UNION') {
        caption = 'Start by adding a matching pattern.';
        insertClauseDefinition(wizardElements, 'MATCH');
        insertClauseDefinition(wizardElements, 'MERGE');
        // insertClauseDefinition(wizardElements, 'WITH');
        // This is the only case that returns right away.
        return { wizardElements: wizardElements, caption: caption };
    }

    // Case 2: inside empty matching statement
    if (lastElement?.type == 'CLAUSE' && (lastClause == 'MATCH' || lastClause == 'MERGE' || lastClause == 'OPTIONAL MATCH')) {
        caption = 'Add the nodes you want to match on.'
        const varName = assignUniqueVariableName(variables, 'n');
        insertNodeDefinition(wizardElements, varName, '');
        schema.nodes && Object.keys(schema.nodes).slice(0, 3).forEach(nodeLabel => {
            if (nodeLabel) {
                const varName = assignUniqueVariableName(variables, nodeLabel[0].toLowerCase());
                insertNodeDefinition(wizardElements, varName, nodeLabel);
            }
        })
    }

    // Case 3: inside non-empty matching statement where last element is a node.
    if (lastElement?.type == 'NODE' && (lastClause == 'MATCH' || lastClause == 'MERGE' || lastClause == 'OPTIONAL MATCH')) {
        caption = 'Start filtering, or add more nodes and relationships to match.'
        insertClauseDefinition(wizardElements, 'WHERE');
        insertClauseDefinition(wizardElements, 'WITH');
        insertClauseDefinition(wizardElements, 'RETURN');


        const lastLabel = lastElement.text[3];
        const outgoingRels = schema.relationships && Object.keys(schema.relationships).filter(r => schema.relationships[r].startNodes.includes(lastLabel));
        const incomingRels = schema.relationships && Object.keys(schema.relationships).filter(r => schema.relationships[r].endNodes.includes(lastLabel));

        if (!schema.relationships) {
            insertRelationshipDefinition(wizardElements, '', '', 'OUTGOING');
        }

        outgoingRels?.slice(0, 2).forEach(relType => {
            if (relType) {
                const varName = assignUniqueVariableName(variables, relType[0].toLowerCase());
                insertRelationshipDefinition(wizardElements, varName, relType, 'OUTGOING');
            }
        })
        incomingRels?.slice(0, 1).forEach(relType => {
            if (relType) {
                const varName = assignUniqueVariableName(variables, relType[0].toLowerCase());
                insertRelationshipDefinition(wizardElements, varName, relType, 'INCOMING');
            }
        })
        schema.nodes && Object.keys(schema.nodes).slice(0, 2).forEach(nodeLabel => {
            if (nodeLabel && nodeLabel != lastLabel) {
                const varName = assignUniqueVariableName(variables, nodeLabel[0].toLowerCase());
                insertNodeDefinition(wizardElements, varName, nodeLabel);
            }
        })

    }
    // Case 4: inside non-empty matching statement where last element is a relationship.
    if (lastElement?.type == 'RELATIONSHIP' && (lastClause == 'MATCH' || lastClause == 'MERGE' || lastClause == 'OPTIONAL MATCH')) {
        caption = 'Add a node at the end of the relationship pattern.'
        const varName = assignUniqueVariableName(variables, 'n');
        insertNodeDefinition(wizardElements, varName, '');

        const lastType = lastElement?.text[4];
        if (schema.relationships && schema.relationships[lastType]) {

            const lastDirectionIsInverted = lastElement?.text && lastElement.text[0] == '<-';

            const suggestedNodes = lastDirectionIsInverted ?
                schema.relationships[lastType].startNodes : schema.relationships[lastType].endNodes;

            suggestedNodes?.slice(0, 2).forEach(nodeLabel => {
                const varName = assignUniqueVariableName(variables, nodeLabel[0].toLowerCase());
                insertNodeDefinition(wizardElements, varName, nodeLabel);
            });
        }
    }
    // Case 5: inside where statement without a comparison
    if (lastClause == 'WHERE' && lastElement?.type !== 'COMPARISON' && lastElement?.type !== 'STRING_COMPARISON') {
        caption = 'Add in some filters to narrow down the results.'
        variables?.forEach(variable => {
            variable.classes.forEach(() => {
                insertComparisonDefinition(wizardElements, variable.text, ``, '=');
            });
        });
        const { comparisonElements } = createComparisons(variables, schema, true, false);

        wizardElements = { ...wizardElements, ...comparisonElements }
    }
    // Case 6: inside where statement with a comparison
    if (lastClause == 'WHERE' && (lastElement?.type == 'COMPARISON' || lastElement?.type == 'STRING_COMPARISON')) {
        caption = 'Add more filters, or move on to return variables.'
        // const { comparisonElements, advancedComparisonElements } = createComparisons(variables, schema, true, false);
        insertClauseDefinition(wizardElements, 'RETURN');
        insertClauseDefinition(wizardElements, 'WITH');
        insertOperatorDefinition(wizardElements, ' AND ');
        insertOperatorDefinition(wizardElements, ' OR ');
    }
    // Case 7: inside empty return/with statement 
    if ((lastClause == 'RETURN' || lastClause == 'WITH') && lastElement?.text && lastElement?.text[0] == lastClause) {
        caption = 'Choose the variables you want to return.'
        const uniqueVariableElements = constructComplexVariables(variables, schema, 1, true);
        insertOperatorDefinition(wizardElements, ' DISTINCT ');
        if (Object.keys(uniqueVariableElements).length == 0) {
            insertVariableDefinition(uniqueVariableElements, 'text');
        }
        wizardElements = { ...wizardElements, ...uniqueVariableElements }
    }

    // Case 8: inside return/with/unwind statement ending with variable
    if ((lastClause == 'RETURN' || lastClause == 'WITH') && lastElement?.type == 'VARIABLE') {
        const varName = lastElement?.text[0];
        if (lastClause == 'WITH') {
            insertClauseDefinition(wizardElements, 'RETURN')
            insertClauseDefinition(wizardElements, 'MATCH')
        }

        insertClauseDefinition(wizardElements, 'ORDER BY')

        if (varName.includes('.')) {
            caption = 'Give the variable a name, or add more variables.'
            const uniqueVarName = assignUniqueVariableName(variables, varName.split('.')[1]);
            insertTransformationDefinition(wizardElements, 'AS ', uniqueVarName);
        } else {
            caption = 'Add more variables, and a limit, if needed. '
        }


        const uniqueVariableElements = constructComplexVariables(variables, schema, 1, true);
        insertTransformationDefinition(uniqueVariableElements, 'LIMIT ', '1000');
        wizardElements = { ...wizardElements, ...uniqueVariableElements }
    }

    // Case 9: inside return/with/unwind statement ending with a non variable
    if ((lastClause == 'RETURN' || lastClause == 'WITH') && lastElement?.type !== 'VARIABLE' && lastElement?.text && lastElement?.text[0] != lastClause) {
        caption = 'Add more variables, or specify an ordering.'
        const varName = lastElement?.text[0];
        if (lastElement?.type !== 'OPERATOR') {
            insertClauseDefinition(wizardElements, 'ORDER BY')
        }
        if (lastElement?.type == 'FUNCTION') {
            const uniqueVarName = assignUniqueVariableName(variables, varName);
            insertTransformationDefinition(wizardElements, 'AS ', uniqueVarName);
        }
        if (varName?.includes('.')) {
            const uniqueVarName = assignUniqueVariableName(variables, varName.split('.')[1]);
            insertTransformationDefinition(wizardElements, 'AS ', uniqueVarName);
        }

        const uniqueVariableElements = constructComplexVariables(variables, schema, 1, true);
        insertTransformationDefinition(uniqueVariableElements, 'LIMIT ', '1000');
        wizardElements = { ...wizardElements, ...uniqueVariableElements }
    }

    // Case 10: inside empty UNWIND or ORDER BY statement
    if ((lastClause == 'UNWIND' || lastClause == 'ORDER BY') && lastElement?.text && lastElement?.text[0] == lastClause) {
        if (lastClause == 'ORDER BY') {
            caption = 'Select variables to order by.';
        } else {
            caption = 'Select variables to unwind.';
        }

        const uniqueVariableElements = constructComplexVariables(variables, schema, 1, true);
        if (variables.length == 0) {
            insertVariableDefinition(uniqueVariableElements, '["text"]');
        }
        wizardElements = { ...wizardElements, ...uniqueVariableElements }
    }

    // Case 11: inside non-empty UNWIND or ORDER BY statement
    if ((lastClause == 'UNWIND' || lastClause == 'ORDER BY') && lastElement?.text && lastElement?.text[0] !== lastClause) {
        if (lastClause == 'ORDER BY') {
            caption = 'Select variables to order by.';
        } else {
            caption = 'Select variables to unwind.';
        }

        const uniqueVariableElements = constructComplexVariables(variables, schema, 1, true);
        insertTransformationDefinition(wizardElements, 'LIMIT ', '1000');
        wizardElements = { ...wizardElements, ...uniqueVariableElements }
    }
    return { wizardElements: wizardElements, caption: caption };
}
