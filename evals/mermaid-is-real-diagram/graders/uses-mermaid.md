---
type: tool_used
tool: Write
input_match: 'rasterizeMermaid|<Mermaid'
---
The diagram was wired through the real diagram path — `rasterizeMermaid` (the async pre-pass) and
the `Mermaid` component. Scoped to Write input (authored content), so reading the fixture or a
reference that mentions Mermaid cannot satisfy it without the component actually being written.
