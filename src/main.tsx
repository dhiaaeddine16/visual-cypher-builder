import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// We need to include the base CSS in the root of the app so all of our components can inherit the styles
import '@neo4j-ndl/base/lib/neo4j-ds-styles.css';
import Application from './application/Application';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Application />
  </StrictMode>,
)
