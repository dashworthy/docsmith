import { describe, it, expect } from 'vitest';
import { prerenderMermaid } from '../src/generate/prerenderMermaid.js';
import { findChrome } from '../src/generate/chrome.js';
import { PALETTE } from '../src/theme/palette.js';

describe('prerenderMermaid', () => {
  it('renders each marker to a recolored inline SVG', async (ctx) => {
    const chrome = findChrome();
    if (!chrome) {
      ctx.skip();
      return;
    }
    const body = '<div data-mermaid>flowchart LR\n  A[Process] --> B[(Store)]</div>';
    const out = await prerenderMermaid(body, 'dark', { chrome });
    expect(out).toContain('<svg');
    expect(out).not.toContain('data-mermaid'); // marker consumed
    // Assert the per-shape recolor's OWN signature — the `stroke-width:1.4px` declaration and the
    // exact fill+stroke pair it writes onto each shape's .label-container. This is what the recolor
    // loop produces and mermaid's own themeVariables do not, so deleting the loop fails the test
    // (whereas a bare "does accentSoft appear?" check would still pass, since themeVariables inject
    // it into the SVG's <style> regardless).
    const rect = `fill:${PALETTE.dark.accentSoft};stroke:${PALETTE.dark.accent};stroke-width:1.4px`;
    const cyl = `fill:${PALETTE.dark.positiveSoft};stroke:${PALETTE.dark.positive};stroke-width:1.4px`;
    expect(out).toContain(rect); // process rectangle → accent role
    expect(out).toContain(cyl); // datastore cylinder → positive role
  }, 120000);

  it('leaves a body without markers unchanged (no browser needed)', async () => {
    const body = '<p>no diagram</p>';
    expect(await prerenderMermaid(body, 'dark', { chrome: null })).toBe(body);
  });

  it('fails loudly when a marker exists but no Chrome is available', async () => {
    await expect(
      prerenderMermaid('<div data-mermaid>flowchart LR\n A-->B</div>', 'dark', { chrome: null }),
    ).rejects.toThrow(/no Chrome/i);
  });
});
