import { describe, it, expect } from 'vitest';
import TestRenderer from 'react-test-renderer';
import { createTw } from 'react-pdf-tailwind';
import { CompareCard } from '../../src/pdf/components/CompareCard.js';
import { TwProvider, shadcnConfig } from '../../src/pdf/theme.js';

const tw = createTw(shadcnConfig('light'));

function flat(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) return Object.assign({}, ...style.map(flat));
  return (style ?? {}) as Record<string, unknown>;
}

/** Collect every resolved `color` and `backgroundColor` across the rendered tree. */
function collect() {
  const tree = TestRenderer.create(
    <TwProvider value={tw}>
      <CompareCard
        title="Trade-off"
        a={{ label: 'Pros', role: 'positive', items: ['fast'] }}
        b={{ label: 'Cons', role: 'negative', items: ['risky'] }}
        target="pick A"
      />
    </TwProvider>,
  ).toJSON() as any;
  const colors = new Set<unknown>();
  const bgs = new Set<unknown>();
  const walk = (n: any) => {
    if (!n || typeof n !== 'object') return;
    const s = flat(n.props?.style);
    if (s.color) colors.add(s.color);
    if (s.backgroundColor) bgs.add(s.backgroundColor);
    (n.children ?? []).forEach(walk);
  };
  (Array.isArray(tree) ? tree : [tree]).forEach(walk);
  return { colors, bgs };
}

describe('CompareCard (ShadCN tokens)', () => {
  it('wears the shared mono header band — a muted band with an indigo title', () => {
    const { colors, bgs } = collect();
    expect(bgs.has(tw('bg-muted').backgroundColor)).toBe(true); // Card header band
    expect(colors.has(tw('text-brand-ink').color)).toBe(true); // mono title + TARGET kicker
  });

  it('colors the columns by role from the agreed palette', () => {
    const { colors } = collect();
    expect(colors.has(tw('text-emerald-600').color)).toBe(true); // positive
    expect(colors.has(tw('text-destructive').color)).toBe(true); // negative
  });

  it('gives the target footer the accent (brand-soft) band — and carries no num pill / brand-fill', () => {
    const { bgs } = collect();
    expect(bgs.has(tw('bg-brand-soft').backgroundColor)).toBe(true); // footer accent band (Card footerTone)
    expect(bgs.has(tw('bg-brand-fill').backgroundColor)).toBe(false); // brand-fill is gone
  });

  it('does not leak the old bespoke palette hexes', () => {
    const { colors, bgs } = collect();
    expect(colors.has('#4b52d4')).toBe(false); // old accent
    expect(bgs.has('#eef0f5')).toBe(false); // old surface2
  });
});
