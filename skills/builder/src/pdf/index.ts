// Public barrel for the react-pdf document builder: the primitives a PDF doc composes, plus the
// async asset helpers (code highlighting, mermaid rasterization) a doc runs before render.
export { PdfDoc } from './components/PdfDoc.js';
export { Cover } from './components/Cover.js';
export { CoverPage } from './components/CoverPage.js';
export { Section } from './components/Section.js';
export { Subhead } from './components/Subhead.js';
export { Toc } from './components/Toc.js';
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
export { StatGrid } from './components/StatGrid.js';
export { Meter } from './components/Meter.js';
export { DefList } from './components/DefList.js';
export { Timeline } from './components/Timeline.js';
export { Matrix } from './components/Matrix.js';
export { Quote } from './components/Quote.js';
export { Checklist } from './components/Checklist.js';
export { Byline } from './components/Byline.js';
export { Banner } from './components/Banner.js';
export { References, Ref } from './components/References.js';

export { highlightCode, type HighlightedCode } from './highlightCode.js';
export { rasterizeMermaid, type RasterDiagram } from './rasterizeMermaid.js';
export type { PdfTheme } from './theme.js';
