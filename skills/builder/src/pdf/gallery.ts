// Manual-testing runner for the component gallery. Renders src/docs/gallery.pdf.tsx to
// gallery-light.pdf + gallery-dark.pdf at the package root, and optionally watches the component
// sources so a save re-renders instantly.
//
//   node --import tsx src/pdf/gallery.ts [--open] [--watch]
//   npm run gallery         # → --open
//   npm run gallery:watch   # → --watch --open
//
// Why it spawns a fresh child per render instead of calling generatePdf in-process: Node's ESM
// loader caches every imported module, so an in-process re-render would keep serving the *old*
// component code after you edit it. A fresh `node --import tsx` child re-imports everything, so
// what you see always reflects the file on disk. macOS Preview reloads an already-open PDF when the
// file changes, so watch mode opens the PDFs once and then only re-renders.

import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const HERE = dirname(fileURLToPath(import.meta.url)); // src/pdf
const PACKAGE_ROOT = resolve(HERE, '../..');
const CLI = resolve(HERE, 'cli.ts');
const DOC = resolve(PACKAGE_ROOT, 'src/docs/gallery.pdf.tsx');
const OUT: Record<'light' | 'dark', string> = {
  light: resolve(PACKAGE_ROOT, 'gallery-light.pdf'),
  dark: resolve(PACKAGE_ROOT, 'gallery-dark.pdf'),
};

// Directories whose changes should trigger a re-render in --watch mode.
const WATCH_DIRS = [resolve(HERE, 'components'), HERE, resolve(PACKAGE_ROOT, 'src/docs'), resolve(PACKAGE_ROOT, 'src/theme')];

function renderTheme(theme: 'light' | 'dark'): Promise<void> {
  return new Promise((res, rej) => {
    const child = spawn(
      process.execPath,
      ['--import', 'tsx', CLI, DOC, '--theme', theme, '--out', OUT[theme]],
      { stdio: 'inherit' },
    );
    child.on('exit', (code) =>
      code === 0 ? res() : rej(new Error(`gallery: ${theme} render failed (exit ${code})`)),
    );
    child.on('error', rej);
  });
}

async function renderOnce(): Promise<boolean> {
  const started = Date.now();
  try {
    await Promise.all([renderTheme('light'), renderTheme('dark')]);
    const secs = ((Date.now() - started) / 1000).toFixed(1);
    console.log(`gallery → ${OUT.light} + ${OUT.dark}  (${secs}s)`);
    return true;
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return false;
  }
}

function openPdfs(): void {
  // Best-effort open in the platform viewer; failure is non-fatal (e.g. headless CI).
  const opener =
    process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  for (const path of [OUT.light, OUT.dark]) {
    if (existsSync(path)) spawn(opener, [path], { stdio: 'ignore', detached: true, shell: process.platform === 'win32' }).unref();
  }
}

async function main(): Promise<void> {
  const args = new Set(process.argv.slice(2));
  const wantOpen = args.has('--open');
  const wantWatch = args.has('--watch');

  const ok = await renderOnce();
  if (ok && wantOpen) openPdfs();

  if (!wantWatch) {
    process.exit(ok ? 0 : 1);
  }

  console.log('gallery: watching for changes — edit a component and save. Ctrl+C to stop.');
  let timer: NodeJS.Timeout | null = null;
  const schedule = () => {
    if (timer) clearTimeout(timer);
    // Debounce: editors often fire several events per save.
    timer = setTimeout(() => {
      console.log('gallery: change detected, re-rendering…');
      void renderOnce();
    }, 150);
  };
  for (const dir of WATCH_DIRS) {
    if (existsSync(dir)) watch(dir, { recursive: true }, (_event, file) => {
      if (file && /\.tsx?$/.test(file)) schedule();
    });
  }
}

void main();
