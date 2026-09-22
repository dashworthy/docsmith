import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// The render wrapper is exercised through its REAL entrypoint — `node --import tsx render.ts <run-dir>` —
// as a subprocess, not by calling renderRun() under vitest. The seam being proved is Node+tsx rendering
// an authored doc that lives OUTSIDE the package and imports the bare `@docsmith/docsmith`: the wrapper
// stages the doc inside the package's src tree so that import self-references via `exports` and react-pdf
// resolves correctly. vitest's own resolver would not reproduce that path faithfully, so the test drives
// the true runtime path end to end.

const run = promisify(execFile);
const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..'); // test/pdf/ -> skills/docsmith
const RENDER = resolve(PKG_ROOT, 'src/pdf/render.ts');

// A .docsmith/<run>/pdf.tsx that imports the builder by the bare specifier the wrapper must resolve.
const DOC = `import { PdfDoc, Cover } from '@docsmith/docsmith';
export default (theme) => (
  <PdfDoc theme={theme} title="t">
    <Cover eyebrow="e" title="t" />
  </PdfDoc>
);
`;

async function renderCli(runDir: string) {
  return run('node', ['--import', 'tsx', RENDER, runDir], { cwd: PKG_ROOT });
}

async function startsWithPdfMagic(path: string): Promise<boolean> {
  const head = (await readFile(path)).subarray(0, 5).toString('latin1');
  return head.startsWith('%PDF');
}

describe('renderRun (render <run-dir> wrapper)', () => {
  let root: string; // stands in for a project root holding .docsmith/
  beforeAll(async () => {
    root = await mkdtemp(resolve(tmpdir(), 'docsmith-render-'));
  });
  afterAll(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('renders <run-dir>/pdf.tsx to pdf-light.pdf and pdf-dark.pdf', async () => {
    const runDir = resolve(root, '.docsmith', '2026-09-14-fixture');
    await mkdir(runDir, { recursive: true });
    await writeFile(resolve(runDir, 'pdf.tsx'), DOC);

    await renderCli(runDir);

    expect(await startsWithPdfMagic(resolve(runDir, 'pdf-light.pdf'))).toBe(true);
    expect(await startsWithPdfMagic(resolve(runDir, 'pdf-dark.pdf'))).toBe(true);

    // The wrapper stages a temp copy under the package's src/docs to render it; a leak there would
    // litter the tracked source tree, so the finally-cleanup is load-bearing and must leave nothing.
    const staged = (await readdir(resolve(PKG_ROOT, 'src/docs'))).filter((f) => f.startsWith('__render_'));
    expect(staged).toEqual([]);
  }, 60_000);

  it('fails with a clear error when the run dir has no pdf.tsx', async () => {
    const runDir = resolve(root, '.docsmith', 'empty-run');
    await mkdir(runDir, { recursive: true });

    await expect(renderCli(runDir)).rejects.toMatchObject({
      stderr: expect.stringContaining('pdf.tsx'),
    });
  }, 30_000);
});
