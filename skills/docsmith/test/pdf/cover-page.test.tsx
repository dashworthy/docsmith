import { describe, it, expect } from 'vitest';
import type { ReactElement } from 'react';
import TestRenderer from 'react-test-renderer';
import { createTw } from 'react-pdf-tailwind';
import { FONT, shadcnConfig, TwProvider } from '../../src/pdf/theme.js';
import { CoverPage } from '../../src/pdf/components/CoverPage.js';

const tw = createTw(shadcnConfig('light'));

function flat(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) return Object.assign({}, ...style.map(flat));
  return (style ?? {}) as Record<string, unknown>;
}

function paint(node: ReactElement) {
  const tree = TestRenderer.create(<TwProvider value={tw}>{node}</TwProvider>).toJSON() as any;
  const colors = new Set<unknown>();
  const bgs = new Set<unknown>();
  const fonts = new Set<unknown>();
  const texts: string[] = [];
  const walk = (n: any) => {
    if (typeof n === 'string') return texts.push(n);
    if (!n || typeof n !== 'object') return;
    const s = flat(n.props?.style);
    if (s.color) colors.add(s.color);
    if (s.backgroundColor) bgs.add(s.backgroundColor);
    if (s.fontFamily) fonts.add(s.fontFamily);
    (n.children ?? []).forEach(walk);
  };
  (Array.isArray(tree) ? tree : [tree]).forEach(walk);
  return { colors, bgs, fonts, text: texts.join(' ') };
}

describe('CoverPage (elaborate title page)', () => {
  const p = paint(
    <CoverPage
      eyebrow="kicker"
      title="Title"
      subtitle="Sub"
      tags={['a', 'b']}
      meta={[{ label: 'Author', value: 'AL' }, { label: 'Version', value: '0.2.0' }]}
    />,
  );

  it('hero takes the accent soft tint with a role-ink eyebrow + display title', () => {
    expect(p.bgs.has(tw('bg-brand-soft').backgroundColor)).toBe(true); // hero tint (default accent)
    expect(p.colors.has(tw('text-brand-ink').color)).toBe(true); // eyebrow ink
    expect(p.fonts.has(FONT.display)).toBe(true); // big title
    expect(p.fonts.has(FONT.mono)).toBe(true); // mono eyebrow + meta labels
  });

  it('renders tags, the metadata strip, and its values', () => {
    expect(p.bgs.has(tw('bg-card').backgroundColor)).toBe(true); // tag chips + meta strip surface
    expect(p.text).toContain('Author');
    expect(p.text).toContain('AL');
    expect(p.text).toContain('0.2.0');
  });

  it('swaps the accent role (positive → emerald hero)', () => {
    const q = paint(<CoverPage eyebrow="k" title="T" accent="positive" />);
    expect(q.bgs.has(tw('bg-pos-soft').backgroundColor)).toBe(true);
    expect(q.colors.has(tw('text-pos-ink').color)).toBe(true);
  });
});
