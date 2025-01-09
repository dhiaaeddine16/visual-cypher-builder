import { insertComparisonDefinition, insertFunctionDefinition, insertNullComparisonDefinition, insertStringComparisonDefinition } from "./DefinitionsLogic";


/**
 * Create a set of comparisons for each variable.
 * the schema holds for each node/reltype, the properties.
 * The property in the schema will have this info:  {key: 'title', type: 'string', value: 'The Matrix', indexed: true}
 * The value is a sample value to be used in the comparison.
 * For string values, we can use the sample string as an example for the comparison.
 * For numeric values, we can use the sample value as the comparison value, and generate > < = as three options.
 */
export function createComparisons(variables, schema, indexedOnly = false, emptyComparisons = true) {
    const comparisonElements = {};
    const advancedComparisonElements = {};

    // Add simple comparisons
    emptyComparisons && variables.forEach(variable => {
        variable.classes.forEach(() => {
            insertComparisonDefinition(comparisonElements, variable.text, ``, '=');
        });
    });
    // Iterate through each variable to create comparisons based on schema
    variables.forEach(variable => {
        variable.classes.forEach((className) => {
            // Handle node comparisons
            if (className === 'label' && schema.nodes) {
                variable.types.forEach(variableType => {
                    const schemaDefinition = schema.nodes[variableType];
                    if (schemaDefinition) {
                        schemaDefinition.properties.forEach((property) => {
                            const propertyKey = `${variable.text}.${property.key}`;
                            if (indexedOnly && !property.indexed) return;
                            addPropertyComparisons(comparisonElements, propertyKey, property);
                            addAdvancedPropertyComparisons(advancedComparisonElements, propertyKey, property);
                        });
                    }
                });
            }

            // Handle relationship comparisons
            if (className === 'reltype' && schema.relationships) {
                variable.types.forEach(variableType => {
                    const schemaDefinition = schema.relationships[variableType];
                    if (schemaDefinition) {
                        schemaDefinition.properties.forEach((property) => {
                            const propertyKey = `${variable.text}.${property.key}`;
                            if (indexedOnly && !property.indexed) return;
                            addPropertyComparisons(comparisonElements, propertyKey, property);
                            addAdvancedPropertyComparisons(advancedComparisonElements, propertyKey, property);
                        });
                    }
                });
            }
        });
    });

    return { comparisonElements, advancedComparisonElements };
}

/**
 * Generates comparisons based on a given property.
 * @param {Object} comparisonElements - The object to store the generated comparisons.
 * @param {string} propertyKey - The key of the property to generate comparisons for.
 * @param {Object} property - The property definition from the schema.
 */
function addPropertyComparisons(comparisonElements, propertyKey, property) {
    // Generate comparisons based on property type
    if (property.type === 'string') {
        insertComparisonDefinition(comparisonElements, propertyKey, `"${property.value}"`, '=');
    } else if (property.type === 'integer') {
        // insertComparisonDefinition(comparisonElements, propertyKey, `${property.value}`, '>');
        insertComparisonDefinition(comparisonElements, propertyKey, `${property.value}`, '=');
    } else if (property.type === 'array') {
        // insertComparisonDefinition(comparisonElements, propertyKey, `${property.value}`, '>');
        insertComparisonDefinition(comparisonElements, propertyKey, `["${property.value}"]`, '=');
    } else {
        // Default to equality comparison for unsupported types
        insertComparisonDefinition(comparisonElements, propertyKey, `${property.value}`, '=');
    }
}

/**
 * Generates advanced comparisons based on a given property.
 * @param {Object} comparisonElements - The object to store the generated comparisons.
 * @param {string} propertyKey - The key of the property to generate comparisons for.
 * @param {Object} property - The property definition from the schema.
 */
function addAdvancedPropertyComparisons(comparisonElements, propertyKey, property) {
    // Generate comparisons based on property type
    if (property.type === 'string') {
        insertComparisonDefinition(comparisonElements, propertyKey, `"${property.value}"`, '<>');
        insertStringComparisonDefinition(comparisonElements, propertyKey, `"${property.value}"`, ' CONTAINS ');
        insertStringComparisonDefinition(comparisonElements, propertyKey, `"${property.value}"`, ' STARTS WITH ');
        insertNullComparisonDefinition(comparisonElements, propertyKey);


    } else if (property.type === 'integer') {
        // insertComparisonDefinition(comparisonElements, propertyKey, `${property.value}`, '>');
        // insertComparisonDefinition(comparisonElements, propertyKey, `${property.value}`, '=');
        insertComparisonDefinition(comparisonElements, propertyKey, `${property.value}`, '<>');
        insertComparisonDefinition(comparisonElements, propertyKey, `${property.value}`, '<');
        insertComparisonDefinition(comparisonElements, propertyKey, `${property.value}`, '>');
    } else if (property.type === 'array') {
        // insertComparisonDefinition(comparisonElements, propertyKey, `${property.value}`, '>');
        insertFunctionDefinition(comparisonElements, 'size', propertyKey);
    } else {
        // Default to equality comparison for unsupported types
        insertComparisonDefinition(comparisonElements, propertyKey, `${property.value}`, '=');
    }
}
