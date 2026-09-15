---
type: tool_used
tool: Write
input_match: '```mermaid'
min: 0
max: 0
---
The mermaid diagram was NOT carried through as a raw ```mermaid code fence (which would render as a
code block, not a diagram). The mermaid source is passed to `rasterizeMermaid` as an unfenced
string, so a correctly authored `pdf.tsx` never contains the fence. Scoped to Write input, not the
trace — the fixture Claude reads DOES contain the fence, so a trace-scoped check would always fail.
