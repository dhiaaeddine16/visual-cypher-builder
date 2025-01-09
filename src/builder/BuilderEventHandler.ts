import { DragOverEvent, DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { FOOTER_CONTAINER_COUNT, SIDEBAR_CONTAINER_COUNT } from "./logic/BuilderLogic";
import { arrayMove } from "@dnd-kit/sortable";
import { updateBuilderVariables } from "./logic/VariablesLogic";

/**
 * This file contains all functions handling events inside the builder.
 * This includes:
 * - Dragging a block.
 * - Dropping a block.
 * - Clicking on a block.
 * - Right clicking a block.
 */

function findContainer(items: any[], id: string) {
    // Find the container index that includes the item with the given id
    return items.findIndex((container: string | any[]) => container.includes(id));
}

export function handleSortableItemDelete(
    id: string | number,
    items: any[],
    elements: { [x: string]: any; },
    setItems: (arg0: any[]) => void,
    setElements: (arg0: any) => void,
    setActiveId: (arg0: any) => void
) {
    // @ts-ignore
    const containerIndex = findContainer(items, id);
    const container = items[containerIndex];
    const index = container.indexOf(id);
    const newContainer = [...container];
    newContainer.splice(index, 1);
    items[containerIndex] = newContainer;
    setItems([...items]);

    const newElements = { ...elements };
    delete newElements[id];

    setElements(newElements);
    setActiveId(id);
    // Reset the transform after the animation completes
    setTimeout(() => {
        setActiveId(undefined);
    }, 1); // Match the transition duration
}

export function handleSortableItemClick(
    id: string | number,
    itemRect: { width: number; left: number; top: number; height: number; },
    items: any[],
    elements: { [x: string]: any; },
    variables: any,
    schema: any,
    setActiveId: (arg0: any) => void,
    setItems: (arg0: any[]) => void,
    setElements: (arg0: any) => void) {

    // Find the container where it should move to. (first non-empty row)
    const containerIndex = items.length - 2;
    const queryContainerIndex = containerIndex - (SIDEBAR_CONTAINER_COUNT + FOOTER_CONTAINER_COUNT) + 1;

    const container = items[containerIndex];
    // Return the last element of that array, or undefined if no such array exists
    const targetId = container ? container[container.length - 1] : undefined;
    let targetElement = document.getElementById("item-" + targetId);
    let containerElement = document.getElementById("query-container-" + queryContainerIndex);

    let targetX, targetY;

    // If we end up in a broken state, attempt to recover.
    if(elements[id] == null){
         const { newItems, newElements } = updateBuilderVariables(items, elements, variables, schema);
         setItems(newItems);
         setElements(newElements);
         return;
    }


    if (targetElement !== null && elements[id]['type'] !== 'CLAUSE') {
        const targetRect = targetElement.getBoundingClientRect();
        // gap size = 10
        targetX = 10 + targetRect.right + itemRect.width / 2;
        targetY = (targetRect.top + targetRect.bottom) / 2;

    } else {
        const targetRect = containerElement.getBoundingClientRect();

        // gap size = 10
        targetX = targetRect.left + itemRect.width / 2 + 54 - 30;
        targetY = (targetRect.top + targetRect.bottom + 10) / 2 + 54 - 5;

        // Fix for weird behaviour on first line
        if(queryContainerIndex == 1 && container.length == 0){
            targetY -= 54;
        }
    }

    // Calculate the translation needed to center the item on the screen
    let deltaX = (itemRect.left + itemRect.width / 2) - targetX;
    let deltaY = (itemRect.top + itemRect.height / 2) - targetY;


    const newId = crypto.randomUUID();
    const newElements = { ...elements };
    newElements[newId] = { ...elements[id] };
    newElements[newId]['animated'] = true;
    newElements[newId]['animationDeltaX'] = deltaX;
    newElements[newId]['animationDeltaY'] = deltaY;
    setElements(newElements);

    let newItems = [...items];
    // Always add a clause to a new line
    if (elements[id]['type'] == 'CLAUSE' && newItems[containerIndex].length > 0) {
        newItems[containerIndex + 1] = [...newItems[containerIndex + 1], newId];
    } else {
        // Anything else goes at the end of the line
        newItems[containerIndex] = [...newItems[containerIndex], newId];
    }
    newItems = handleAddOrRemoveContainersAtQueryEnd(newItems);
    setItems(newItems);
    setActiveId(newId);
    setElements(newElements);



    // Reset the transform after the animation completes

    // TODO pretty sure there's some memory issues here..... not sure how to fix
    setTimeout(() => {
        setActiveId(undefined)
        newElements[newId]['animated'] = false;
        newElements[newId]['animationDeltaX'] = 0;
        newElements[newId]['animationDeltaY'] = 0;
        // setElements(newElements);
    }, 5); // Match the transition duration
}

export function handleDragStart(
    event: DragStartEvent,
    items: any[],
    elements: { [x: string]: any; },
    setItems: ((arg0: any[]) => void),
    setElements: ((arg0: any) => void),
    setActiveId: ((arg0: any) => void)) {

    const { active } = event;
    const { id } = active;

    // @ts-ignore
    const activeContainerIndex = findContainer(items, id);

    // If we select something from the duplicating containers:
    if (
        activeContainerIndex <
        SIDEBAR_CONTAINER_COUNT + FOOTER_CONTAINER_COUNT
    ) {
        const prev = [...items];
        const container = prev[activeContainerIndex];
        const activeIndex = container ? container.indexOf(id) : -1;
        const newId = crypto.randomUUID();
        const updatedContainer = [
            ...container.slice(0, activeIndex),
            newId,
            ...container.slice(activeIndex + 1, container.length),
        ];
        prev[activeContainerIndex] = updatedContainer;

        // Insert into definition map
        const newElements = { ...elements };
        newElements[newId] = {...elements[id]};
        setElements(newElements);
        setItems(prev);
    }
    setActiveId(id);
}

export function debounce(func: { apply: (arg0: any, arg1: any[]) => any; }, delay: number | undefined) {
    let timeoutId: number | undefined;
    return function (...args: any) {
        clearTimeout(timeoutId); // Clears the previous timeout if the function is called again
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

export function handleDragOver(
    event: DragOverEvent,
    activeId: string | undefined,
    items: any[],
    setItems: ((items: any[]) => void)) {
    const { active, over } = event;
    const id = activeId;

    if (over == undefined) {
        return;
    }
    const { id: overId } = over;

    const activeContainerIndex = findContainer(items, id);
    // @ts-ignore
    let overContainerIndex = findContainer(items, overId);


    if (Number.isInteger(Number(overId))) {
        overContainerIndex = SIDEBAR_CONTAINER_COUNT + FOOTER_CONTAINER_COUNT + Number(overId) - 1;
    }
    if (overContainerIndex === -1) {
        // Don't move stuff outside of all containers
        return;
    }

    // Don't handle moves in the same container (handled by library)
    // UNLESS the element is freshly created (duplicated from the left columns)
    if (activeContainerIndex === overContainerIndex) {
        if (over && activeId !== over.id) {
            const newItems = [...items];
            const container = [...items[activeContainerIndex]];
            const oldIndex = container.indexOf(activeId);
            const newIndex = container.indexOf(overId);
            newItems[activeContainerIndex] = arrayMove(container, oldIndex, newIndex);

            setItems(newItems);
        }
        return;
    }
    // @ts-ignore
    setItems((prev: any[]) => {
        const activeItems = prev[activeContainerIndex];
        const overItems = prev[overContainerIndex];

        if (overItems == undefined) {
            return items;
        }
        const activeIndex = activeItems ? activeItems.indexOf(id) : -1;
        const overIndex = overItems.indexOf(overId);

        let newIndex;
        if (overId === undefined) {
            newIndex = overItems.length + 1;
        } else {
            const isBelowLastItem =
                over &&
                overIndex === overItems.length - 1 &&
                // @ts-ignore
                active.rect.offsetTop > over.rect.offsetTop + over.rect.height;
            const modifier = isBelowLastItem ? 1 : 0;
            newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
        }

        const updatedActiveItems = activeItems
            ? activeItems.filter((item: any) => item !== id)
            : [];
        const updatedOverItems = [
            ...overItems.slice(0, newIndex),
            activeId,
            ...overItems.slice(newIndex),
        ];

        let newItems = prev.map((container: any, idx: number) => {
            if (idx === activeContainerIndex) {
                // Update the active container index
                return updatedActiveItems;
            }
            // But - only add stuff to the main builder containers
            if (idx === overContainerIndex && idx > SIDEBAR_CONTAINER_COUNT) {
                return updatedOverItems;
            }
            return container;
        });

        // We always want an empty row at the end.
        // If the last two rows are empty, delete the last.
        newItems = handleAddOrRemoveContainersAtQueryEnd(newItems);
        return newItems;
    });
}

/**
 * After reordering items, make sure there is always an empty row at the end.
 * If there are two empty rows, delete the last one.
 * If the last row is not empty, add an empty one.
 * @param newItems The new items array after reordering.
 * @returns The modified items array
 */
function handleAddOrRemoveContainersAtQueryEnd(newItems: any[]) {
    const thresholdIndex = SIDEBAR_CONTAINER_COUNT + FOOTER_CONTAINER_COUNT;

    // Remove empty rows in the middle if their index is greater than the threshold
    newItems = newItems.filter((row, index) => {
        return row.length > 0 || index <= thresholdIndex || index === newItems.length - 1;
    });

    if (newItems.length >
        SIDEBAR_CONTAINER_COUNT + FOOTER_CONTAINER_COUNT + 2 &&
        newItems[newItems.length - 2].length == 0 &&
        newItems[newItems.length - 1].length == 0) {
        newItems = newItems.slice(0, newItems.length - 1);
    }
    // ALSO: If the last row is non-empty, add an empty one.
    if (newItems[newItems.length - 1].length > 0) {
        newItems = [...newItems, []];
    }
    return removeDuplicates(newItems);
}

export function handleDragEnd(
    event: DragEndEvent,
    activeId: string | undefined,
    items: any[],
    setItems: ((items: any[]) => void),
    elements: any,
    setElements: any,
    setActiveId: ((id: string | undefined) => void)) {

    const { active, over } = event;
    const id = activeId;
    if (over == undefined) {
        setActiveId(undefined);
        return;
    }
    const { id: overId } = over;

    const activeContainerIndex = findContainer(items, id);
    // @ts-ignore
    const overContainerIndex = findContainer(items, overId);

    // If we drag too far left, delete the item:
    // @ts-ignore
    if (!overContainerIndex && event.activatorEvent.x + event.delta.x < 300){
        handleSortableItemDelete(id, items, elements, setItems, setElements, setActiveId);
        return 
    }

    // Dragged out of bounds, do nothing.
    if (
        activeContainerIndex === -1 ||
        overContainerIndex === -1 ||
        activeContainerIndex < SIDEBAR_CONTAINER_COUNT + FOOTER_CONTAINER_COUNT || // Never reorganize in the duplicating rows.
        activeContainerIndex !== overContainerIndex
    ) {
        setActiveId(undefined);
        return;
    }

    const activeIndex = items[activeContainerIndex].indexOf(activeId);
    let overIndex = items[overContainerIndex].indexOf(overId);

    if (activeIndex !== overIndex) {
        // @ts-ignore
        setItems((prevItems: any[]) => {
            let newItems = prevItems.map((container: any, idx: any) =>
                idx === overContainerIndex
                    ? arrayMove(container, activeIndex, overIndex)
                    : [...container]
            );
            return newItems;
        });
    }

    setActiveId(undefined);
}


function removeDuplicates(arr) {
    const seen = new Set();
    return arr.map(sublist => sublist.reduce((unique, item) => {
        if (!seen.has(item)) {
            seen.add(item);
            unique.push(item);
        }
        return unique;
    }, []));
}