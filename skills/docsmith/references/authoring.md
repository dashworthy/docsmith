# Authoring reference — components & when to use each

Every component you compose a `pdf.tsx` from, imported from `@docsmith/docsmith`. Props are shown as
their TypeScript shape. The fixture `src/docs/configurator.pdf.tsx` uses all of them against real
content — read it as a worked example.

Two rules cut across everything:

- **Async assets are pre-computed.** react-pdf renders synchronously, so `highlightCode` (Shiki) and
  `rasterizeMermaid` (mermaid → PNG) are `await`ed **up front** in the (async) builder and passed to
  `CodeBlock` / `Mermaid` as data. Never call them inside the JSX tree.
- **You never touch color.** Components resolve ShadCN tokens internally and re-theme from one token
  set; light/dark is chosen at render time. You pick a **role** (semantic), not a hex.

## Structure

| Component | Props | Use it for |
|---|---|---|
| `PdfDoc` | `{ theme: PdfTheme; title: string; children }` | The root. Wraps the whole document; owns theme, fonts, page. Exactly one, outermost. |
| `Cover` | `{ eyebrow: string; title: string; lede?: string; chips?: string[] }` | The title band — the document's hero. `eyebrow` = mono kicker, `chips` = metadata pills. One, first. |
| `Section` | `{ eyebrow: string; title: string; deck?: string; children }` | A top-level section: accent kicker + display title + optional muted deck, then body. The backbone of the doc. |
| `Subhead` | `{ title: string; deck?: string; rule?: boolean }` | An h3 subsection heading inside a `Section` body — a bold title over an optional hairline rule, with an optional muted line. Splits a long section into named runs. |
| `Toc` | `{ title?: string; items: { title; page?; level? }[] }` | A table of contents: entries with dotted leaders to right-aligned page numbers; `level > 0` indents a sub-entry. |

> **Never a page footer.** There is no `Footer` component and you must not hand-roll one. Author / date / confidentiality metadata goes on the cover (`CoverPage`'s `meta` strip or `Cover`'s chips), never a bottom-of-page strip.

## Prose

| Component | Props | Use it for |
|---|---|---|
| `P` | `{ children }` | A body paragraph. Default for running text. |
| `B` | `{ children }` | Bold inline emphasis inside a `P`. |
| `Muted` | `{ children }` | De-emphasized inline text (asides, secondary notes). |
| `Eyebrow` | `{ children }` | A standalone mono kicker outside a Section header. |

## Inline & tables

| Component | Props | Use it for |
|---|---|---|
| `Badge` | `{ role?: 'neutral'\|'accent'\|'positive'\|'negative'\|'warning'; children }` | An inline pill inside prose — a status/label (`12 at a time`, `Beta`). Default `neutral`. |
| `Table` | `{ head: string[]; rows: string[][] }` | Genuinely tabular data — a class→responsibility grid, a field list. Both columns short-ish. |
| `Legend` | `{ items: { role: 'accent'\|'positive'\|'negative'\|'warning'\|'neutral'; label: string }[] }` | A key explaining what the role tints mean, when a doc leans on them heavily. |

## Cards & panels

| Component | Props | Use it for |
|---|---|---|
| `KeyBox` | `{ role: 'accent'\|'positive'\|'warning'\|'negative'; title: string; children }` | **The admonition** — Note / Tip / Important / Warning / a labeled callout ("Dead end — zero results"). The title is always explicit; `role` sets the color (shown in the bar + title, panel stays white/framed). This is the callout primitive — there is no `Callout` component. |
| `CompareCard` | `{ title: string; a: Col; b: Col; target?: string }` where `Col = { role: 'warning'\|'negative'\|'positive'; label: string; items: string[] }` | A two-column comparison — this-vs-that, option A vs option B — with an optional `target` takeaway line under it. |
| `SourceCard` | `{ title: string; children }` | A single labeled card highlighting one class/module/file and what it does (mono title). |
| `PanelGrid` / `Panel` | `PanelGrid { children }`; `Panel { title: string; children }` | A row of 2+ short peer explanations (e.g. "Pictures" / "Prices"). Put `Panel`s inside a `PanelGrid`. |

## Sequencing

| Component | Props | Use it for |
|---|---|---|
| `Phases` | `{ items: { idx: string; title: string; body: string; parallel?: boolean }[] }` | Ordered stages/steps with a big number — a numbered process ("1. Page load", "2. Product fetch"). `parallel: true` tints a step as concurrent. |
| `Flow` | `{ lanes: Lane[] }` where `Lane = { tag: string; tone: 'bad'\|'good'; steps: { text: string; tone?: 'bad'\|'good' }[] }` | Horizontal step lanes with arrows — a pipeline read left-to-right, toned good/bad. Each lane has a required `tag` (its uppercase label) and `steps` whose chip text is `text`. Use for a short linear flow where a full mermaid diagram is overkill. |

## Lists

| Component | Props | Use it for |
|---|---|---|
| `QList` | `{ items: string[] }` | A numbered list — deploy steps, ordered questions. |
| `NonGoals` | `{ items: string[] }` | Struck-through "not this" items — explicit out-of-scope / anti-goals. |

## Code & diagrams (async)

| Component | Props | Use it for |
|---|---|---|
| `CodeBlock` | `{ code: HighlightedCode }` — from `await highlightCode(src, lang, theme)` | A syntax-highlighted code block. Shiki colors framed in a ShadCN card. |
| `Mermaid` | `{ diagram: RasterDiagram; title?: string; caption? : string }` — from `await rasterizeMermaid(src, theme)` | A mermaid diagram as a real vector-quality image in a titled card. Flowcharts, ER diagrams, sequences. Needs Chrome at render. |

```tsx
// The async pre-pass, then the tree:
const code = await highlightCode('const x = 1;', 'ts', theme);
const er   = await rasterizeMermaid('erDiagram\n  A ||--o{ B : has', theme);
// …later, in the JSX:
<CodeBlock code={code} />
<Mermaid diagram={er} title="Entity graph" caption="A owns many B." />
```

## Choosing between near-neighbors

- **Tabular data → `Table`; peer explanations → `PanelGrid`; this-vs-that → `CompareCard`.** A table
  with one long/prose column usually wants to be panels or a compare card instead.
- **A callout/admonition is always `KeyBox`** (there is no `Callout`). Reach for a `role`:
  `accent` = note/info, `positive` = tip/good, `warning` = caution, `negative` = danger/dead-end.
- **A process: numbered stages → `Phases`; a left-to-right pipeline → `Flow`; anything branching or
  with real nodes/edges → a `Mermaid` flowchart.**
- **One highlighted class/file → `SourceCard`; many rows of class→responsibility → `Table`.**
