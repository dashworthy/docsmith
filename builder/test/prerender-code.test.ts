import { describe, it, expect } from 'vitest';
import { prerenderCode } from '../src/generate/prerenderCode.js';

describe('prerenderCode', () => {
  it('replaces a data-code marker with Shiki-highlighted <pre>', async () => {
    const out = await prerenderCode(
      '<div data-code data-code-lang="ts">const x = 1</div>',
      'dark',
      { chrome: null },
    );
    expect(out).toContain('<pre');
    expect(out).toContain('style="color:'); // Shiki inline-styles the token spans
    expect(out).not.toContain('data-code'); // marker consumed
  });

  it('unescapes the source before highlighting', async () => {
    const out = await prerenderCode(
      '<div data-code data-code-lang="ts">const a = b &lt; c</div>',
      'light',
      { chrome: null },
    );
    // The `<` must reach Shiki as a real less-than (then re-escaped by Shiki, as `&lt;` or the
    // hex `&#x3C;`), not stay the literal text `&lt;` — which would double-escape to `&amp;lt;`.
    expect(out).toMatch(/&lt;|&#x3[cC];/);
    expect(out).not.toContain('&amp;lt;');
  });

  it('leaves body HTML without markers unchanged', async () => {
    const body = '<main><p>no code here</p></main>';
    expect(await prerenderCode(body, 'dark', { chrome: null })).toBe(body);
  });
});
