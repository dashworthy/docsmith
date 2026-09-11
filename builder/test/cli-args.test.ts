import { describe, it, expect, vi } from 'vitest';

// Force the "no Chrome" state so the PDF branch's loud-failure guard can be exercised on any
// runner, regardless of whether a real browser is installed.
vi.mock('../src/generate/chrome.js', () => ({ findChrome: () => null }));

import { parseArgs, generate } from '../src/generate/cli.js';

describe('parseArgs', () => {
  it('parses the doc, theme, format and out', () => {
    expect(
      parseArgs(['src/docs/demo.tsx', '--theme', 'dark', '--format', 'pdf', '--out', 'x.pdf']),
    ).toEqual({ docModule: 'src/docs/demo.tsx', theme: 'dark', format: 'pdf', out: 'x.pdf' });
  });

  it('defaults theme to light and format to html', () => {
    const p = parseArgs(['d.tsx', '--out', 'o.html']);
    expect(p.theme).toBe('light');
    expect(p.format).toBe('html');
  });

  it('rejects a misspelled --format value instead of coercing it', () => {
    expect(() => parseArgs(['d.tsx', '--out', 'o', '--format', 'pfd'])).toThrow(/--format/);
  });

  it('rejects a misspelled --theme value', () => {
    expect(() => parseArgs(['d.tsx', '--out', 'o', '--theme', 'drak'])).toThrow(/--theme/);
  });

  it('requires the doc module and --out', () => {
    expect(() => parseArgs(['--out', 'o'])).toThrow(/usage/);
    expect(() => parseArgs(['d.tsx'])).toThrow(/usage/);
  });
});

describe('generate — PDF without Chrome', () => {
  it('fails loudly with an actionable message', async () => {
    await expect(
      generate({ docModule: 'src/docs/demo.tsx', theme: 'light', format: 'pdf', out: '/tmp/never.pdf' }),
    ).rejects.toThrow(/no Chrome\/Chromium found/);
  });
});
