import { describe, it, expect } from 'vitest';
import type { ReactElement } from 'react';
import TestRenderer from 'react-test-renderer';
import { Text } from '@react-pdf/renderer';
import { createTw } from 'react-pdf-tailwind';
import { Card, RADIUS } from '../../src/pdf/components/surface.js';
import { FONT, shadcnConfig, TwProvider, TYPE } from '../../src/pdf/theme.js';

const tw = createTw(shadcnConfig('light'));

/** Merge a react-pdf style (object, or array of objects) into one object. */
function flat(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) return Object.assign({}, ...style.map(flat));
  return (style ?? {}) as Record<string, unknown>;
}

/** Collect every resolved style value of interest across a rendered Card. */
function collect(node: ReactElement) {
  const tree = TestRenderer.create(<TwProvider value={tw}>{node}</TwProvider>).toJSON() as any;
  const colors = new Set<unknown>();
  const bgs = new Set<unknown>();
  const fonts = new Set<unknown>();
  const sizes = new Set<unknown>();
  const weights = new Set<unknown>();
  const borderStyles = new Set<unknown>();
  const walk = (n: any) => {
    if (!n || typeof n !== 'object') return;
    const s = flat(n.props?.style);
    if (s.color) colors.add(s.color);
    if (s.backgroundColor) bgs.add(s.backgroundColor);
    if (s.fontFamily) fonts.add(s.fontFamily);
    if (typeof s.fontSize === 'number') sizes.add(s.fontSize);
    if (typeof s.fontWeight === 'number') weights.add(s.fontWeight);
    if (s.borderStyle) borderStyles.add(s.borderStyle);
    (n.children ?? []).forEach(walk);
  };
  (Array.isArray(tree) ? tree : [tree]).forEach(walk);
  return { colors, bgs, fonts, sizes, weights, borderStyles };
}

/** Every `borderColor` resolved across a rendered default `Card`. */
function borderColors(): unknown[] {
  const tree = TestRenderer.create(
    <TwProvider value={tw}>
      <Card radius={RADIUS.lg}>
        <Text>body</Text>
      </Card>
    </TwProvider>,
  ).toJSON() as any;
  const found: unknown[] = [];
  const walk = (n: any) => {
    if (!n || typeof n !== 'object') return;
    const s = flat(n.props?.style);
    if (s.borderColor) found.push(s.borderColor);
    (n.children ?? []).forEach(walk);
  };
  (Array.isArray(tree) ? tree : [tree]).forEach(walk);
  return found;
}

describe('Card (ShadCN border)', () => {
  it('draws the overlay border in the ShadCN border token', () => {
    expect(borderColors()).toContain(tw('border-border').borderColor);
  });

  it('does not leak the old bespoke borderStrong hex', () => {
    expect(borderColors()).not.toContain('#cdd3dc');
  });
});

describe('Card (shared header + footer bands)', () => {
  it('renders `title` as a mono, blue, TYPE.cardTitle header on a muted band', () => {
    const c = collect(
      <Card title={'Ns\\Sub'}>
        <Text>body</Text>
      </Card>,
    );
    expect(c.bgs.has(tw('bg-muted').backgroundColor)).toBe(true);
    expect(c.colors.has(tw('text-brand-ink').color)).toBe(true);
    expect(c.fonts.has(FONT.mono)).toBe(true);
    expect(c.sizes.has(TYPE.cardTitle)).toBe(true);
    expect(c.weights.has(700)).toBe(true); // bold header title
  });

  it('renders an accent-tone footer as a dashed-top brand-soft (blue-50) band', () => {
    const c = collect(
      <Card footer={<Text>target</Text>} footerTone="accent">
        <Text>body</Text>
      </Card>,
    );
    expect(c.bgs.has(tw('bg-brand-soft').backgroundColor)).toBe(true);
    expect(c.borderStyles.has('dashed')).toBe(true);
  });

  it('renders a muted-tone footer with the same brand-soft band but a solid (not dashed) border', () => {
    const c = collect(
      <Card footer={<Text>caption</Text>} footerTone="muted">
        <Text>body</Text>
      </Card>,
    );
    expect(c.bgs.has(tw('bg-brand-soft').backgroundColor)).toBe(true); // fill unified across tones
    expect(c.borderStyles.has('dashed')).toBe(false); // tone distinction now lives in the border only
  });
});
