import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BlockComponent } from "../block/Block";


/**
 * A SortableBlock is a block that can be rearranged in a list by dragging it.
 * It takes the following props:
 * - onClick: a function that is called when the block is clicked.
 * - onShiftClick: a function that is called when the block is clicked with the shift key.
 * - id: an identifier for the block.
 * - element: the block element.
 * - schema: the schema of the block.
 * - variables: the variables of the block.
 * - hasTooltip: whether the block should render a tooltip.
 * - setElement: a function that is called when the element of the block changes.
 * - interactive: whether the block is interactive.
 * The block will trigger an animation when clicked.
 * The position of the animation is handled by the root level component.
 * The block will also change its style when it is being dragged (opacity, margin left).
 * The block will also change its z-index when it is being dragged to be on top of other blocks.
 */
export default function SortableBlock(props: { onClick: any; onShiftClick: any; id?: any; element?: any; schema: any, variables: any; hasTooltip: boolean; setElement: any; interactive: boolean }) {
  const { id, element, hasTooltip, onClick, onShiftClick, schema, variables, interactive, setElement } = props;
  const [isMoving, setIsMoving] = useState(false);
  const [smoothing, setSmoothing] = useState(false);
  const [inFocus, setInFocus] = useState(false);

  //
  if (element?.animated && !isMoving) {
    setIsMoving(true);
    // This is a workaround to prevent the animation from being triggered again
    setTimeout(() => {
      setIsMoving(false);
      setSmoothing(false);
    }, 0.1);
    // After 250 allow for regular smooth rearrangement of the tile again
    setTimeout(() => {
      setSmoothing(true);
    }, 275);
  }
  const transformStyle = {
    transform: `translate(
      ${element?.animated ? element?.animationDeltaX : 0}px, 
      ${element?.animated ? element?.animationDeltaY : 0}px)`,
    transition: "transform 0.275s ease",
  };

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id
    });


  const style = {
    ...transformStyle,
    opacity: isDragging ? 0.5 : 1,
    // marginLeft: isDragging ? "2px" : "0px",
    transform: !smoothing ? transformStyle.transform : CSS.Translate.toString(transform),
    transition: !smoothing ? transformStyle.transition : transition,
    zIndex: inFocus ? 99 : 0 // Workaround to always put focused block on top.
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // If an element is clicked, we trigger an animation.
        // The position of the animation is handled by the root level component.
        // The transformStyle represents the temporary style for the transformation animation.
        if (onShiftClick && e.shiftKey) {
          onShiftClick(id, e.currentTarget.getBoundingClientRect(), () => { })
        } else {
          onClick(id, e.currentTarget.getBoundingClientRect(), () => { })
        }
      }}

    >
      {/* /TODO can we remove the placeholder item from each row now? */}
      <BlockComponent
        id={id}
        hasTooltip={hasTooltip}
        interactive={interactive}
        schema={schema}
        variables={variables}
        element={element}
        setElement={setElement}
        setInFocus={setInFocus} />
    </div>
  );
}
