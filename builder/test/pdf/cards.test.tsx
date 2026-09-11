import { describe, it, expect } from 'vitest';
import type { ReactElement } from 'react';
import TestRenderer from 'react-test-renderer';
import { createTw } from 'react-pdf-tailwind';
import { SourceCard } from '../../src/pdf/components/SourceCard.js';
import { PanelGrid, Panel } from '../../src/pdf/components/PanelGrid.js';
import { KeyBox } from '../../src/pdf/components/KeyBox.js';
import { shadcnConfig, TwProvider } from '../../src/pdf/theme.js';

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

describe('SourceCard (ShadCN tokens)', () => {
  const p = paint(<SourceCard title="App\Render\Renderer">body</SourceCard>);
  it('uses a muted header band with a primary mono title over a muted body', () => {
    expect(p.bgs.has(tw('bg-muted').backgroundColor)).toBe(true);
    expect(p.colors.has(tw('text-primary').color)).toBe(true);
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

describe('KeyBox (ShadCN role palette)', () => {
  it('colors the rule + key by role', () => {
    const neg = paint(<KeyBox role="negative" k="k" v="v" />);
    expect(neg.colors.has(tw('text-destructive').color)).toBe(true);
    expect(neg.borders.has(tw('border-destructive').borderColor)).toBe(true);

    expect(paint(<KeyBox role="positive" k="k" v="v" />).colors.has(tw('text-emerald-600').color)).toBe(true);
    expect(paint(<KeyBox role="warning" k="k" v="v" />).colors.has(tw('text-amber-600').color)).toBe(true);
    expect(paint(<KeyBox role="accent" k="k" v="v" />).colors.has(tw('text-primary').color)).toBe(true);
  });
  it('fills with the theme-safe muted token, not a fixed soft tint', () => {
    const p = paint(<KeyBox role="negative" k="k" v="v" />);
    expect(p.bgs.has(tw('bg-muted').backgroundColor)).toBe(true);
    expect(p.bgs.has('#f7e2df')).toBe(false); // old negativeSoft
  });
});
