
import { Dialog, Button } from "@neo4j-ndl/react";
import { CursorArrowRaysIconOutline, CursorArrowRaysIconSolid, CursorArrowRippleIconSolid, LightBulbIconOutline, WrenchScrewdriverIconSolid } from "@neo4j-ndl/react/icons";

/**
 * A modal that appears when the user opens the application for the first time,
 * explaining the main features of the application.
 * It can also be opened inside the header.
 *
 * @param {Object} props - The props for this component.
 * @prop {boolean} isOpen - Whether the tutorial is open.
 * @prop {boolean} connected - Whether the user is currently connected to a database.
 * @prop {function} setIsOpen - A function to close the tutorial.
 * @prop {function} setConnectionOpen - A function to open the connection modal.
 * @prop {function} setConnected - A function to set the connected state.
 * @prop {function} setConnection - A function to set the connection state.
 */
export default function Tutorial(props: { isOpen: boolean, connected: boolean, setIsOpen: any, setConnectionOpen: any, setConnected: any, setConnection: any }) {
    const { isOpen, connected, setIsOpen, setConnectionOpen, setConnected, setConnection } = props;
    const handleClose = () => setIsOpen(false);

    return (
        <Dialog modalProps={{
            id: 'default-menu',
            className: 'w-full',
        }} onClose={handleClose} isOpen={isOpen} size={'large'} >
            <Dialog.Header>Visual Cypher Builder — Getting started</Dialog.Header>
            <Dialog.Description>A visual query editor for Neo4j queries (v0.1)</Dialog.Description>
            <Dialog.Content>

                Get started by adding blocks to your query:
                <br />
                <ul>
                    <li> • <b>Click <CursorArrowRaysIconSolid style={{ width: 20, display: 'inline-block' }} /> or drag <CursorArrowRippleIconSolid style={{ width: 20, display: 'inline-block' }} /></b> a block from the left sidebar to move it to your query builder.</li>
                    <li> •  <b>Click <CursorArrowRaysIconSolid style={{ width: 20, display: 'inline-block' }} />  </b> a block from the wizard 🧙 to add it to the end of your query. </li>
                </ul>
                <br />
                Then, build your query:
                <ul>
                    <li> • <b>Drag <CursorArrowRippleIconSolid style={{ width: 20, display: 'inline-block' }} /> </b> a block inside your query builder to construct the query.</li>
                    <li> • <b>Shift-click <CursorArrowRaysIconOutline style={{ width: 20, display: 'inline-block' }} /></b> a block inside your query to delete it. You can also drag it to the left of the screen.</li>
                    <li> •  <b>Click <CursorArrowRaysIconSolid style={{ width: 20, display: 'inline-block' }} />  </b> inside a block to change variables, labels, types and directions.</li>
                </ul>
                <br />

                You can also use query templates:
                <ul>
                    <li>• Open up the <b>Template <WrenchScrewdriverIconSolid style={{ width: 20, display: 'inline-block' }} /></b> menu and find a query template to start with. </li>
                    <li>• Load it into your query builder and modify it to your needs! </li>
                </ul>
                <br />

                For best results, connect to your own Neo4j instance. This tool is free to use under the <a style={{ color: 'blue' }} target="_blank" href="https://neo4j.com/labs/">Neo4j Labs</a> conditions.
                <br /><br />

                <Button onClick={() => {

                    setConnected(false);
                    handleClose();
                    setConnection({
                        protocol: 'neo4j',
                        uri: 'demo.neo4jlabs.com',
                        port: '7687',
                        user: 'movies',
                        password: 'movies',
                        database: 'movies'
                    });
                    if (connected) {
                        setConnected(false);
                        setConnectionOpen(true);
                    } else {
                        setConnected(true);
                    }

                }} size="medium">
                    Try with Movies
                </Button>
                &nbsp;&nbsp;
                <Button onClick={() => {
                    handleClose();
                    setConnected(false);
                    setConnectionOpen(true);
                }} fill="outlined" color="primary" size="medium">
                    Use your own database
                </Button>
            </Dialog.Content>
        </Dialog>
    );
}
