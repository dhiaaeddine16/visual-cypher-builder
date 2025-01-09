import {
  rectSortingStrategy, // Use rectSortingStrategy for wrapping
  SortableContext,
} from "@dnd-kit/sortable";
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
 * A container for rendering a row of items inside the template window.
 *
 * TemplateContainer is a SortableContext which allows the user to reorder the items in the query block.
 * It renders a row of SortableBlock components, representing the query elements.
 * It is logically minimal, as blocks in the template window are neither resortable nor interactive.
 *
 * @param {Object} props
 * @param {string | number} [props.id] The id of the container
 * @param {Array<string | number>} [props.containerItems] The items in the container
 * @param {Object} [props.elements] The elements in the container
 * @param {function} [props.setElement] A function to update the elements in the container
 * @param {boolean} [props.dragging] Whether the component is currently being dragged
 * @returns {ReactElement}
 */
export default function TemplateContainer(props: { onClick?: any; id?: any; containerItems?: any; elements?: any; setElement: any; dragging: boolean }) {
  const { id, containerItems, elements, setElement } = props;
  return (
    <SortableContext
      id={id}
      items={containerItems}
      disabled={false}
      strategy={rectSortingStrategy} // Updated to rectSortingStrategy
    >
      {/* @ts-ignore */}
      <div style={{ ...containerStyle }}>
        {containerItems?.map((itemId: string | number) => {
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
        )}

      </div>
    </SortableContext>
  );
}
