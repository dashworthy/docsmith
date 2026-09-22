# @docsmith/docsmith

A React document builder. You author a document as hand-written JSX using a library of predesigned
components, and the builder renders it to **PDF** with [`@react-pdf/renderer`](https://react-pdf.org).
Components are styled to **vanilla [ShadCN](https://ui.shadcn.com) design tokens** through
[`react-pdf-tailwind`](https://github.com/Kaldarmaa/react-pdf-tailwind): you write ShadCN semantic
Tailwind classes (`bg-card`, `text-foreground`, `border-border`, …) and they resolve to the styles
react-pdf wants. Light and dark are chosen at render time.

PDF is the only output — react-pdf paginates the document itself, with no HTML and no browser
page-layout step. (Headless Chrome is used only to rasterize mermaid diagrams into images.)

For the architecture and the invariants a change must respect, see the feature doc:
[`docs/document-rendering/react-doc-builder/README.md`](../../docs/document-rendering/react-doc-builder/README.md).

## Requirements

- **Node ≥ 18**, **npm**.
- **A Chromium-family browser** — only if a document uses `Mermaid`. It is auto-detected (env
  `CHROME_PATH` / `PUPPETEER_EXECUTABLE_PATH`, then standard install paths, then the Chromium
  `puppeteer` installs for itself). A document with no diagrams needs no browser.
- Fonts (Inter + IBM Plex Mono) are bundled and embedded in the PDF — no network needed to render.

## Setup

```bash
cd skills/docsmith
npm install
```

## Authoring a document

A PDF doc module (`*.pdf.tsx`) **default-exports a builder** `(theme) => <PdfDoc …>`, so one authored
document renders in either theme. Because react-pdf renders synchronously, async assets — Shiki code
highlighting (`highlightCode`) and mermaid rasterization (`rasterizeMermaid`) — are awaited up front
and passed to the components as data. Components reach color only through the `useTw()` boundary
(ShadCN classes), never raw hex, so the whole document re-themes from one token set.

Import the component library by the bare specifier `@docsmith/docsmith` (an in-package doc under
`src/docs/` imports it relatively as `../pdf/index.js`). For the component catalog, the when-to-use
matrix, and a worked example, see [references/authoring.md](references/authoring.md) and the
`src/docs/gallery.pdf.tsx` fixture.

## Rendering output

```bash
node --import tsx src/pdf/cli.ts src/docs/mydoc.pdf.tsx --theme dark --out mydoc.pdf
```

| Flag | Values | Default |
|---|---|---|
| `--theme` | `light` \| `dark` | `light` |
| `--out` | output `.pdf` path | required |

The positional argument is the doc module. A misspelled flag value is rejected rather than silently
coerced. To produce both themes, run the command twice with `--theme light` and `--theme dark`.

## Component library

- **Structure:** `PdfDoc` (root — owns theme, fonts, page, optional full-bleed `cover`), `Cover`
  (title band) / `CoverPage` (full-page hero), `Section` (eyebrow + title + deck), `Subhead`
  (subsection heading), `Toc` (table of contents). No page footers — see SKILL.md.
- **Prose:** `P`, `B`, `Muted`, `Eyebrow`.
- **Inline & tables:** `Badge`, `Table`, `Legend`.
- **Cards & panels:** `CompareCard` (header band + two role columns + target band), `SourceCard`,
  `PanelGrid` / `Panel`, `KeyBox`.
- **Sequencing:** `Phases`, `Flow` (lanes + step chips).
- **Lists:** `QList` (numbered questions), `NonGoals` (struck items).
- **Code & diagrams:** `CodeBlock` (pre-highlighted via `highlightCode`, Shiki colors in a ShadCN
  card), `Mermaid` (pre-rasterized via `rasterizeMermaid`, themed from the ShadCN tokens).

## Styling & theming

- **One styling boundary.** Components call `useTw()` and write ShadCN semantic classes; `PdfDoc`
  builds the theme-bound resolver (`createTw(shadcnConfig(theme))`) and provides it via context.
- **`fg-*` for surface foregrounds.** `react-pdf-tailwind` can't resolve both a bare token and its
  `-foreground`, so ShadCN's `text-muted-foreground` is written **`text-fg-muted`** (likewise
  `text-fg-primary`, etc.). Base tokens stay vanilla (`bg-card`, `border-border`, `text-foreground`).
- **Tokens live once** in `src/theme/palette.ts` as the `SHADCN` slate map — the sole source of color.
- The dependency is pinned to **`react-pdf-tailwind@2.3.0`** (Tailwind-v3-based); v3 rejects the
  semantic `theme.extend.colors` classes.

## Development

```bash
npm test          # vitest — component token + render tests
npm run typecheck # tsc --noEmit
```
