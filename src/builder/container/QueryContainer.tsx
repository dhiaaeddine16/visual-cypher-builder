import { DragOverlay, useDroppable } from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  rectSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import SortableBlock from "../sortable/SortableBlock";

const containerStyle = {
  background: "#fcfcfc",
  margin: 2,
  width: "100%",
  minHeight: 50, // Fixed height
  padding: 5,
  display: "flex", // Flexbox layout
  flexDirection: "row", // Horizontal item layout
  flexWrap: "wrap", // Allow items to wrap to the next line
  gap: '5px 10px', // Spacing between items

  alignItems: "center", // Vertically center items
  justifyContent: "flex-start", // Align items to the start horizontally
};

/**
 * A container for rendering a row inside the main query builder interface.
 *
 * QueryContainer is a SortableContext which allows the user to reorder the items in the query block.
 * It renders a row of SortableBlock components, representing the query elements.
 *
 * @param {Object} props
 * @param {string | number} [props.id] The id of the container
 * @param {Array<string | number>} [props.containerItems] The items in the container
 * @param {Object} [props.elements] The elements in the container
 * @param {function} [props.setElement] A function to update the elements in the container
 * @param {function} [props.onClick] A function to call when an item in the container is clicked
 * @param {function} [props.onShiftClick] A function to call when an item in the container is shift-clicked
 * @param {boolean} [props.dragging] Whether the component is currently being dragged
 * @param {string | number} [props.activeId] The id of the currently active element
 * @returns {ReactElement}
 */
export default function QueryContainer(props: { onClick?: any; onShiftClick: any; id?: any; dragging: boolean; schema: any; variables: any; containerItems?: any; elements?: any; setElement: any, activeId?: any; }) {
  const { id, containerItems, elements, setElement, schema, variables, activeId, dragging } = props;

  const { setNodeRef } = useDroppable({
    id,
  });
  return (
    <SortableContext
      id={'query-container-' + id}
      items={containerItems}
      strategy={horizontalListSortingStrategy}
    >
      {/* @ts-ignore */}
      <div ref={setNodeRef} style={containerStyle} id={'query-container-' + id}>
        <span style={{color: '#6c6c6c'}}>{id}</span>
        {containerItems?.map((itemId: string | number) => (
          <SortableBlock
            key={itemId}
            id={itemId}
            schema={schema}
            variables={variables}
            element={elements[itemId]}
            hasTooltip={false}
            setElement={(element) => setElement(itemId, element)}
            onClick={props.onClick}
            onShiftClick={props.onShiftClick}
            interactive={!dragging}
          />
        ))}
      </div>
    </SortableContext>
  );
}
