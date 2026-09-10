import { describe, it, expect } from 'vitest';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generate } from '../src/generate/cli.js';
import { findChrome } from '../src/generate/chrome.js';

const tmp = mkdtempSync(join(tmpdir(), 'rdb-gen-'));

describe('generate — HTML', () => {
  it('writes a standalone HTML file for the demo in the chosen theme', async () => {
    const out = join(tmp, 'demo-dark.html');
    await generate({ docModule: 'src/docs/demo.tsx', theme: 'dark', format: 'html', out });
    const html = readFileSync(out, 'utf8');
    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(html).toContain('data-theme="dark"');
    expect(html).toContain('Harvest'); // demo cover title
    expect(html).not.toContain('<script'); // no runtime JS in output
  }, 60000);
});

describe('generate — PDF', () => {
  it('prints a PDF whose first bytes are %PDF', async (ctx) => {
    if (!findChrome()) {
      ctx.skip(); // reported as skipped, not passed, on a Chrome-less runner
      return;
    }
    const out = join(tmp, 'demo-light.pdf');
    await generate({ docModule: 'src/docs/demo.tsx', theme: 'light', format: 'pdf', out });
    const head = readFileSync(out).subarray(0, 4).toString('latin1');
    expect(head).toBe('%PDF');
  }, 120000);
});
