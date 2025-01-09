import { DataGrid, Dialog, IconButton, TextInput } from "@neo4j-ndl/react";
import { PlayCircleIconOutline } from "@neo4j-ndl/react/icons";
import { useReactTable, getCoreRowModel, getSortedRowModel, ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import TemplateContainer from "../container/TemplateContainer";
import { FOOTER_CONTAINER_COUNT, SIDEBAR_CONTAINER_COUNT } from "../logic/BuilderLogic";

/**
 * A modal component that displays a table of query templates.
 * 
 * This modal contains a table with three columns: description, query, and use.
 * The description column displays the template description, the query column displays the template query, and the use column contains a button to use the template.
 * The table is searchable via a text input.
 * 
 * @param {boolean} isOpen - Determines if the modal is open or closed.
 * @param {function} setIsOpen - Callback to set the open state of the modal.
 * @param {array} templates - The templates to display in the table.
 * @param {object} elements - The elements of the query builder.
 * @param {array} items - The items of the query builder.
 * @param {function} setElements - Callback to update the elements of the query builder.
 * @param {function} setItems - Callback to update the items of the query builder.
 * @returns {JSX.Element} The rendered TemplatesModal component.
 */
export default function TemplatesModal(props: { isOpen: boolean; setIsOpen: any; templates: any; elements: any; items: any; setElements: any, setItems: any }) {
    const { isOpen, setIsOpen, templates, elements, items, setElements, setItems } = props;
    const [filterText, setFilterText] = useState("");

    const handleClose = () => setIsOpen(false);

    const baseData = templates;
    const [filteredData, setFilteredData] = useState(baseData);

    useEffect(() => {
        setFilteredData(baseData
            .filter(
                (row) =>
                    row?.cypher?.toLowerCase().includes(filterText.toLowerCase()) ||
                    row?.description?.toLowerCase().includes(filterText.toLowerCase()))
        )
    }, [filterText, baseData]);
    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "description",
            header: "Description",
            size: 450,
            cell: ({ row }) => (
                <div style={{ verticalAlign: "top", textAlign: 'left' }}>
                    {row.original.richDescription}
                </div>
            ),
        },
        {
            accessorKey: "query",
            header: "Query",
            // className: "htLef htTop",
            // size: 650,
            cell: ({ row }) => (
                <div style={{ verticalAlign: "top", width: '100%' }}>
                    {
                        row.original.items.map((container, index) => {
                            return <TemplateContainer id={index} key={index} containerItems={container} elements={row.original.elements} setElement={undefined} dragging={false} />
                        })
                    }
                </div>
            ),
        },
        {
            id: "use", // Unique ID for this column
            header: "Use",
            size: 100,
            cell: ({ row }) => (
                <div style={{ verticalAlign: "top" }}>
                    <IconButton
                        className="hidden md:inline-flex"
                        ariaLabel="Help"
                        size="large"
                        onClick={() => {
                            setElements({ ...elements, ...row.original.elements});
                            const newItems = items.slice(0,SIDEBAR_CONTAINER_COUNT + FOOTER_CONTAINER_COUNT);
                            row.original.items.map( (item, index) => {
                                newItems.push(item);
                            })
                            newItems.push([]);
                            setItems(newItems);
                            setIsOpen(false);
                        }}
                    >
                        <PlayCircleIconOutline aria-label="Help" />
                    </IconButton>
                </div>
            ),
        },
    ];

    // Memoize table instance
    const table =
        useReactTable({
            data
                : filteredData
            ,
            columns,
            enableSorting: false,
            getCoreRowModel: getCoreRowModel(),
            getSortedRowModel: getSortedRowModel(),
        });

    return (
        <Dialog
            modalProps={{
                id: "default-menu",
                className: "w-full",
                style: {
                    marginLeft: 250,
                    marginRight: 250
                }
                // onBlur: (e) => {
                //     if (!e.relatedTarget) {
                //         handleClose();
                //     }
                // },
            }}
            onClose={handleClose}
            isOpen={isOpen}
            size={"unset"}
        >
            <Dialog.Header>Query Templates ({templates?.length}) </Dialog.Header>
            <Dialog.Description>
                Get started with a template to start building your query.
            </Dialog.Description>
            <Dialog.Content>
                {/* Filter Textbox */}
                <div style={{ marginBottom: "1rem" }}>
                    <TextInput
                        value={filterText}
                        style={{ width: "280px" }}
                        htmlAttributes={{
                            type: "text",
                        }}
                        label="Find a template..."
                        placeholder="Enter text..."
                        isFluid
                        onChange={(e) => setFilterText(e.target.value)}
                    />
                </div>

                {/* Data Grid */}
                {isOpen ? <DataGrid

                    tableInstance={table}
                    isResizable={true}
                    isKeyboardNavigable={false}
                    styling={{
                        hasZebraStriping: false,
                        borderStyle: "all-sides",
                    }}
                    components={{
                        Navigation: null,
                    }}
                /> : <> </>}
            </Dialog.Content>
        </Dialog>
    );
}
