import { describe, it, expect } from 'vitest';
import { unescapeHtml, escapeHtml } from '../src/generate/htmlEntities.js';

describe('unescapeHtml', () => {
  it('reverses the entities renderToStaticMarkup emits', () => {
    expect(unescapeHtml('a &lt; b &gt; c')).toBe('a < b > c');
    expect(unescapeHtml('say &quot;hi&quot;')).toBe('say "hi"');
    expect(unescapeHtml('it&#39;s')).toBe("it's");
    expect(unescapeHtml('it&#x27;s')).toBe("it's");
    expect(unescapeHtml('a &amp; b')).toBe('a & b');
  });

  it('undoes &amp; last so a double-escaped entity survives one level', () => {
    // React escapes a literal `&lt;` in source to `&amp;lt;`; one unescape pass must yield `&lt;`,
    // not `<`, or the round-trip would corrupt code that literally contains an entity.
    expect(unescapeHtml('&amp;lt;')).toBe('&lt;');
  });
});

describe('escapeHtml', () => {
  it('escapes the markup-significant characters', () => {
    expect(escapeHtml('<b>')).toBe('&lt;b&gt;');
    expect(escapeHtml('a & b')).toBe('a &amp; b');
    expect(escapeHtml('say "hi"')).toBe('say &quot;hi&quot;');
  });

  it('escapes & first so introduced entities are not double-escaped', () => {
    expect(escapeHtml('a < b')).toBe('a &lt; b');
    expect(escapeHtml('&amp;')).toBe('&amp;amp;');
  });
});
