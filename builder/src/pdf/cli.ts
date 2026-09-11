// The react-pdf generator entry. A PDF doc module default-exports a builder function
// `(theme) => <PdfDoc …>`, so one authored document renders in either theme. This mirrors the
// HTML path's cli.ts but produces a PDF directly from the react-pdf primitive tree — no HTML, no
// browser print.

import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { ReactElement } from 'react';
import { renderPdfToFile } from './renderPdf.js';
import type { PdfTheme } from './theme.js';

export interface PdfGenerateOptions {
  /** Path to the PDF doc module (`.pdf.tsx`), resolved against the cwd. */
  docModule: string;
  /** Theme baked into the output. */
  theme: PdfTheme;
  /** Output `.pdf` path. */
  out: string;
}

// A doc builder may be async — the react-pdf path pre-computes Shiki tokens and rasterized mermaid
// images before render, since react-pdf itself renders synchronously.
type DocBuilder = (theme: PdfTheme) => ReactElement | Promise<ReactElement>;

export async function generatePdf(opts: PdfGenerateOptions): Promise<void> {
  const mod = await import(pathToFileURL(resolve(opts.docModule)).href);
  const build = mod.default as DocBuilder | ReactElement;
  const element = await (typeof build === 'function' ? build(opts.theme) : build);
  await renderPdfToFile(element, opts.out);
}

const USAGE = 'usage: node --import tsx src/pdf/cli.ts <doc.pdf.tsx> --theme light|dark --out <path>';

export function parsePdfArgs(argv: string[]): PdfGenerateOptions {
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
  return { docModule, theme, out };
}

// CLI entry — runs only when invoked directly.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  generatePdf(parsePdfArgs(process.argv.slice(2))).catch((err) => {
    console.error(err instanceof Error ? err.stack ?? err.message : err);
    process.exit(1);
  });
}
