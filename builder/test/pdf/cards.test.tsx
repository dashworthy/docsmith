import { describe, it, expect } from 'vitest';
import type { ReactElement } from 'react';
import TestRenderer from 'react-test-renderer';
import { createTw } from 'react-pdf-tailwind';
import { SourceCard } from '../../src/pdf/components/SourceCard.js';
import { PanelGrid, Panel } from '../../src/pdf/components/PanelGrid.js';
import { KeyBox } from '../../src/pdf/components/KeyBox.js';
import { shadcnConfig, TwProvider, TYPE } from '../../src/pdf/theme.js';

const tw = createTw(shadcnConfig('light'));

/** Merge a react-pdf style (object, or array of objects) into one object. */
function flat(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) return Object.assign({}, ...style.map(flat));
  return (style ?? {}) as Record<string, unknown>;
}

/** Every resolved paint property across a rendered subtree. */
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
    for (const key of ['borderColor', 'borderBottomColor', 'borderLeftColor']) {
      if (s[key]) borders.add(s[key]);
    }
    (n.children ?? []).forEach(walk);
  };
  (Array.isArray(tree) ? tree : [tree]).forEach(walk);
  return { colors, bgs, borders };
}

/** Every resolved `fontSize` across a rendered subtree. */
function sizes(node: ReactElement): Set<number> {
  const tree = TestRenderer.create(<TwProvider value={tw}>{node}</TwProvider>).toJSON() as any;
  const found = new Set<number>();
  const walk = (n: any) => {
    if (!n || typeof n !== 'object') return;
    const s = flat(n.props?.style);
    if (typeof s.fontSize === 'number') found.add(s.fontSize);
    (n.children ?? []).forEach(walk);
  };
  (Array.isArray(tree) ? tree : [tree]).forEach(walk);
  return found;
}

describe('SourceCard (ShadCN tokens)', () => {
  const p = paint(<SourceCard title="App\Render\Renderer">body</SourceCard>);
  it('uses a muted header band with a blue mono title over a muted body', () => {
    expect(p.bgs.has(tw('bg-muted').backgroundColor)).toBe(true);
    expect(p.colors.has(tw('text-brand-ink').color)).toBe(true);
    expect(p.colors.has(tw('text-fg-muted').color)).toBe(true);
  });
  it('does not leak old palette hexes', () => {
    expect(p.bgs.has('#eef0f5')).toBe(false); // surface2
    expect(p.colors.has('#4b52d4')).toBe(false); // accent
  });
});

describe('Panel (ShadCN tokens)', () => {
  const p = paint(
    <PanelGrid>
      <Panel title="Flow">body</Panel>
    </PanelGrid>,
  );
  it('is a card surface with a ShadCN border, foreground title, muted body', () => {
    expect(p.bgs.has(tw('bg-card').backgroundColor)).toBe(true);
    expect(p.borders.has(tw('border-border').borderColor)).toBe(true);
    expect(p.colors.has(tw('text-foreground').color)).toBe(true);
    expect(p.colors.has(tw('text-fg-muted').color)).toBe(true);
  });
  it('does not leak the old bespoke borderStrong hex', () => {
    expect(p.borders.has('#cdd3dc')).toBe(false);
  });
});

describe('KeyBox (the one standardized admonition)', () => {
  it('colors the left rule + title by the role ink', () => {
    const neg = paint(<KeyBox role="negative" title="t">v</KeyBox>);
    expect(neg.colors.has(tw('text-neg-ink').color)).toBe(true);
    expect(neg.borders.has(tw('text-neg-ink').color)).toBe(true);

    expect(paint(<KeyBox role="positive" title="t">v</KeyBox>).colors.has(tw('text-pos-ink').color)).toBe(true);
    expect(paint(<KeyBox role="warning" title="t">v</KeyBox>).colors.has(tw('text-warn-ink').color)).toBe(true);
    expect(paint(<KeyBox role="accent" title="t">v</KeyBox>).colors.has(tw('text-brand-ink').color)).toBe(true);
  });
  it('fills with the white card surface, not a role tint (role shows in the bar + title only)', () => {
    const p = paint(<KeyBox role="negative" title="t">v</KeyBox>);
    expect(p.bgs.has(tw('bg-card').backgroundColor)).toBe(true); // white by default
    expect(p.bgs.has(tw('bg-neg-soft').backgroundColor)).toBe(false); // no longer role-tinted
    expect(p.bgs.has(tw('bg-muted').backgroundColor)).toBe(false);
  });
  it('frames the panel in the ShadCN border, alongside the role left bar', () => {
    const p = paint(<KeyBox role="negative" title="t">v</KeyBox>);
    expect(p.borders.has(tw('border-border').borderColor)).toBe(true); // full frame
    expect(p.borders.has(tw('text-neg-ink').color)).toBe(true); // thick role left bar
  });
  it('sizes its title and body from the shared TYPE scale', () => {
    const s = sizes(<KeyBox role="accent" title="t">v</KeyBox>);
    expect(s.has(TYPE.cardTitle)).toBe(true);
    expect(s.has(TYPE.cardBody)).toBe(true);
  });
});
