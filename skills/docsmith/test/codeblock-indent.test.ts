import { describe, expect, it } from 'vitest';
import { preserveIndent } from '../src/pdf/components/CodeBlock.js';

// react-pdf collapses the leading whitespace of a <Text>, so code indentation is lost unless the
// leading run is converted to non-breaking spaces. preserveIndent does exactly that, per line.
const NBSP = '\u00A0';
const t = (content: string, color = '#000000') => ({ content, color });
const text = (line: { content: string; color: string }[]): string => line.map((x) => x.content).join('');

describe('preserveIndent', () => {
  it('converts leading spaces to non-breaking spaces (react-pdf collapses ordinary ones)', () => {
    const out = preserveIndent([t('    "a": 1')]);
    expect(text(out)).toBe(`${NBSP}${NBSP}${NBSP}${NBSP}"a": 1`);
  });

  it('leaves interior spaces ordinary so long lines can still wrap', () => {
    const out = preserveIndent([t('  "a": 1, "b": 2')]);
    expect(text(out)).toBe(`${NBSP}${NBSP}"a": 1, "b": 2`);
  });

  it('handles indentation split across leading whitespace-only tokens', () => {
    const out = preserveIndent([t('  '), t('"k"', '#0000ff'), t(': 1')]);
    expect(out[0].content).toBe(`${NBSP}${NBSP}`);
    expect(out[1]).toEqual(t('"k"', '#0000ff'));
    expect(text(out)).toBe(`${NBSP}${NBSP}"k": 1`);
  });

  it('keeps token colors intact', () => {
    const out = preserveIndent([t('  ', '#111111'), t('x', '#222222')]);
    expect(out.map((o) => o.color)).toEqual(['#111111', '#222222']);
  });

  it('leaves a line with no leading whitespace unchanged', () => {
    const line = [t('{', '#333333')];
    expect(preserveIndent(line)).toEqual(line);
  });
});
