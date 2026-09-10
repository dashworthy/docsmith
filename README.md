# docsmith

A Claude Code plugin (and single-plugin marketplace) that turns Markdown documentation
into **polished, print-ready PDFs** — a designed visual system with web fonts, a cover page,
callouts, badges and styled tables, and `mermaid` diagrams rendered as crisp vector "cards"
that never run off the page.

It ships one skill, **`rendering-markdown-to-pdf`**, plus the Node script that does the work.

## What you get

- **A designed theme** (default) — design tokens, IBM Plex + Familjen Grotesk fonts, an
  artifact-style **doc title hero** from YAML frontmatter (accent rule, kicker, big title,
  label/value metadata), **section headers** (accent kicker + title + deck), GitHub-style
  **admonition callouts**, inline **badges/pills**, and accent-header **tables**.
- **Real diagrams, not code** — every ```mermaid fence renders as selectable vector art, in a
  titled card with a coloured header (`blue` default; `green` / `slate` / `purple`), a tinted
  background, and an optional caption.
- **Nothing off the page** — wide diagrams scale to fit; tables and code wrap; pages fill
  instead of leaving big gaps.
- **Clean output** — A4, no date/URL/page-number band.

## Install

In Claude Code:

```
/plugin marketplace add dashworthy/docsmith
/plugin install docsmith@docsmith
```

## Use

Ask Claude to "make a designed PDF of this README" (or any `.md`), and the skill drives the
script. To run it directly:

```bash
# one-time, in the skill's script folder
npm install --prefix skills/rendering-markdown-to-pdf/scripts

# convert (designed/dark by default)
node skills/rendering-markdown-to-pdf/scripts/md2pdf.mjs README.md
node skills/rendering-markdown-to-pdf/scripts/md2pdf.mjs README.md out.pdf --mode light --accent green
node skills/rendering-markdown-to-pdf/scripts/md2pdf.mjs README.md out.pdf --design plain
```

The designed theme has a **dark** and a **light** mode (both full-bleed), a component
library modeled on a real Claude design artifact — callouts, badges, reference cards,
comparison cards, phase lists, flow lanes, panels, key boxes, legend, custom lists — and a
**decision matrix** of when to use each in
[`references/ui-elements.md`](skills/rendering-markdown-to-pdf/references/ui-elements.md).
Any 2-column table auto-renders as reference cards.

### Requirements
- **Node ≥ 18**
- **A local Chrome / Chromium / Edge** (auto-detected; or set `CHROME_PATH`).
  `puppeteer-core` ships no browser of its own, so install is small.
- **poppler** (`brew install poppler`) is optional — only for rasterizing pages to preview
  the result while iterating.

The `marked`/`mermaid` libraries download themselves into `scripts/vendor/` on first run; the
designed theme also fetches its fonts from Google Fonts at render time.

## Authoring for the designed theme

Plain-Markdown-compatible conventions, all optional:

```yaml
---
title: My Guide
subtitle: One line under the title.
eyebrow: Engineering spec · 2026-09-10
author: Andrew Leach
status: Approved
version: 1.0
chips: [Extra · one, Another]
---
```

- **Callouts:** `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`, `> [!CAUTION]`
- **Badges:** `[[New]]`, `[[accent:New]]`, `[[positive:Stable]]`, `[[warning:Beta]]`, `[[negative:Old]]`
- **Eyebrow above a heading:** `<!-- eyebrow: The headline -->`
- **Diagram card title/caption:** `<!-- figure: Title | Caption -->` before a ```mermaid fence

See [`skills/rendering-markdown-to-pdf/SKILL.md`](skills/rendering-markdown-to-pdf/SKILL.md)
for the full workflow and [the troubleshooting notes](skills/rendering-markdown-to-pdf/references/troubleshooting.md)
for design rationale and gotchas.

## License

MIT © Andrew Leach
