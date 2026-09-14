// Public barrel for the react-pdf document builder: the primitives a PDF doc composes, plus the
// async asset helpers (code highlighting, mermaid rasterization) a doc runs before render.
export { PdfDoc } from './components/PdfDoc.js';
export { Cover } from './components/Cover.js';
export { Section } from './components/Section.js';
export { Footer } from './components/Footer.js';
export { P, B, Muted, Eyebrow } from './components/prose.js';
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

export { highlightCode, type HighlightedCode } from './highlightCode.js';
export { rasterizeMermaid, type RasterDiagram } from './rasterizeMermaid.js';
export type { PdfTheme } from './theme.js';
