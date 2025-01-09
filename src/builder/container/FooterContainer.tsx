import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import SortableBlock from "../sortable/SortableBlock";


const containerStyle = {
  background: "#fcfcfc",
  padding: 10,
  width: "100%",
  // flex: 1,
  minHeight: 50, // Fixed height
  display: "flex", // Flexbox layout
  flexDirection: "row", // Horizontal item layout
  gap: 10, // Spacing between items
  flexWrap: "wrap", // Allow items to wrap to the next line
  alignItems: "center", // Vertically center items
  justifyContent: "flex-start", // Align items to the start horizontally
};


/**
 * A footer container for the query builder, which displays the wizard's suggestions.
 *
 * FooterContainer is a SortableContext which allows the user to reorder the items in the footer.
 * It renders a row of SortableBlock components, representing the query results.
 *
 * @param {Object} props
 * @param {string | number} [props.id] The id of the container
 * @param {Array<string | number>} [props.containerItems] The items in the container
 * @param {Object} [props.elements] The elements in the container
 * @param {function} [props.setElement] A function to update the elements in the container
 * @param {function} [props.onClick] A function to call when an item in the container is clicked
 * @returns {React.ReactElement}
 */
export default function FooterContainer(props: { onClick?: any; id?: any; containerItems?: any; elements?: any; setElement: any }) {
  const { id, containerItems, elements, setElement } = props;

  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <SortableContext
      id={id}
      items={containerItems}
      strategy={horizontalListSortingStrategy}
    >
      {/* @ts-ignore */}
      <div ref={setNodeRef} style={containerStyle}>
        {containerItems?.map((itemId: string) => (
          <SortableBlock
            key={itemId}
            id={itemId}
            hasTooltip={false}
            element={elements[itemId]}
            setElement={(element) => setElement(itemId, element)}
            onClick={props.onClick}
            onShiftClick={undefined}
            schema={undefined}
            variables={undefined}
            interactive={false}
          />
        ))}
      </div>
    </SortableContext>
  );
}
