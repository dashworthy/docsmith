# Troubleshooting & Design Notes

Details you need only when something misbehaves or you want to know why a choice was made.

## Contents
- Chrome / Chromium discovery
- "No Chrome found" / puppeteer errors
- Why no header/footer, and why vector (not images)
- Page-fit: why nothing runs off the page
- Diagram cards: sizing and page-break behaviour
- Math / LaTeX and HTML entities
- Fonts and emoji
- Pinned versions

## Chrome / Chromium discovery
The script tries, in order: `PUPPETEER_EXECUTABLE_PATH`, `CHROME_PATH`, then the standard
install paths for Google Chrome, Chromium, and Edge on macOS, Linux, and Windows. If none
exists it aborts. Point it at any Chromium-family browser:
```bash
CHROME_PATH="/path/to/chrome" node scripts/md2pdf.mjs doc.md
```
`puppeteer-core` deliberately ships **no** bundled browser — that is why a local Chrome is
required and why install is fast.

## "No Chrome found" / puppeteer errors
- `puppeteer-core is not installed` → `npm install --prefix "<skill>/scripts"`.
- Launch hangs or crashes in a container → the script already passes `--no-sandbox`; ensure
  the browser has a writable `$HOME` and the usual headless libs.
- Download of `marked`/`mermaid` fails on first run → you are offline; run once with network,
  or manually place the two files in `scripts/vendor/` (URLs are in `md2pdf.mjs`).

## Why no header/footer, and why vector (not images)
`page.pdf({ displayHeaderFooter: false })` removes Chrome's default date / title / URL /
page-number band. Rendering mermaid **in the page** (rather than pre-rendering to PNG) means
the diagrams land in the PDF as selectable, infinitely-crisp vector art. A diagram that looks
small in a low-DPI preview is still sharp when zoomed in the real PDF — verify legibility by
rasterizing that page at `-r 300`, not by trusting a 96-DPI thumbnail.

## Page-fit: why nothing runs off the page
Mermaid stamps a fixed pixel width/height on its `<svg>`. Left alone, a wide diagram (a big
ER diagram especially) overflows the printable width. The stylesheet forces
`max-width: 100% !important; width/height: auto !important` plus a `max-height`, so every
diagram scales down — preserving aspect ratio via its `viewBox` — to fit the page in both
dimensions. Tables use `overflow-wrap: anywhere` and flow across page breaks (filling pages)
while keeping each row intact; code blocks wrap instead of scrolling.

## Diagram cards: sizing and page-break behaviour
`max-height: 105mm` on the diagram keeps a tall figure compact so its whole card fits
alongside the surrounding text instead of being pushed to the next page and leaving a gap.
The card is `page-break-inside: avoid`, so it never splits across pages — the one accepted
cost is that a card occasionally jumps to the next page, leaving some space above it. If a
specific diagram needs to be larger, raise that value in `md2pdf.mjs` (`.mermaid svg`), but
watch for it overflowing the page height.

Card colours come from the `ACCENTS` map in `md2pdf.mjs`; add a preset there to introduce a
new `--accent` name. Each preset sets the header-band gradient, title text colour, border,
and the tinted dot-grid canvas behind the diagram.

## Math / LaTeX and HTML entities
The renderer does **not** typeset LaTeX — `$\rightarrow$` in the source would print
literally. If a doc uses inline math, convert those bits to Unicode (`→`, `≥`, `×`) in the
source, or add MathJax to the HTML template. HTML entities inside a mermaid label (e.g.
`&ge;`) are fine — mermaid renders them.

## Themes: designed vs plain, and dark vs light
`--design designed` (default) applies the full system — tokens, web fonts, cover page,
callouts, badges, styled tables, reference cards, and the component library. It has two
modes via `--mode`: **dark** (default) and **light**, both **full-bleed** (`@page { margin:0 }`
so the ground reaches the paper edge — no white border). `--design plain` is a minimal
light system-font look with the diagram cards but none of the rest; use it for a lightweight,
fully-offline render. Because the designed theme is full-bleed, continuation pages have no top
margin band by design; the ground color is continuous so this reads cleanly.

## Reference cards from 2-column tables
In the designed theme, a 2-column Markdown table is wrapped (in a pre-pass) into a `cards`
fenced block and rendered as a card grid — the first column becomes a monospace card title,
the second the body. This avoids the cramped, mid-word-hyphenated first column a narrow table
column produces for long class/API names. Force a real table with `<!-- table -->` on the line
before it. Escaped pipes (`\|`) inside cells are handled.

## Fonts and emoji
The **designed** theme loads IBM Plex Sans/Mono and Familjen Grotesk from Google Fonts at
render time (the script waits for `document.fonts.ready` before printing). That needs network
on every render; if you must render offline, either use `--design plain` or vendor the
`.woff2` files and swap the `<link>` in `md2pdf.mjs` for `@font-face` rules. The **plain**
theme uses the system UI/mono stack and fetches nothing. Emoji in headings (🌟, 🛠) render via
the OS emoji font in both.

## Callouts, badges, cover — only in the designed theme
Admonition callouts, inline badges, eyebrow kickers, and the frontmatter cover page are
designed-theme features. In `--design plain` the frontmatter is still stripped and diagram
cards still render, but callouts fall back to plain blockquotes and `[[badge]]` text is left
as-is. An eyebrow HTML block must be followed by a blank line (the script inserts one) or
marked absorbs the next paragraph/table into the raw HTML block.

## Pinned versions
`marked@12.0.2` and `mermaid@11.17.2` are pinned in `md2pdf.mjs` for reproducible output.
Bumping mermaid can change diagram layout — re-run the verify loop after any bump.
