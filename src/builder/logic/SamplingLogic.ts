
import neo4j from 'neo4j-driver';
import { buildTemplateQueries } from './TemplatesLogic';
import { buildSchemaDefinition } from './SchemaLogic';

/**
 * Converts a Neo4j value to a JavaScript value, recursively converting nested
 * objects and arrays.
 *
 * The following conversions are made:
 *   - Neo4j Integer: converted to a JavaScript number if in the safe range, otherwise
 *     converted to a string.
 *   - Neo4j temporal types (Date, Time, DateTime): converted to an ISO string.
 *   - Arrays: recursively converted.
 *   - Objects: recursively converted, except for Neo4j nodes and relationships, which
 *     are left as-is.
 *   - Other types (e.g. strings, booleans, etc.): left as-is.
 *
 * @param value The Neo4j value to convert.
 * @returns The converted JavaScript value.
 */
export function convertNeo4jValue(value) {
    if (neo4j.isInt(value)) {
        // Convert Neo4j Integer to JavaScript number if in safe range, otherwise to string
        return value.inSafeRange() ? value.toNumber() : value.toString();
    } else if (neo4j.temporal.isDate(value) || neo4j.temporal.isTime(value) || neo4j.temporal.isDateTime(value)) {
        // Convert Neo4j temporal types to ISO string
        return value.toString();
    } else if (Array.isArray(value)) {
        // Recursively convert each item in the array
        return value.map(convertNeo4jValue);
    } else if (value && typeof value === 'object' && !neo4j.isNode(value) && !neo4j.isRelationship(value)) {
        // Recursively convert each property in the object
        return Object.fromEntries(
            Object.entries(value).map(([key, val]) => [key, convertNeo4jValue(val)])
        );
    }
    // Return the value as-is for other types (e.g., strings, booleans, nodes, relationships)
    return value;
}

/**
 * Simplified schema sampling logic for the query builder.
 *
 * This function takes a connection object and a callback to update the UI,
 * and attempts to infer the schema of the graph by running a series of Cypher
 * queries. It looks at a small part of the graph and attempts to infer properties
 * for each node/rel, as well as which nodes are connected by what rel types.
 *
 * The function returns a schema definition object, which is then used to build
 * a set of template queries.
 *
 * @param connection A connection object with the following properties:
 *   - uri: The URI of the Neo4j instance
 *   - user: The username to use for the connection
 *   - password: The password to use for the connection
 *   - database: The name of the database to connect to
 *   - port: The port number to use for the connection
 *   - protocol: The protocol to use for the connection
 * @param setMessage A callback to update the UI with a message
 * @param setStep A callback to update the UI with the current step
 * @param setOpen A callback to open or close the modal
 * @param setLoading A callback to set the loading state
 * @param setSchema A callback to set the schema definition
 * @param setQueryTemplates A callback to set the template queries
 */
export async function doSampling(
    connection: { uri: any; user: any; password: any; database: any; port: any; protocol: any; },
    setMessage: any,
    setStep: any,
    setOpen: any,
    setLoading: any,
    setSchema: any,
    setQueryTemplates: any) {
    /**
     * This is a simplified schema sampling logic for the query builder.
     * It looks at a small part of the graph and attempts to infer properties for each node/rel, as well as which nodes are connected by what rel types.
     */

    // Destructure connection details
    const { uri, user, password, database, port, protocol } = connection;
    const driver = neo4j.driver(protocol + '://' + uri + ':' + port, neo4j.auth.basic(user, password));

    // Create a session
    const session = driver.session({ database: database, defaultAccessMode: neo4j.session.READ });

    try {
        // Execute the query
        setStep(1);
        setMessage("Collecting node labels...")

        const result = await session.run('CALL db.labels() YIELD label RETURN label');
        const labels = result.records.map(record => record.get('label'));

        setStep(2);
        setMessage("Collecting relationship types...")

        const result2 = await session.run('CALL db.relationshipTypes() YIELD relationshipType RETURN relationshipType');
        const relTypes = result2.records.map(record => record.get('relationshipType'));

        setStep(3);
        setMessage("Collecting indexes...")

        const result3 = await session.run('SHOW INDEXES YIELD entityType, labelsOrTypes, properties WHERE properties IS NOT NULL  RETURN entityType, labelsOrTypes, properties');
        const indexes = result3.records.map(record => {
            return {
                'entityType': record.get('entityType'),
                'labelsOrTypes': record.get('labelsOrTypes'),
                'properties': record.get('properties')
            }
        });

        setStep(4);
        setMessage("Collecting node properties...")

        const result4 = await session.run(
            `UNWIND $labels as label
            CALL apoc.cypher.run('MATCH (n:' + label + ') RETURN properties(n) as properties LIMIT 1', {}) YIELD value
            RETURN label, value AS properties`, { labels: labels });
        const nodeProperties = result4.records.map(record => {
            return {
                'label': record.get('label'),
                'properties': record.get('properties')['properties']
            }
        });

        setStep(5);
        setMessage("Collecting relationship properties...")

        const result5 = await session.run(
            `UNWIND $relTypes as relType
            CALL apoc.cypher.run('MATCH ()-[n:' + relType + ']->() RETURN properties(n) as properties LIMIT 1', {}) YIELD value
            RETURN relType, value AS properties`, { relTypes: relTypes });
        const relProperties = result5.records.map(record => {
            return {
                'relType': record.get('relType'),
                'properties': record.get('properties')['properties']
            }
        });

        setStep(6);
        setMessage("Collecting schema & building templates...")

        const result6 = await session.run(
            `UNWIND $relTypes as relType
            CALL apoc.cypher.run('MATCH (n)-[r:' + relType + ']->(m) RETURN {start:labels(n), end:labels(m)} as value LIMIT 1', {}) YIELD value
            UNWIND value.value.start as start
            UNWIND value.value.end as end
            RETURN start, relType, end`, { relTypes: relTypes });
        const cardinalities = result6.records.map(record => {
            return {
                'start': record.get('start'),
                'relType': record.get('relType'),
                'end': record.get('end'),
            }
        });

        // setStep(6);
        // setMessage("Building templates...")
        const schema = buildSchemaDefinition(labels, relTypes, nodeProperties, relProperties, cardinalities, indexes);
        const templates = buildTemplateQueries(schema, indexes);
        setSchema(schema);
        setQueryTemplates(templates);
        setOpen(false);

    } catch (error) {
        setMessage('Error executing sampling: ' + error);
        console.error('Error executing sampling: ', error);
        throw error;
    } finally {
        // Close the session
        await session.close();
        // Close the driver
        await driver.close();
        setLoading(false);
    }
}