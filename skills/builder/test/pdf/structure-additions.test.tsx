import { describe, it, expect } from 'vitest';
import type { ReactElement } from 'react';
import TestRenderer from 'react-test-renderer';
import { createTw } from 'react-pdf-tailwind';
import { FONT, TYPE, shadcnConfig, TwProvider } from '../../src/pdf/theme.js';
import { Subhead } from '../../src/pdf/components/Subhead.js';
import { Toc } from '../../src/pdf/components/Toc.js';

const tw = createTw(shadcnConfig('light'));

function flat(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) return Object.assign({}, ...style.map(flat));
  return (style ?? {}) as Record<string, unknown>;
}

function paint(node: ReactElement) {
  const tree = TestRenderer.create(<TwProvider value={tw}>{node}</TwProvider>).toJSON() as any;
  const colors = new Set<unknown>();
  const fonts = new Set<unknown>();
  const sizes = new Set<unknown>();
  const borderStyles = new Set<unknown>();
  const texts: string[] = [];
  const walk = (n: any) => {
    if (typeof n === 'string') return texts.push(n);
    if (!n || typeof n !== 'object') return;
    const s = flat(n.props?.style);
    if (s.color) colors.add(s.color);
    if (s.fontFamily) fonts.add(s.fontFamily);
    if (typeof s.fontSize === 'number') sizes.add(s.fontSize);
    if (s.borderStyle) borderStyles.add(s.borderStyle);
    (n.children ?? []).forEach(walk);
  };
  (Array.isArray(tree) ? tree : [tree]).forEach(walk);
  return { colors, fonts, sizes, borderStyles, text: texts.join(' ') };
}

describe('Subhead (subsection heading)', () => {
  it('renders a display title at the subhead size with the foreground ink', () => {
    const p = paint(<Subhead title="Rollout stages" />);
    expect(p.fonts.has(FONT.display)).toBe(true);
    expect(p.sizes.has(TYPE.subhead)).toBe(true);
    expect(p.colors.has(tw('text-foreground').color)).toBe(true);
    expect(p.text).toContain('Rollout stages');
  });
  it('omits the rule when rule={false} and shows the deck when given', () => {
    const withRule = paint(<Subhead title="A" />);
    expect(withRule.text).toContain('A');
    const noRule = paint(<Subhead title="A" rule={false} deck="supporting" />);
    expect(noRule.text).toContain('supporting');
  });
});

describe('Toc (table of contents)', () => {
  const p = paint(
    <Toc items={[{ title: 'Intro', page: 2 }, { title: 'Sub', page: 3, level: 1 }]} />,
  );
  it('draws dotted leaders and mono page numbers', () => {
    expect(p.borderStyles.has('dotted')).toBe(true); // leader
    expect(p.fonts.has(FONT.mono)).toBe(true); // page numbers + heading
    expect(p.text).toContain('Intro');
    expect(p.text).toContain('2');
  });
  it('top-level page numbers take the brand ink; sub-entries the muted ink', () => {
    expect(p.colors.has(tw('text-brand-ink').color)).toBe(true); // top-level page number
    expect(p.colors.has(tw('text-fg-muted').color)).toBe(true); // sub-entry
  });
});
