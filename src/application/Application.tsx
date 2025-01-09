import { useEffect, useState } from "react";
import Builder from "../builder/Builder";
import Header from "./Header";
import Tutorial from "./Tutorial";
import ConnectionModal from "../connection/ConnectionModal";
import { setDriver } from "../connection/Driver";
import SamplingModal from "../builder/sampling/SamplingModal";

/**
 * This component renders the main application, consisting of a header, a query
 * builder, and a footer. It also handles the state of the connection to the Neo4j
 * instance and the sampling modal.
 * 
 * @returns The JSX element representing the application.
 */
export default function Application() {

  const [tutorialIsOpen, setTutorialIsOpen] = useState(() => {
    // Initialize state from localStorage if available
    const savedTutorialIsOpen = localStorage.getItem("tutorial");
    return savedTutorialIsOpen ? false : true;
  });
  const [connected, setConnected] = useState(false);
  const [connection, setConnection] = useState(() => {
    // Initialize state from localStorage if available
    const savedConnection = localStorage.getItem("connection");
    return savedConnection ? JSON.parse(savedConnection) : {};
  });
  const [connectionModalIsOpen, setConnectionModalIsOpen] = useState(false);
  const [samplingModalIsOpen, setSamplingModalIsOpen] = useState(false);

  const [schema, setSchema] = useState({});
  const [queryTemplates, setQueryTemplates] = useState([]);

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      height: "100vh", // Full height of the viewport
      margin: 0,
    },
    header: {
      // height: "100px", // Fixed height for the header
      backgroundColor: "#f4f4f4",
    },
    main: {
      flex: 1, // Makes this element fill the remaining space
      backgroundColor: "#ddd",
      // overflow: "hidden", // Adds scrollbars if content is too tall
    },
  };


  // Store the active connecting in localstorage if it changes.
  useEffect(() => {
    localStorage.setItem("connection", JSON.stringify(connection));
  }, [connection]);

  // If a new Neo4j connection is made, refresh the sample schema.
  useEffect(() => {
    if (connected) {
      setSamplingModalIsOpen(true);
    }
  }, [connected]);

  // Save tutorial state to localStorage.
  useEffect(() => {
    localStorage.setItem("tutorial", JSON.stringify(tutorialIsOpen));
  }, [tutorialIsOpen]);

  // Attempt to establish a connection when the component mounts
  useEffect(() => {
    const initializeConnection = async () => {
      if (connection.uri && connection.user && connection.password) {
        const connectionURI = `${connection.protocol}://${connection.uri}:${connection.port}`;
        const isConnected = await setDriver(connectionURI, connection.user, connection.password);
        setConnected(isConnected);
        if (!isConnected) {
          setConnectionModalIsOpen(true);
        }
      } else {

      }
    };
    initializeConnection();
  }, []);

  return (
    <div id="application"
      // @ts-ignore
      style={styles.container}
    >
      <div style={styles.header}>
        <Header
          title="&nbsp;𝙇𝙖𝙗𝙨 — Visual Cypher Builder"
          connected={connected}
          connection={connection}
          setConnected={setConnected}
          openConnectionModal={() => setConnectionModalIsOpen(true)}
          onHelpClick={() => setTutorialIsOpen(true)} />
      </div>

      <div style={styles.main}>
        <Builder
          schema={schema}
          queryTemplates={queryTemplates}
          connected={connected}
          connection={connection} />
      </div>
      <Tutorial
        isOpen={tutorialIsOpen}
        connected={connected}
        setIsOpen={setTutorialIsOpen}
        setConnectionOpen={setConnectionModalIsOpen}
        setConnection={setConnection}
        setConnected={setConnected} />

      <ConnectionModal
        open={connectionModalIsOpen}
        connection={connection}
        setOpen={setConnectionModalIsOpen}

        setConnected={setConnected}
        setConnection={setConnection} />

      <SamplingModal
        open={samplingModalIsOpen}
        setSchema={setSchema}
        setConnection={setConnection}
        setConnected={setConnected}
        setTemplates={setQueryTemplates}
        setOpen={setSamplingModalIsOpen}
        connection={connection} />

    </div>
  );
}
