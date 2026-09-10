// Pre-render pass that turns each CodeBlock marker into syntax-highlighted static HTML with
// Shiki, at generation time. It is a whole-body Pass (the uniform pre-render shape): it finds
// every `<div data-code data-code-lang=…>…</div>` marker, highlights the (HTML-escaped) source
// inside, and swaps the marker for Shiki's `<pre>`. Browserless — it ignores ctx.chrome.

import { getHighlighter, type Highlighter } from 'shiki';
import type { Pass } from './html.js';

/** The Shiki themes we render into, one per doc theme. */
const THEME = { light: 'github-light', dark: 'github-dark' } as const;

/** Languages loaded up front; common aliases (`ts`, `js`, `sh`) resolve against these. */
const LANGS = ['typescript', 'javascript', 'tsx', 'jsx', 'json', 'bash', 'html', 'css', 'markdown'];

/** Matches a CodeBlock marker; `data-code` may be bare or `=""` (React emits the latter). */
const MARKER = /<div data-code(?:="")? data-code-lang="([^"]*)">([\s\S]*?)<\/div>/g;

let highlighterPromise: Promise<Highlighter> | null = null;
function getShiki(): Promise<Highlighter> {
  highlighterPromise ??= getHighlighter({ themes: [THEME.light, THEME.dark], langs: LANGS });
  return highlighterPromise;
}

/** Reverse the HTML escaping `renderToStaticMarkup` applied to the source inside the marker. */
function unescape(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(?:39|x27);/g, "'")
    .replace(/&amp;/g, '&');
}

/** Highlight one snippet to a `<pre>…spans…</pre>`; unknown languages fall back to plain text. */
async function highlight(code: string, lang: string, theme: 'light' | 'dark'): Promise<string> {
  const hl = await getShiki();
  const known = new Set(hl.getLoadedLanguages());
  const useLang = known.has(lang) ? lang : 'text';
  return hl.codeToHtml(code, { lang: useLang, theme: THEME[theme] });
}

export const prerenderCode: Pass = async (bodyHtml, theme) => {
  const matches = [...bodyHtml.matchAll(MARKER)];
  if (matches.length === 0) return bodyHtml;

  let out = bodyHtml;
  for (const m of matches) {
    const [marker, lang, escaped] = m;
    const pre = await highlight(unescape(escaped), lang, theme);
    // Replace via a function so `$`-sequences in the highlighted HTML (e.g. `${}` in the source)
    // are inserted literally, not treated as replacement patterns.
    out = out.replace(marker, () => pre);
  }
  return out;
};
