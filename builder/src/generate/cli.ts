// The generator: turns a hand-written JSX doc module into a standalone HTML file, and — for the
// pdf format — prints that HTML to PDF with headless Chrome.
//
// A doc module default-exports the document's root React element and may export a `title` string.
// generate() renders it to static markup, runs the pre-render passes uniformly (each a whole-body
// Pass owning its own marker loop — code highlighting, then diagram rendering), inlines the built
// Tailwind CSS via the skeleton assembler, and writes the output.

import { renderToStaticMarkup } from 'react-dom/server';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { ReactElement } from 'react';
import { assembleHtml, type Pass, type PassCtx } from './html.js';
import { buildTailwindCss } from './tailwind.js';
import { findChrome } from './chrome.js';
import { renderPdf } from './pdf.js';
import { prerenderCode } from './prerenderCode.js';
import { prerenderMermaid } from './prerenderMermaid.js';

/**
 * The ordered pre-render passes. Each finds its own markers in the body HTML and swaps in static
 * content; the generator composes them uniformly and never contains a pass's own find-and-replace
 * logic. Code highlighting runs first (browserless), then diagram rendering (uses the shared
 * Chrome via ctx).
 */
const PASSES: Pass[] = [prerenderCode, prerenderMermaid];

export interface GenerateOptions {
  /** Path to the doc module (`.tsx`), resolved against the current working directory. */
  docModule: string;
  /** Theme baked into the output. */
  theme: 'light' | 'dark';
  /** Output format: a standalone `.html`, or a `.pdf` printed from that HTML. */
  format: 'html' | 'pdf';
  /** Output file path. */
  out: string;
}

export async function generate(opts: GenerateOptions): Promise<void> {
  const mod = await import(pathToFileURL(resolve(opts.docModule)).href);
  const root = mod.default as ReactElement;
  const title = typeof mod.title === 'string' ? (mod.title as string) : 'Document';

  const ctx: PassCtx = { chrome: findChrome() };
  const rendered = renderToStaticMarkup(root);
  const bodyHtml = await PASSES.reduce<Promise<string>>(
    async (acc, pass) => pass(await acc, opts.theme, ctx),
    Promise.resolve(rendered),
  );

  const tailwindCss = await buildTailwindCss();
  const html = assembleHtml({ bodyHtml, theme: opts.theme, tailwindCss, title });

  if (opts.format === 'html') {
    writeFileSync(opts.out, html);
    return;
  }

  // pdf — requires Chrome; fail loudly with an actionable message rather than deref a null.
  if (!ctx.chrome) {
    throw new Error(
      'Cannot render PDF: no Chrome/Chromium found. Set CHROME_PATH or PUPPETEER_EXECUTABLE_PATH ' +
        'to a Chromium-family executable, or use --format html.',
    );
  }
  const dir = mkdtempSync(join(tmpdir(), 'rdb-doc-'));
  try {
    const htmlPath = join(dir, 'doc.html');
    writeFileSync(htmlPath, html);
    await renderPdf(htmlPath, opts.out, ctx.chrome);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const USAGE =
  'usage: node --import tsx src/generate/cli.ts <doc.tsx> --theme light|dark --format html|pdf --out <path>';

/**
 * Minimal `--flag value` parser for the CLI entry. A misspelled flag *value* (e.g. `--format pfd`)
 * is rejected with a clear error rather than silently coerced to a default — otherwise a user who
 * asked for a PDF would get HTML and never be told.
 */
export function parseArgs(argv: string[]): GenerateOptions {
  const positional: string[] = [];
  const flags: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) flags[a.slice(2)] = argv[++i];
    else positional.push(a);
  }
  const docModule = positional[0];
  const out = flags.out;
  if (!docModule || !out) throw new Error(USAGE);

  const theme = flags.theme ?? 'light';
  if (theme !== 'light' && theme !== 'dark') {
    throw new Error(`--theme must be "light" or "dark" (got "${theme}")`);
  }
  const format = flags.format ?? 'html';
  if (format !== 'html' && format !== 'pdf') {
    throw new Error(`--format must be "html" or "pdf" (got "${format}")`);
  }
  return { docModule, theme, format, out };
}

// CLI entry — runs only when invoked directly, not when imported by a test.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  generate(parseArgs(process.argv.slice(2))).catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
