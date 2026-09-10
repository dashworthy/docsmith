---
name: rendering-markdown-to-pdf
description: Convert a Markdown document into a polished, print-ready PDF — a "designed" theme with web fonts, design tokens, a cover page, admonition callouts, badges and styled tables, plus mermaid diagrams rendered as vector "cards" with nothing running off the page. Use when asked to make a PDF from a README or Markdown doc, export documentation to PDF, produce a nicely designed/branded doc, or render a doc whose ```mermaid diagrams must appear as real diagrams.
---

# Rendering Markdown to PDF

Turns a `.md` file into an A4 PDF that looks designed: real (vector) mermaid diagrams in
titled cards, a token-based visual system with IBM Plex / Familjen Grotesk fonts, a cover
page from frontmatter, admonition callouts, inline badges, and styled tables — with nothing
overflowing the page and no browser header/footer. A bundled Node script does the work; your
job is to run it, then **look at the result** and iterate.

## How it works (one line)

The script renders the markdown + mermaid in headless Chrome and prints to PDF — mermaid
runs client-side, so diagrams come out as selectable vector art, not images.

## One-time setup

1. **Node ≥ 18** — `node -v`.
2. **A local Chrome/Chromium** — auto-detected (Chrome, Chromium, Edge; macOS/Linux/Windows).
   If yours is elsewhere, set `CHROME_PATH` to the executable.
3. **puppeteer-core** — install once, into the script's own folder:
   ```bash
   npm install --prefix "<skill>/scripts"
   ```
The mermaid/marked libraries download themselves into `scripts/vendor/` on first run; the
`designed` theme also fetches its fonts from Google Fonts at render time (needs network).

## Convert

```bash
node "<skill>/scripts/md2pdf.mjs" path/to/README.md            # → path/to/README.pdf (designed)
node "<skill>/scripts/md2pdf.mjs" README.md out.pdf --accent green
```

| Flag | Meaning | Default |
|---|---|---|
| `--design <designed\|plain>` | Full design system, or a minimal system-font look | `designed` |
| `--mode <dark\|light>` | Palette for the designed theme (both full-bleed) | `dark` |
| `--accent <blue\|green\|slate\|purple>` | Accent for tokens, tables, badges, diagram cards | `blue` |
| `--theme <default\|neutral\|forest\|dark\|base>` | Mermaid diagram theme (auto-`dark` in dark mode) | `default` |
| `--no-cards` | Render diagrams plain (no title/caption/background card) | cards on |
| `--title "…"` | Document `<title>` | frontmatter title / filename |
| `--keep-html` | Also write the intermediate `.html` (debugging) | off |

The designed theme is **full-bleed** (no page border) and **token-driven**, so `--mode`
and `--accent` recolor everything — cover, callouts, badges, tables, cards, and components —
consistently. `--design plain` is a minimal light system-font look for a lightweight render.

## Authoring for the designed theme

All of these are plain-Markdown-compatible — they degrade to invisible comments or plain
text in a normal viewer, so they don't disturb the source doc.

- **Doc title section** — a YAML frontmatter block becomes an artifact-style hero: an accent
  top rule, the `eyebrow` as a kicker, the big title, the `subtitle` as a lede, freeform
  `chips`, and the structured fields (`author`/`version`/`status`/`date`/`reference`) as a
  label-over-value metadata row (an "Approved"-type `status` turns green):
  ```yaml
  ---
  title: My Guide
  subtitle: One line under the title.
  eyebrow: Engineering spec · 2026-09-10
  author: Andrew Leach
  status: Approved          # Approved/Done/Final → green chip
  version: 1.0
  reference: dashworthy/docsmith
  chips: [Extra · one, Another]
  ---
  ```
- **Callouts** — GitHub admonitions become left-bar cards with role tint + icon:
  `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`, `> [!CAUTION]`.
- **Badges** — inline pills: `[[Label]]` (neutral), `[[accent:New]]`, `[[positive:Stable]]`,
  `[[warning:Beta]]`, `[[negative:Deprecated]]`.
- **Section header** (the artifact pattern) — an accent **kicker** above the title and a
  muted **deck** line under it, wrapping any `##` heading:
  ```markdown
  <!-- eyebrow: Category by category -->
  ## Questions · Tasks · Tools · Bash
  <!-- deck: The four surfaces you asked to focus on, each read against the baseline. -->
  ```
  Either directive is optional; the kicker stays glued to its title across page breaks.
- **Diagram card title/caption** — on the line(s) before a ```mermaid fence:
  `<!-- figure: Data Model | The aggregate and its relationships -->` (either side optional),
  or `<!-- caption: … -->` to keep the auto title (`Figure N · <nearest heading>`).
- **Reference cards** — any **2-column** table auto-renders as a grid of cards (first column
  = mono title, second = body), which reads far better than a table with a long/monospace
  first column. Force a plain table with `<!-- table -->` on the line before it.

**Richer components** — comparison cards, phase lists, flow lanes, panels, key boxes, a tint
legend, custom lists, and a provenance footer — ship as token-driven CSS classes. Paste the
small HTML snippet inline in your Markdown (Chrome renders it; the theme styles it in both
modes). Every element, with a **decision matrix** of when to use each, is in
**[references/ui-elements.md](references/ui-elements.md)**; a full working example is
**[examples/gallery.md](examples/gallery.md)**.

## Verify — always look at the PDF

Do **not** claim success from the exit code alone. Rasterize and inspect:

```bash
pdftoppm -png -r 96 output.pdf /tmp/pg      # needs poppler: brew install poppler
```
Open the `/tmp/pg-*.png` pages (Read them if you are an agent) and check:

1. **Diagrams** render as diagrams (not code), fully inside their cards, nothing cut off.
2. **No overflow** — no table, code block, or diagram runs past the page edge.
3. **No large gaps** — a diagram card bumped whole to the next page is expected occasionally;
   a mostly-empty page is not.

Fix and re-run until all three hold. Judge a small-looking diagram by rasterizing that page
at `-r 300` and zooming — the PDF is vector, so it stays sharp. A diagram with bad syntax
aborts the run with `MERMAID_ERROR: …` naming it.

See **[references/troubleshooting.md](references/troubleshooting.md)** for Chrome discovery,
fonts/offline notes, the header/footer and page-fit rationale, and other gotchas.
