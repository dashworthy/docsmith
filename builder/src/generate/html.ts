// The HTML skeleton assembler and the pre-render pass contract.
//
// `assembleHtml` wraps rendered body markup into one self-contained `<!doctype html>` document:
// the chosen theme stamped on `<html>`, the Google Fonts link, the generation-time theme style
// block, and the inlined Tailwind CSS. The output carries no `<script>` — diagrams and code are
// pre-rendered to static markup before they reach here, so the page runs no JS.

import { themeStyleBlock } from '../theme/tokens.js';
import { escapeHtml } from './htmlEntities.js';

/** The Google Fonts stylesheet URL for the three faces the palette declares. */
const FONTS_HREF =
  'https://fonts.googleapis.com/css2?' +
  'family=IBM+Plex+Sans:wght@400;500;600;700&' +
  'family=IBM+Plex+Mono:wght@400;500&' +
  'family=Familjen+Grotesk:wght@500;600;700&display=swap';

export interface SkeletonInput {
  /** The already-rendered document body (from `renderToStaticMarkup`, after pre-render passes). */
  bodyHtml: string;
  /** Which theme to bake in — decides `data-theme` and which palette the style block resolves to. */
  theme: 'light' | 'dark';
  /** The built Tailwind CSS, inlined so the file needs no external stylesheet. */
  tailwindCss: string;
  /** Document `<title>`. */
  title: string;
}

/**
 * Assemble a complete, standalone HTML document from rendered body markup. The result is the
 * single source of truth: the `.html` output is this string, and the PDF is printed from it.
 */
export function assembleHtml(i: SkeletonInput): string {
  return (
    '<!doctype html>' +
    `<html lang="en" data-theme="${i.theme}">` +
    '<head>' +
    '<meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    `<title>${escapeHtml(i.title)}</title>` +
    '<link rel="preconnect" href="https://fonts.googleapis.com">' +
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
    `<link rel="stylesheet" href="${FONTS_HREF}">` +
    themeStyleBlock() +
    `<style>${i.tailwindCss}</style>` +
    '</head>' +
    // A fixed, full-bleed ground layer sits behind everything. In paged media a fixed box repeats
    // on every printed page, so this paints the ground color across the whole sheet on every page —
    // including any empty space below the last page's content, which `<html>`/`<body>` backgrounds
    // alone can leave unpainted. With a zero `@page` margin the content box is the whole sheet, so
    // there is no white margin band to leak through. `aria-hidden` + `z-index:-1` keep it purely
    // decorative and behind the content.
    '<body>' +
    '<div aria-hidden="true" style="position:fixed;inset:0;background:var(--ground);z-index:-1"></div>' +
    i.bodyHtml +
    '</body>' +
    '</html>'
  );
}

/**
 * Context shared by every pre-render pass. `chrome` is the resolved browser executable path, or
 * null when none was found — a pass that needs Chrome (mermaid) checks it and fails loudly; a
 * pass that doesn't (code highlighting) ignores it.
 */
export type PassCtx = { chrome: string | null };

/**
 * A pre-render pass: a whole-body transform that finds its own markers in the rendered body HTML
 * and swaps in static content. Every pass has this same shape and owns its marker loop
 * internally, so the generator only composes a list of them — it never contains any pass's
 * find-and-replace choreography.
 */
export type Pass = (bodyHtml: string, theme: 'light' | 'dark', ctx: PassCtx) => Promise<string>;
