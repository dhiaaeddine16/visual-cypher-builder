

/**

This is an example schema definition.
A schema is built by sampling the nodes and rels inside the database.

const schema = {
    nodes:
        'Person': {
            properties: [
                {
                    key: 'title',
                    type: 'string',
                    value: 'The Matrix'
                }
            ],
            outgoingRelationships: [
                'ACTED_IN'
            ],
            incomingRelationships: [
                'FOLLOWS'
            ]
        }
        
    relationships:
        'ACTED_IN': {
            properties: [
                {
                    key: 'role',
                    type: 'string',
                    value: 'Morpheus'
                }
            ],
            startNodes: [
                'Person'
            ],
            endNodes: [
                'Movie'
            ]
        }
}
**/


/**
 * Constructs a schema definition from the given labels, relationship types, properties, cardinalities, and indexes.
 * 
 * This function builds a schema object that includes node and relationship definitions.
 * Each node and relationship contains properties with metadata such as type, value, and whether
 * they are indexed. It also maps node relationships and cardinalities, indicating the direction
 * of relationships between nodes.
 *
 * @param {any[]} labels - An array of node labels in the graph.
 * @param {any[]} relTypes - An array of relationship types in the graph.
 * @param {any[]} nodeProperties - An array of node properties, each item containing a label and properties.
 * @param {any[]} relProperties - An array of relationship properties, each item containing a relType and properties.
 * @param {Object[]} cardinalities - An array of objects defining start and end nodes for each relationship type.
 * @param {any} indexes - Index information to determine which properties are indexed.
 * @returns {Object} - The constructed schema with nodes and relationships data.
 */

export function buildSchemaDefinition(labels: any[], relTypes: any[], nodeProperties: any[], relProperties: any[], cardinalities: { start: any; relType: any; end: any; }[], indexes) {
    const schema = {
        nodes: {},
        relationships: {}
    };

    // Indexes
    // Extract distinct triplets
    const triplets = [
        ...new Set(
            indexes.flatMap(({ entityType, labelsOrTypes, properties }) =>
                labelsOrTypes.flatMap(label =>
                    properties.map(prop => JSON.stringify([entityType, label, prop]))
                )
            )
        )
        // @ts-ignore
    ].map(t => JSON.parse(t)); // Parse back into arrays

    // Build nodes schema
    labels.forEach((label: string | number) => {
        const nodeProps = nodeProperties.find((node: { label: any; }) => node.label === label)?.properties || {};
        const properties = Object.keys(nodeProps).map(key => {
            const value = nodeProps[key];
            return {
                key,
                type: typeof value === 'object' && value.low !== undefined ? 'integer' : typeof value,
                value: value.low !== undefined ? value.low : value,
                indexed: triplets.some(triplet => triplet[0] === 'NODE' && triplet[1] === label && triplet[2] === key)
            };
            // @ts-ignore
        }).sort((a, b) => b.indexed - a.indexed); // Sort by indexed=true first

        schema.nodes[label] = {
            properties,
            outgoingRelationships: [],
            incomingRelationships: []
        };
    });

    // Build relationships schema
    relTypes.forEach((relType: string | number) => {
        const relProps = relProperties.find((rel: { relType: any; }) => rel.relType === relType)?.properties || {};
        const properties = Object.keys(relProps).map(key => {
            const value = relProps[key];
            const type = Array.isArray(value) ? 'array' : typeof value;
            return {
                key,
                type: Array.isArray(value) ? 'array' : typeof value,
                value: Array.isArray(value) ? value : value.low !== undefined ? value.low : value,
                // @ts-ignore
                indexed: triplets.some(triplet => triplet[0] === 'RELATIONSHIP' && triplet[1] === type && triplet[2] === key)
            };
            // @ts-ignore
        }).sort((a, b) => b.indexed - a.indexed); // Sort by indexed=true first

        schema.relationships[relType] = {
            properties,
            startNodes: [],
            endNodes: []
        };
    });

    // Map cardinalities to nodes and relationships
    cardinalities.forEach(({ start, relType, end }) => {
        schema.nodes[start].outgoingRelationships.push(relType);
        schema.nodes[end].incomingRelationships.push(relType);
        schema.relationships[relType].startNodes.push(start);
        schema.relationships[relType].endNodes.push(end);
    });
    return schema;
}

