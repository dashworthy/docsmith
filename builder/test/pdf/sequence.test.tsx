import { describe, it, expect } from 'vitest';
import type { ReactElement } from 'react';
import TestRenderer from 'react-test-renderer';
import { createTw } from 'react-pdf-tailwind';
import { Phases } from '../../src/pdf/components/Phases.js';
import { Flow } from '../../src/pdf/components/Flow.js';
import { QList } from '../../src/pdf/components/QList.js';
import { NonGoals } from '../../src/pdf/components/NonGoals.js';
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
    if (s.borderColor) borders.add(s.borderColor);
    (n.children ?? []).forEach(walk);
  };
  (Array.isArray(tree) ? tree : [tree]).forEach(walk);
  return { colors, bgs, borders };
}

describe('Phases (ShadCN tokens)', () => {
  const p = paint(
    <Phases
      items={[
        { idx: '1', title: 'Build', body: 'do it' },
        { idx: '2', title: 'Also', body: 'concurrently', parallel: true },
      ]}
    />,
  );
  it('gives each phase an accent-soft number column — indigo for sequential, emerald for parallel', () => {
    expect(p.bgs.has(tw('bg-brand-soft').backgroundColor)).toBe(true); // sequential column
    expect(p.colors.has(tw('text-brand-ink').color)).toBe(true); // sequential number
    expect(p.bgs.has(tw('bg-pos-soft').backgroundColor)).toBe(true); // parallel column
    expect(p.colors.has(tw('text-pos-ink').color)).toBe(true); // parallel number
  });
  it('sits on a bordered white card — foreground titles, muted bodies', () => {
    expect(p.bgs.has(tw('bg-card').backgroundColor)).toBe(true);
    expect(p.borders.has(tw('border-border').borderColor)).toBe(true);
    expect(p.colors.has(tw('text-foreground').color)).toBe(true);
    expect(p.colors.has(tw('text-fg-muted').color)).toBe(true);
  });
});

describe('Flow (tone = destructive/emerald on a muted lane)', () => {
  const p = paint(
    <Flow
      lanes={[
        { tag: 'today', tone: 'bad', steps: [{ text: 'ask' }, { text: 'lost', tone: 'bad' }] },
        { tag: 'target', tone: 'good', steps: [{ text: 'ask' }, { text: 'kept', tone: 'good' }] },
      ]}
    />,
  );
  it('tints the lane border + tag by tone on a muted fill', () => {
    expect(p.bgs.has(tw('bg-muted').backgroundColor)).toBe(true);
    expect(p.borders.has(tw('border-destructive').borderColor)).toBe(true);
    expect(p.borders.has(tw('border-emerald-600').borderColor)).toBe(true);
    expect(p.colors.has(tw('text-destructive').color)).toBe(true);
    expect(p.colors.has(tw('text-emerald-600').color)).toBe(true);
  });
  it('does not leak the old soft-fill hexes', () => {
    expect(p.bgs.has('#f7e2df')).toBe(false); // negativeSoft
    expect(p.bgs.has('#d9f2e8')).toBe(false); // positiveSoft
  });
});

describe('QList (ShadCN tokens)', () => {
  const p = paint(<QList items={['first?', 'second?']} />);
  it('markers in indigo, bodies in muted; no old accent hex', () => {
    expect(p.colors.has(tw('text-brand-ink').color)).toBe(true);
    expect(p.colors.has(tw('text-fg-muted').color)).toBe(true);
    expect(p.colors.has('#4b52d4')).toBe(false);
  });
});

describe('NonGoals (ShadCN tokens)', () => {
  const p = paint(<NonGoals items={['no html', 'no widgets']} />);
  it('marks with destructive, strikes text in muted; no old negative hex', () => {
    expect(p.colors.has(tw('text-destructive').color)).toBe(true);
    expect(p.colors.has(tw('text-fg-muted').color)).toBe(true);
    expect(p.colors.has('#b83f36')).toBe(false);
  });
});
