import { describe, it, expect } from 'vitest';
import type { ReactElement } from 'react';
import TestRenderer from 'react-test-renderer';
import { createTw } from 'react-pdf-tailwind';
import { Badge } from '../../src/pdf/components/Badge.js';
import { Table } from '../../src/pdf/components/Table.js';
import { Legend } from '../../src/pdf/components/Legend.js';
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
    if (s.borderTopColor) borders.add(s.borderTopColor);
    (n.children ?? []).forEach(walk);
  };
  (Array.isArray(tree) ? tree : [tree]).forEach(walk);
  return { colors, bgs, borders };
}

/** The single leaf `<Text>` style for a one-child Badge. */
function badgeStyle(node: ReactElement): Record<string, unknown> {
  const tree = TestRenderer.create(<TwProvider value={tw}>{node}</TwProvider>).toJSON() as any;
  const n = Array.isArray(tree) ? tree[0] : tree;
  return flat(n.props.style);
}

describe('Badge (vanilla ShadCN variants)', () => {
  it('neutral = secondary, accent = default(primary), negative = destructive', () => {
    const neu = badgeStyle(<Badge role="neutral">n</Badge>);
    expect(neu.backgroundColor).toBe(tw('bg-secondary').backgroundColor);
    expect(neu.color).toBe(tw('text-fg-secondary').color);

    const acc = badgeStyle(<Badge role="accent">a</Badge>);
    expect(acc.backgroundColor).toBe(tw('bg-primary').backgroundColor);
    expect(acc.color).toBe(tw('text-fg-primary').color);

    expect(badgeStyle(<Badge role="negative">x</Badge>).backgroundColor).toBe(tw('bg-destructive').backgroundColor);
  });
  it('positive/warning are solid emerald/amber gap-fills', () => {
    expect(badgeStyle(<Badge role="positive">p</Badge>).backgroundColor).toBe(tw('bg-emerald-600').backgroundColor);
    expect(badgeStyle(<Badge role="warning">w</Badge>).backgroundColor).toBe(tw('bg-amber-600').backgroundColor);
  });
  it('does not leak the old soft-fill hex', () => {
    expect(badgeStyle(<Badge role="accent">a</Badge>).backgroundColor).not.toBe('#e9eafb'); // accentSoft
  });
});

describe('Table (ShadCN tokens)', () => {
  const p = paint(<Table head={['A', 'B']} rows={[['1', '2'], ['3', '4']]} />);
  it('has a muted header band with muted-foreground headers', () => {
    expect(p.bgs.has(tw('bg-muted').backgroundColor)).toBe(true);
    expect(p.colors.has(tw('text-fg-muted').color)).toBe(true);
  });
  it('zebras on card + muted and rules rows with the border token', () => {
    expect(p.bgs.has(tw('bg-card').backgroundColor)).toBe(true);
    expect(p.borders.has(tw('border-border').borderColor)).toBe(true);
  });
  it('leads the first cell in foreground and does not leak accent-soft', () => {
    expect(p.colors.has(tw('text-foreground').color)).toBe(true);
    expect(p.bgs.has('#e9eafb')).toBe(false);
  });
});

describe('Legend (ShadCN role dots)', () => {
  const p = paint(
    <Legend
      items={[
        { role: 'accent', label: 'a' },
        { role: 'positive', label: 'p' },
        { role: 'negative', label: 'n' },
        { role: 'warning', label: 'w' },
        { role: 'neutral', label: 'x' },
      ]}
    />,
  );
  it('colors dots by role from the agreed palette', () => {
    expect(p.bgs.has(tw('bg-primary').backgroundColor)).toBe(true);
    expect(p.bgs.has(tw('bg-emerald-600').backgroundColor)).toBe(true);
    expect(p.bgs.has(tw('bg-destructive').backgroundColor)).toBe(true);
    expect(p.bgs.has(tw('bg-amber-600').backgroundColor)).toBe(true);
    expect(p.bgs.has(tw('bg-fg-muted').backgroundColor)).toBe(true); // neutral
  });
  it('labels in muted, does not leak the old accent hex', () => {
    expect(p.colors.has(tw('text-fg-muted').color)).toBe(true);
    expect(p.bgs.has('#4b52d4')).toBe(false);
  });
});
