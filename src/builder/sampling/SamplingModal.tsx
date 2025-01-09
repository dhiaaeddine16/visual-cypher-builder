import { Button, Dialog, TextInput, Banner, Dropzone, Select, LoadingSpinner } from '@neo4j-ndl/react';
import { useEffect, useState } from 'react';
import { doSampling } from '../logic/SamplingLogic';



interface SamplingModalProps {
    open: boolean;
    setOpen: (arg: boolean) => void;
    setConnection: (arg: any) => void;
    setConnected: (arg: boolean) => void;
    connection: any;
    setSchema: any;
    setTemplates: any;
}

/**
 * A modal component that manages the connection to a Neo4j database and performs schema sampling.
 * 
 * @param {boolean} open - Determines if the modal is open or closed.
 * @param {Function} setOpen - Callback to set the open state of the modal.
 * @param {Function} setSchema - Callback to update the schema state.
 * @param {Function} setConnection - Callback to update the connection state.
 * @param {Function} setConnected - Callback to set the connected state.
 * @param {Object} connection - Object containing the connection details.
 * @param {Function} setTemplates - Callback to update the query templates.
 *
 * @returns {JSX.Element} The rendered ConnectionModal component.
 */
export default function ConnectionModal({
    open,
    setOpen,
    setSchema,
    setConnection,
    setConnected,
    connection,
    setTemplates
}: SamplingModalProps) {

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    useEffect(() => {

        if (open && !loading) {
            console.log("Schema sampling...")
            setLoading(true);
            doSampling(connection, setMessage, setStep, setOpen, setLoading, setSchema, setTemplates);
        }
    }, [open])
    return (
        <>
            <Dialog size='small' isOpen={open} aria-labelledby='form-dialog-title'
                hasDisabledCloseButton={true}
                onClose={() => {
                    setOpen(false)
                }}>
                {/* <Dialog.Header>Connect to Neo4j</Dialog.Header> */}
                <Dialog.Content className='n-flex n-flex-col n-justify-center n-items-center' style={{
                    height: '300px', // Define the height of the modal to make it square
                }}>
                    <LoadingSpinner size='large' />

                    <p style={{ marginTop: '10px' }}>Sampling database ({step}/6)</p>

                    <span>{message}</span>
                    <br /><br />

                    {message?.startsWith('Error executing sampling:') ?
                        <Button onClick={() => {
                            setConnection({});
                            setConnected(false);
                            setOpen(false)
                        }}>Disconnect</Button> : null}
                </Dialog.Content>
            </Dialog>
        </>
    );
}