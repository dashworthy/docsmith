---
type: llm
focus: {source: file, path: "preview.png"}
---
The image is the rasterized first page of the rendered light-theme PDF.

PASS only if the page shows ALL THREE of:
- a cover or a clear title area (a large title, not just body text starting at the top),
- at least one section of body prose beneath it,
- a real mermaid diagram — boxes/nodes connected by lines or arrows, laid out as a diagram.

FAIL if any of these is missing, or if the "diagram" is actually a code block (monospace text
of the mermaid source, or a ```mermaid fence), a blank/empty box, or an error message.
