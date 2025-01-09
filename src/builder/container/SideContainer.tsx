import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  rectSortingStrategy, // Use rectSortingStrategy for wrapping
  SortableContext,
} from "@dnd-kit/sortable";
import SortableBlock from "../sortable/SortableBlock";
import { BlockComponent } from "../block/Block";


const containerStyle = {
  background: "#fcfcfc",
  padding: 0,
  margin: 2,
  width: "calc(100%+28px)", // Full width to allow wrapping
  height: "auto", // Dynamic height based on content
  flex: 1,
  // marginTop: 15,
  minHeight: 50, // Fixed height
  paddingTop: 5,
  paddingLeft: 5,
  paddingBottom: 5,
  paddingRight: 5,
  marginBottom: 0,
  marginLeft: '-12px',
  marginRight: '-12px',
  display: "flex", // Flexbox layout
  flexDirection: "row", // Horizontal layout
  flexWrap: "wrap", // Allow items to wrap to the next line
  rowGap: 5, // Space between items
  columnGap: 10, // Space between items
  userSelect: "none",
  alignItems: "flex-start", // Align items to the top
  justifyContent: "flex-start", // Align items to the start horizontally
};

/**
 * A container for rendering a row of items inside the sidebar of blocks.
 *
 * SideContainer is a SortableContext which allows the user to reorder the items in the sidebar.
 * It renders a row of SortableBlock components, representing the query elements.
 *
 * @param {Object} props
 * @param {string | number} [props.id] The id of the container
 * @param {Array<string | number>} [props.containerItems] The items in the container
 * @param {Object} [props.elements] The elements in the container
 * @param {function} [props.setElement] A function to update the elements in the container
 * @param {function} [props.onClick] A function to call when an item in the container is clicked
 * @param {boolean} [props.dragging] Whether the component is currently being dragged
 */
export default function SideContainer(props: { onClick?: any; id?: any; containerItems?: any; elements?: any; setElement: any; dragging: boolean }) {
  const { id, containerItems, elements, setElement } = props;

  const [hovering, setHovering] = React.useState(false);
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <SortableContext
      id={id}
      items={containerItems}
      disabled={false}
      strategy={rectSortingStrategy} // Updated to rectSortingStrategy
    >
      {/* @ts-ignore */}
      <div ref={setNodeRef} style={{ ...containerStyle }}
        onMouseOver={() => setHovering(true)} onMouseOut={() => setHovering(false)}>
        {containerItems.length == 0 ? 'Add patterns to show suggestions here...' : ''}
        {containerItems?.map((itemId: string | number) => {
          // This is an optimization trick. We only render the 'grabbable' block if the user is hovering over the container.
          if (hovering) {
            return <SortableBlock
              key={itemId}
              id={itemId}
              hasTooltip={true}
              element={elements[itemId]}
              setElement={(element) => setElement(itemId, element)}
              interactive={false}
              onClick={props.onClick}
              onShiftClick={undefined}
              schema={undefined}
              variables={undefined}
            />
          } else {
            return <BlockComponent
              id={itemId}
              hasTooltip={false}
              schema={undefined}
              variables={undefined}
              setInFocus={undefined}
              element={elements[itemId]}
              setElement={() => { }}
              interactive={false}
            />
          }
        }


        )}

      </div>
    </SortableContext>
  );
}
