import { generateCypher } from "../editor/CodeEditor";
import { insertClauseDefinition, insertNodeDefinition, insertVariableDefinition, insertComparisonDefinition, insertStringComparisonDefinition, insertOperatorDefinition, insertTransformationDefinition, insertRelationshipDefinition } from "./DefinitionsLogic";

/**
 * Given a schema, builds a list of query templates that can be used to query the graph.
 * The templates are divided into several categories:
 * - Simple retrieval of nodes
 * - WHERE statement on single property
 * - Ordering queries
 * - String contains queries
 * - Node pattern queries for outgoing and incoming relationships
 * - Rel prop matching
 * @param {any} schema The schema of the graph.
 * @returns {any[]} An array of query templates.
 */
export function buildTemplateQueries(schema, indexes) {
    const templates = [];
    schema?.nodes && Object.keys(schema.nodes).forEach((label: any) => {
        // Simple retrieval of nodes
        templates.push(buildMatchAllQuery(label, schema));

        // WHERE statement on single property.
        findMatchableProperties(schema, label).forEach((property: any) => {
            templates.push(buildMatchWhereQuery(label, schema, property));
        });

        // Ordering queries.
        findOrderableProperties(schema, label).slice(0, 1).forEach((property: any) => {
            templates.push(buildMatchOrderByQuery(label, schema, property));
        })

        // String contains queries. Try getting something else.
        findStringProperties(schema, label).reverse().slice(0, 1).forEach((property: any) => {
            templates.push(buildMatchWhereStringContainsQuery(label, schema, property));
        })
        // Outgoing relationships
        schema.nodes[label].outgoingRelationships.slice(0, 1).forEach((relType: any) => {
            const destinationLabels = schema.relationships[relType].endNodes;
            destinationLabels.forEach((destinationLabel: any) => {
                findMatchableProperties(schema, label).slice(0, 1).forEach((property: any) => {
                    templates.push(buildMatchWhereNodePatternQuery(label, schema, property, relType, destinationLabel, true));
                });
            })

        });

        // Incoming relationships
        schema.nodes[label].incomingRelationships.slice(0, 1).forEach((relType: any) => {
            const originLabels = schema.relationships[relType].startNodes;
            originLabels.forEach((originLabel: any) => {
                if (label !== originLabel) {
                    findMatchableProperties(schema, label).slice(0, 2).forEach((property: any) => {
                        templates.push(buildMatchWhereNodePatternQuery(label, schema, property, relType, originLabel, false));
                    });
                }
            })
        });
    })

    // Rel prop mtaching
    schema?.relationships && Object.keys(schema.relationships)
        .filter((relType: any) => schema.relationships[relType].properties.length > 0)
        .forEach((relType: any) => {
            const startNodes = schema.relationships[relType].startNodes;
            const endNodes = schema.relationships[relType].endNodes;
            startNodes.forEach((startNode: any) => {
                endNodes.forEach((endNode: any) => {
                    findMatchableRelProperties(schema, relType).slice(0, 1).forEach((property: any) => {
                        templates.push(buildMatchWhereRelationshipQuery(startNode, schema, property, relType, endNode, true));
                    });
                })
            })
        })
    return templates;
}


/**
 * Build a query that matches all nodes of a given label and returns all of their properties.
 * @param {any} label The label of the nodes to match.
 * @param {any[]} schema The schema of the graph.
 * @returns An object containing the generated query, a description of the query, a rich description of the query as a React element, a dictionary of query elements, and the items of the query as an array of arrays.
 */
function buildMatchAllQuery(label: any, schema: any[]) {
    const queryElements = {};
    const line1 = [];
    const line2 = [];
    line1.push(insertClauseDefinition(queryElements, 'MATCH'));
    const alias = label[0].toLowerCase();
    line1.push(insertNodeDefinition(queryElements, alias, label));
    line2.push(insertClauseDefinition(queryElements, 'RETURN'));
    // @ts-ignore
    const properties = schema.nodes[label].properties;
    properties.forEach((property: any) => {
        line2.push(insertVariableDefinition(queryElements, alias + '.' + property.key));
    });
    const queryItems = [line1, line2];
    const cypher = generateCypher(queryItems, queryElements, 0);
    const description = 'Find all ' + label + ' nodes and return their properties.';
    const richDescription = <span>Find all <b>{label}</b> nodes and return their properties.</span>;
    return {
        description: description,
        richDescription: richDescription,
        cypher: cypher,
        elements: queryElements,
        items: queryItems
    };
}


/**
 * Build a query that matches all nodes of a given label, filters all nodes where a given property has a given value, and returns the nodes.
 * @param {any} label The label of the nodes to match.
 * @param {any[]} schema The schema of the graph.
 * @param {string} property The property of the nodes to filter on.
 * @returns An object containing the generated query, a description of the query, a rich description of the query as a React element, a dictionary of query elements, and the items of the query as an array of arrays.
 */
function buildMatchWhereQuery(label: any, schema: any[], property: string) {

    const queryElements = {};
    const line1 = [];
    const line2 = [];
    const line3 = [];

    line1.push(insertClauseDefinition(queryElements, 'MATCH'));
    const alias = label[0].toLowerCase();
    line1.push(insertNodeDefinition(queryElements, alias, label));

    line2.push(insertClauseDefinition(queryElements, 'WHERE'));
    const value = property['type'] == 'string' ? `"${property['value']}"` : property['value'];
    line2.push(insertComparisonDefinition(queryElements, alias + '.' + property['key'], value));

    line3.push(insertClauseDefinition(queryElements, 'RETURN'));
    line3.push(insertVariableDefinition(queryElements, alias));

    const queryItems = [line1, line2, line3];
    const cypher = generateCypher(queryItems, queryElements, 0);
    const description = 'Find ' + label + ' nodes where ' + property['key'] + ' is ' + value + '.';
    const richDescription = <span>Find <b>{label}</b> nodes where property <b>{' ' + property['key']} </b> is <b>{' ' + value + '.'}</b> </span>;
    return {
        description: description,
        richDescription: richDescription,
        cypher: cypher,
        elements: queryElements,
        items: queryItems
    };
}


/**
 * Build a query that matches all nodes of a given label, filters all nodes where a given string property contains a given value, and returns the nodes.
 * @param {any} label The label of the nodes to match.
 * @param {any[]} schema The schema of the graph.
 * @param {string} property The property of the nodes to filter on.
 * @returns An object containing the generated query, a description of the query, a rich description of the query as a React element, a dictionary of query elements, and the items of the query as an array of arrays.
 */
function buildMatchWhereStringContainsQuery(label: any, schema: any[], property: string) {

    const queryElements = {};
    const line1 = [];
    const line2 = [];
    const line3 = [];

    line1.push(insertClauseDefinition(queryElements, 'MATCH'));
    const alias = label[0].toLowerCase();
    line1.push(insertNodeDefinition(queryElements, alias, label));

    line2.push(insertClauseDefinition(queryElements, 'WHERE'));
    const value = property['type'] == 'string' ? `"${property['value']}"` : property['value'];
    line2.push(insertStringComparisonDefinition(queryElements, alias + '.' + property['key'], value));

    line3.push(insertClauseDefinition(queryElements, 'RETURN'));
    line3.push(insertVariableDefinition(queryElements, alias));

    const queryItems = [line1, line2, line3];
    const cypher = generateCypher(queryItems, queryElements, 0);
    const description = 'Find ' + label + ' nodes where ' + property['key'] + ' contains ' + value + '.';
    const richDescription = <span>Find <b>{label}</b> nodes where property <b>{' ' + property['key']} </b> contains <b>{' ' + value + '.'}</b> </span>;
    return {
        description: description,
        richDescription: richDescription,
        cypher: cypher,
        elements: queryElements,
        items: queryItems
    };
}

/**
 * Build a query that matches all nodes of a given label, returns the nodes, and orders them by a given property.
 * @param {any} label The label of the nodes to match.
 * @param {any[]} schema The schema of the graph.
 * @param {string} property The property of the nodes to order by.
 * @returns An object containing the generated query, a description of the query, a rich description of the query as a React element, a dictionary of query elements, and the items of the query as an array of arrays.
 */
function buildMatchOrderByQuery(label: any, schema: any[], property: string) {

    const queryElements = {};
    const line1 = [];
    const line2 = [];
    const line3 = [];
    const line4 = [];
    line1.push(insertClauseDefinition(queryElements, 'MATCH'));
    const alias = label[0].toLowerCase();
    line1.push(insertNodeDefinition(queryElements, alias, label));


    line2.push(insertClauseDefinition(queryElements, 'RETURN'));
    // @ts-ignore
    findMatchableProperties(schema, label).forEach((property: any) => {
        line2.push(insertVariableDefinition(queryElements, alias + '.' + property['key']));
    });
    if (findMatchableProperties(schema, label).filter((p: any) => p['key'] == property['key']).length == 0) {
        line2.push(insertVariableDefinition(queryElements, alias + '.' + property['key']));
    }


    line3.push(insertClauseDefinition(queryElements, 'ORDER BY'));
    line3.push(insertVariableDefinition(queryElements, alias + '.' + property['key']));
    line3.push(insertOperatorDefinition(queryElements, ' DESC'));
    line4.push(insertTransformationDefinition(queryElements, 'LIMIT ', '10'));
    const queryItems = [line1, line2, line3, line4];
    const cypher = generateCypher(queryItems, queryElements, 0);
    const description = 'Find ' + label + ' nodes with the top 10 values for property ' + property['key'] + '.';
    const richDescription = <span>Find <b>{label}</b> nodes with the top <b>10</b> values for property <b>{' ' + property['key']}</b>.</span>;
    return {
        description: description,
        richDescription: richDescription,
        cypher: cypher,
        elements: queryElements,
        items: queryItems
    };
}

/**
 * Build a query that matches all nodes of a given label that have a given outgoing or incoming relationship of a given type to a node of a given label, and filters those nodes where a given property has a given value, and returns the node, the relationship, and the other node.
 * @param {any} label The label of the nodes to match.
 * @param {any[]} schema The schema of the graph.
 * @param {string} property The property of the nodes to filter on.
 * @param {string} relType The type of the relationship.
 * @param {string} otherLabel The label of the other node.
 * @param {boolean} outgoing Whether the relationship is outgoing or incoming.
 * @returns An object containing the generated query, a description of the query, a rich description of the query as a React element, a dictionary of query elements, and the items of the query as an array of arrays.
 */
function buildMatchWhereNodePatternQuery(label: any, schema: any[], property: string, relType: string, otherLabel: string, outgoing: boolean) {

    const queryElements = {};
    const line1 = [];
    const line2 = [];
    const line3 = [];

    line1.push(insertClauseDefinition(queryElements, 'MATCH'));
    const nodeAlias = label[0].toLowerCase();
    const relAlias = relType[0].toLowerCase();
    const otherNodeAlias = otherLabel[0].toLowerCase();
    line1.push(insertNodeDefinition(queryElements, nodeAlias, label));
    line1.push(insertRelationshipDefinition(queryElements, relAlias, relType, outgoing ? 'OUTGOING' : 'INCOMING'));
    line1.push(insertNodeDefinition(queryElements, otherNodeAlias, otherLabel));

    line2.push(insertClauseDefinition(queryElements, 'WHERE'));
    const value = property['type'] == 'string' ? `"${property['value']}"` : property['value'];
    line2.push(insertComparisonDefinition(queryElements, nodeAlias + '.' + property['key'], value));

    line3.push(insertClauseDefinition(queryElements, 'RETURN'));
    line3.push(insertVariableDefinition(queryElements, nodeAlias));
    line3.push(insertVariableDefinition(queryElements, relAlias));
    line3.push(insertVariableDefinition(queryElements, otherNodeAlias));
    const queryItems = [line1, line2, line3];
    const cypher = generateCypher(queryItems, queryElements, 0);
    const description = 'Find ' + label + ' nodes that have an ' + (outgoing ? 'outgoing' : 'incoming') + ' relationship of type ' + relType + ' where ' + property['key'] + ' is ' + value + '.';
    const richDescription = <span>
        Find <b>{label}</b> nodes that have an <>{outgoing ? 'outgoing' : 'incoming'} </> relationship of type
        <b> {relType}</b> {outgoing ? 'to' : 'from'} <b>{otherLabel}</b> where the {label}'s <b>{' ' + property['key']} </b> property is <b>{' ' + value + '.'}</b>
    </span>;
    return {
        description: description,
        richDescription: richDescription,
        cypher: cypher,
        elements: queryElements,
        items: queryItems
    };
}

function buildMatchWhereRelationshipQuery(label: any, schema: any[], property: string, relType: string, otherLabel: string, outgoing: boolean) {

    const queryElements = {};
    const line1 = [];
    const line2 = [];
    const line3 = [];

    line1.push(insertClauseDefinition(queryElements, 'MATCH'));
    const nodeAlias = label[0].toLowerCase();
    const relAlias = relType[0].toLowerCase();
    const otherNodeAlias = otherLabel[0].toLowerCase();
    line1.push(insertNodeDefinition(queryElements, nodeAlias, label));
    line1.push(insertRelationshipDefinition(queryElements, relAlias, relType, outgoing ? 'OUTGOING' : 'INCOMING'));
    line1.push(insertNodeDefinition(queryElements, otherNodeAlias, otherLabel));

    line2.push(insertClauseDefinition(queryElements, 'WHERE'));
    let value = property['type'] == 'string' ? `"${property['value']}"` : property['value'];
    value = property['type'] == 'array' ? `["${property['value']}"]` : value;
    line2.push(insertComparisonDefinition(queryElements, relAlias + '.' + property['key'], value));

    line3.push(insertClauseDefinition(queryElements, 'RETURN'));
    line3.push(insertVariableDefinition(queryElements, nodeAlias));
    line3.push(insertVariableDefinition(queryElements, relAlias));
    line3.push(insertVariableDefinition(queryElements, otherNodeAlias));
    const queryItems = [line1, line2, line3];
    const cypher = generateCypher(queryItems, queryElements, 0);
    const description = 'Find ' + relType + ' relationships where property ' + property['key'] + ' is ' + value + '.';
    const richDescription = <span>
        Find <b>{relType}</b> relationships where property <b>{' ' + property['key']} </b> is <b>{' ' + value + '.'}</b>
    </span>;
    return {
        description: description,
        richDescription: richDescription,
        cypher: cypher,
        elements: queryElements,
        items: queryItems
    };
}


function findMatchableProperties(schema: any, label: any,) {
    const properties = schema.nodes[label].properties.filter(p => p.indexed);
    if (properties.length > 0) {
        return properties;
    } else if (schema.nodes[label].properties?.length > 0) {
        return [schema.nodes[label].properties[0]];
    }
    return [];
}

function findMatchableRelProperties(schema: any, type: any,) {
    const properties = schema?.relationships[type].properties.filter(p => p.indexed);
    if (properties.length > 0) {
        return properties;
    } else if (schema?.relationships[type].properties?.length > 0) {
        return [schema?.relationships[type].properties[0]];
    }
    return [];
}

function findOrderableProperties(schema: any, label: any,) {
    const properties = schema.nodes[label].properties.filter(p => p.type == 'integer');
    if (properties.length > 0) {
        return properties;
    } else if (schema.nodes[label].properties?.length > 0) {
        return [schema.nodes[label].properties[0]];
    }
    return [];
}

function findStringProperties(schema: any, label: any,) {
    const properties = schema.nodes[label].properties.filter(p => p.type == 'string');
    if (properties.length > 0) {
        return properties;
    } else if (schema.nodes[label].properties?.length > 0) {
        return [schema.nodes[label].properties[0]];
    }
    return [];
}


