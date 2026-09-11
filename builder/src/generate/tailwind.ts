// Builds the project's Tailwind CSS by shelling the Tailwind CLI, which scans the `content` glob
// declared in tailwind.config.js (the components) and emits only the utilities they use. Returns
// the built stylesheet as a string so the generator can inline it into the HTML skeleton.

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);

/** builder/ project root — two levels up from src/generate/. */
const ROOT = fileURLToPath(new URL('../..', import.meta.url));

/** The npx launcher — `.cmd` shim on Windows, where execFile needs the real filename. */
const NPX = process.platform === 'win32' ? 'npx.cmd' : 'npx';

export async function buildTailwindCss(): Promise<string> {
  const dir = mkdtempSync(join(tmpdir(), 'rdb-tw-'));
  try {
    const outFile = join(dir, 'tailwind.css');
    await execFileAsync(
      NPX,
      ['tailwindcss', '-i', 'src/styles/input.css', '-o', outFile, '--minify'],
      { cwd: ROOT, maxBuffer: 32 * 1024 * 1024 },
    );
    return readFileSync(outFile, 'utf8');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
