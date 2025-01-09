import "@neo4j-cypher/codemirror/css/cypher-codemirror.css";
import { CypherEditor, CypherEditorProps } from '@neo4j-cypher/react-codemirror';
import { FOOTER_CONTAINER_COUNT, SIDEBAR_CONTAINER_COUNT } from "../logic/BuilderLogic";
import { BlockType } from "../block/BlockType";

/**
 * A CodeMirror component that renders a read-only cypher query in a Monaco-like interface.
 *
 * This component is used to display the final rendered query in the main query builder interface.
 *
 * @param {Object} props The component props.
 * @param {string} props.cypher The Cypher query to render.
 */
export default function CodeEditor(props: { cypher: string }) {
    const editorProps: CypherEditorProps = { autocomplete: false, lineWrapping: true, value: props.cypher, readOnly: true, style: { fontSize: 18, lineHeight: 40, verticalAlign: 'center' } };
    return (
        <CypherEditor {...editorProps} />
    );
}


/**
 * Generate a Cypher query from a list of containers and elements.
 *
 * The containers contain the blocks that the user has dragged and dropped into the query builder.
 * The elements are the properties of the blocks.
 *
 * The function will iterate over the containers and elements, and generate a Cypher query based on the content.
 *
 * @param {any[]} items The containers.
 * @param {any} elements The properties of the blocks.
 * @param {number} skip The number of containers to skip. Defaults to the number of containers in the sidebar and footer.
 * @returns {string} The generated Cypher query.
 */
export function generateCypher(items: any, elements: any, skip = SIDEBAR_CONTAINER_COUNT + FOOTER_CONTAINER_COUNT) {
    let displayText = '';
    let lastClause = undefined;

    items.slice(skip).forEach((container: any, index: any) => {
        let line = '';
        container.forEach((item: any, itemIndex: number) => {
            const type = elements[item]?.type;
            const components = BlockType[type]?.components || [];
            const textArray = elements[item]?.text || [];

            if (type == 'CLAUSE') {
                // Clause is always a single text element.
                // We remember the last clause so we can do some conditional rendering.
                lastClause = textArray[0];
            }

            textArray.forEach((text: any, index: number) => {
                // No dependencies, always render
                if (!components[index]?.dependson) {
                    line += text;
                }
                // Has a dependency on an index, only render if that index is not empty. i.e. the ':' in (n:Node).
                if (components[index]?.dependson && textArray[components[index]?.dependson] !== '') {
                    line += text;
                }
            });

            // Add comma between elements in the return and with clauses, but not between elements in other clauses.
            const nextItem = container[itemIndex + 1];
            const nextType = elements[nextItem]?.type;
            if (
                (lastClause == 'RETURN' || lastClause == 'WITH' || lastClause == 'ORDER BY') &&
                (nextType == 'VARIABLE' || nextType == 'COMPARISON' || nextType == 'STRING_COMPARISON' || nextType == 'NULL_COMPARISON' || nextType == 'FUNCTION') &&
                (type !== 'CLAUSE' && type !== 'OPERATOR' && type !== 'BRACKET')
            ) {
                line += ',';
            }

            // Always add a space after each block.
            if (type !== 'OPERATOR' && nextType !== 'OPERATOR') {
                line += ' ';
            }


        });
        displayText += line;

        // Add a newline to all but the last container.
        if (index < items.slice(skip).length - 1) {
            displayText += '\n';
        }
    });

    // NIcely format nodes connected to rels
    // @ts-ignore
    displayText = displayText.replaceAll(') -[', ')-[');
    // @ts-ignore
    displayText = displayText.replaceAll(') <-[', ')<-[');
    // @ts-ignore
    displayText = displayText.replaceAll(']-> (', ']->(');
    // @ts-ignore
    displayText = displayText.replaceAll(']- (', ']-(');

    // Nicely format nodes and nodes
    // @ts-ignore
    displayText = displayText.replaceAll(') (', '), (');
    return displayText;
}

