import { describe, it, expect } from 'vitest';
import type { ReactElement } from 'react';
import TestRenderer from 'react-test-renderer';
import { createTw } from 'react-pdf-tailwind';
import { Cover } from '../../src/pdf/components/Cover.js';
import { Section } from '../../src/pdf/components/Section.js';
import { Footer } from '../../src/pdf/components/Footer.js';
import { P } from '../../src/pdf/components/prose.js';
import { shadcnConfig, TwProvider } from '../../src/pdf/theme.js';

const tw = createTw(shadcnConfig('light'));

/** Merge a react-pdf style (object, or array of objects) into one object. */
function flat(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) return Object.assign({}, ...style.map(flat));
  return (style ?? {}) as Record<string, unknown>;
}

/** Every resolved `color`, `backgroundColor`, `borderColor` and `borderTopColor` in a subtree. */
function paint(node: ReactElement) {
  const tree = TestRenderer.create(<TwProvider value={tw}>{node}</TwProvider>).toJSON() as any;
  const colors = new Set<unknown>();
  const bgs = new Set<unknown>();
  const borders = new Set<unknown>();
  const walk = (n: any) => {
    if (!n || typeof n !== 'object') return;
    const s = flat(n.props?.style);
    if (s.color) colors.add(s.color);
    if (s.backgroundColor) bgs.add(s.backgroundColor);
    if (s.borderColor) borders.add(s.borderColor);
    if (s.borderTopColor) borders.add(s.borderTopColor);
    (n.children ?? []).forEach(walk);
  };
  (Array.isArray(tree) ? tree : [tree]).forEach(walk);
  return { colors, bgs, borders };
}

describe('Cover (ShadCN tokens)', () => {
  const p = paint(<Cover eyebrow="E" title="T" lede="L" chips={['a', 'b']} />);
  it('sits on a muted panel with a ShadCN border', () => {
    expect(p.bgs.has(tw('bg-muted').backgroundColor)).toBe(true);
    expect(p.borders.has(tw('border-border').borderColor)).toBe(true);
  });
  it('titles in foreground and mutes the eyebrow/lede', () => {
    expect(p.colors.has(tw('text-foreground').color)).toBe(true);
    expect(p.colors.has(tw('text-fg-muted').color)).toBe(true);
  });
  it('does not leak old palette hexes', () => {
    expect(p.bgs.has('#eef0f5')).toBe(false); // surface2
    expect(p.borders.has('#cdd3dc')).toBe(false); // borderStrong
  });
});

describe('Section (ShadCN tokens)', () => {
  const p = paint(
    <Section eyebrow="Cat" title="Title" deck="deck">
      <P>kids</P>
    </Section>,
  );
  it('titles in foreground, decks in muted, eyebrow in neutral grey (slate-500)', () => {
    expect(p.colors.has(tw('text-foreground').color)).toBe(true);
    expect(p.colors.has(tw('text-fg-muted').color)).toBe(true);
    expect(p.colors.has(tw('text-slate-500').color)).toBe(true); // neutral eyebrow
    expect(p.colors.has(tw('text-brand-ink').color)).toBe(false); // no longer indigo
  });
  it('does not leak the old bespoke accent hex', () => {
    expect(p.colors.has('#4b52d4')).toBe(false);
  });
});

describe('Footer (ShadCN tokens)', () => {
  const p = paint(<Footer lines={['gen from spec', 'ref x']} />);
  it('rules off with the ShadCN border and mutes the lines', () => {
    expect(p.borders.has(tw('border-border').borderColor)).toBe(true);
    expect(p.colors.has(tw('text-fg-muted').color)).toBe(true);
  });
  it('does not leak the old muted-ink hex', () => {
    expect(p.colors.has('#79828f')).toBe(false); // ink3
  });
});
