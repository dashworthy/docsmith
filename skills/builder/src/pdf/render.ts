// The `render <run-dir>` wrapper: one command over a `.docsmith/<run>/` working directory. It renders
// that dir's `pdf.tsx` to `pdf-light.pdf` + `pdf-dark.pdf` (both themes by default), reusing the
// per-theme `generatePdf` from cli.ts, and writes the outputs back into the run dir.
//
// Why it stages the doc inside the package. The authored `pdf.tsx` lives in the invoking project
// (`.docsmith/<run>/`), outside this package — but `node --import tsx` only applies the package's
// JSX runtime and module resolution to files under the tsconfig `include` (`src`/`test`); a doc
// rendered in place gets the classic JSX transform and mis-resolves react-pdf's transitive subpath
// exports. So the wrapper copies the doc to a temp file under `src/docs/` and renders it there, where
// the doc's bare `@docsmith/builder` import resolves by package self-reference (the `exports` field)
// and react-pdf lays out correctly. The staged copy is removed after each render. The authored file
// never moves and never learns where the package lives — it names the stable `@docsmith/builder`
// specifier and nothing else.

import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { access, copyFile, rm } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { generatePdf } from './cli.js';
import { parseTheme, type PdfTheme } from './theme.js';

// src/pdf/render.ts → package root is three levels up; docs dir is inside the tsconfig include.
const PACKAGE_ROOT = resolve(fileURLToPath(import.meta.url), '../../..');
const STAGE_DIR = resolve(PACKAGE_ROOT, 'src/docs');

const DEFAULT_THEMES: PdfTheme[] = ['light', 'dark'];

export interface RenderRunOptions {
  /** The `.docsmith/<run>/` working directory; must contain `pdf.tsx`. */
  runDir: string;
  /** Themes to render. Defaults to both. */
  themes?: PdfTheme[];
}

/**
 * Render a run directory's `pdf.tsx` to a themed PDF per theme. Returns the map of each rendered
 * theme to the `.pdf` path written (partial — only the themes actually rendered). Throws a clear
 * error if the run dir has no `pdf.tsx`.
 */
export async function renderRun(opts: RenderRunOptions): Promise<Partial<Record<PdfTheme, string>>> {
  const runDir = resolve(opts.runDir);
  const doc = resolve(runDir, 'pdf.tsx');
  try {
    await access(doc);
  } catch {
    throw new Error(`render: no pdf.tsx in ${runDir} — author the document there first`);
  }

  const themes = opts.themes ?? DEFAULT_THEMES;
  const staged = resolve(STAGE_DIR, `__render_${randomUUID()}.pdf.tsx`);
  const written: Partial<Record<PdfTheme, string>> = {};
  try {
    await copyFile(doc, staged);
    for (const theme of themes) {
      const out = resolve(runDir, `pdf-${theme}.pdf`);
      await generatePdf({ docModule: staged, theme, out });
      written[theme] = out;
    }
  } finally {
    await rm(staged, { force: true });
  }
  return written;
}

function parseRenderArgs(argv: string[]): RenderRunOptions {
  const positional: string[] = [];
  let theme: PdfTheme | undefined;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--theme') {
      theme = parseTheme(argv[++i]);
    } else {
      positional.push(a);
    }
  }
  const runDir = positional[0];
  if (!runDir) {
    throw new Error('usage: node --import tsx src/pdf/render.ts <run-dir> [--theme light|dark]');
  }
  return { runDir, themes: theme ? [theme] : undefined };
}

// CLI entry — runs only when invoked directly.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  renderRun(parseRenderArgs(process.argv.slice(2)))
    .then((written) => {
      for (const [theme, path] of Object.entries(written)) console.log(`${theme} → ${path}`);
    })
    .catch((err) => {
      console.error(err instanceof Error ? (err.stack ?? err.message) : err);
      process.exit(1);
    });
}
