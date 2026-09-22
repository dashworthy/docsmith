// Code highlighting for the react-pdf path. The HTML path lets Shiki emit a styled `<pre>`; here
// react-pdf can't render that HTML, so we ask Shiki for the raw *tokens* (content + color per span)
// and hand them to the CodeBlock component, which lays each line out as react-pdf <Text> runs. This
// is the same highlighter/themes as the HTML path — only the output shape differs.

import { getHighlighter, type Highlighter } from 'shiki';
import type { PdfTheme } from './theme.js';

const THEME = { light: 'github-light', dark: 'github-dark' } as const;
const LANGS = [
  'typescript', 'javascript', 'tsx', 'jsx', 'json', 'bash', 'html', 'css', 'markdown',
  'php', 'yaml',
];

/** One highlighted span: its text and hex color. */
export interface CodeToken {
  content: string;
  color: string;
}

/** A tokenized snippet ready for react-pdf: lines of colored spans plus the theme's bg/fg. */
export interface HighlightedCode {
  lines: CodeToken[][];
  bg: string;
  fg: string;
}

let highlighterPromise: Promise<Highlighter> | null = null;
function getShiki(): Promise<Highlighter> {
  highlighterPromise ??= getHighlighter({ themes: [THEME.light, THEME.dark], langs: LANGS });
  return highlighterPromise;
}

/** Tokenize a snippet into colored spans; unknown languages fall back to plain text. */
export async function highlightCode(code: string, lang: string, theme: PdfTheme): Promise<HighlightedCode> {
  const hl = await getShiki();
  const themeName = THEME[theme];
  const known = new Set(hl.getLoadedLanguages());
  const useLang = known.has(lang) ? lang : 'text';
  const { bg, fg } = hl.getTheme(themeName);
  // useLang is validated against the loaded set above; Shiki's param type is a literal union.
  const tokenLines = hl.codeToTokensBase(code, { lang: useLang as never, theme: themeName });
  const lines = tokenLines.map((line) =>
    line.map((tok) => ({ content: tok.content, color: tok.color ?? fg })),
  );
  return { lines, bg, fg };
}
