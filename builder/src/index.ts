// Public barrel for the document builder: every authoring component a doc module composes,
// re-exported from one entry point so a doc imports from '../index.js' rather than reaching into
// individual component files.
export { Doc } from './components/Doc.js';
export { Cover } from './components/Cover.js';
export { Section } from './components/Section.js';
export { Footer } from './components/Footer.js';
export { Callout } from './components/Callout.js';
export { Badge } from './components/Badge.js';
export { Table } from './components/Table.js';
export { Legend } from './components/Legend.js';
export { CompareCard } from './components/CompareCard.js';
export { SourceCard } from './components/SourceCard.js';
export { PanelGrid, Panel } from './components/PanelGrid.js';
export { KeyBox } from './components/KeyBox.js';
export { Phases } from './components/Phases.js';
export { Flow } from './components/Flow.js';
export { QList } from './components/QList.js';
export { NonGoals } from './components/NonGoals.js';
export { CodeBlock } from './components/CodeBlock.js';
export { Mermaid } from './components/Mermaid.js';
