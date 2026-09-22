import { describe, it, expect } from 'vitest';
import type { ReactElement } from 'react';
import TestRenderer from 'react-test-renderer';
import { createTw } from 'react-pdf-tailwind';
import { FONT, shadcnConfig, TwProvider } from '../../src/pdf/theme.js';
import { StatGrid } from '../../src/pdf/components/StatGrid.js';
import { Meter } from '../../src/pdf/components/Meter.js';
import { DefList } from '../../src/pdf/components/DefList.js';
import { Timeline } from '../../src/pdf/components/Timeline.js';
import { Matrix } from '../../src/pdf/components/Matrix.js';
import { Quote } from '../../src/pdf/components/Quote.js';
import { Checklist } from '../../src/pdf/components/Checklist.js';
import { Byline } from '../../src/pdf/components/Byline.js';
import { Banner } from '../../src/pdf/components/Banner.js';
import { References, Ref } from '../../src/pdf/components/References.js';

const tw = createTw(shadcnConfig('light'));

function flat(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) return Object.assign({}, ...style.map(flat));
  return (style ?? {}) as Record<string, unknown>;
}

/** Every resolved paint value + collected leaf text across a rendered subtree. */
function paint(node: ReactElement) {
  const tree = TestRenderer.create(<TwProvider value={tw}>{node}</TwProvider>).toJSON() as any;
  const colors = new Set<unknown>();
  const bgs = new Set<unknown>();
  const fonts = new Set<unknown>();
  const widths = new Set<unknown>();
  const texts: string[] = [];
  const walk = (n: any) => {
    if (typeof n === 'string') return texts.push(n);
    if (!n || typeof n !== 'object') return;
    const s = flat(n.props?.style);
    if (s.color) colors.add(s.color);
    if (s.backgroundColor) bgs.add(s.backgroundColor);
    if (s.fontFamily) fonts.add(s.fontFamily);
    if (s.width) widths.add(s.width);
    (n.children ?? []).forEach(walk);
  };
  (Array.isArray(tree) ? tree : [tree]).forEach(walk);
  return { colors, bgs, fonts, widths, text: texts.join(' ') };
}

describe('StatGrid (KPI tiles)', () => {
  const p = paint(
    <StatGrid
      items={[
        { label: 'Up', value: '9', delta: '1%', trend: 'up' },
        { label: 'Down', value: '8', delta: '1%', trend: 'down' },
      ]}
    />,
  );
  it('tiles are framed cards with a display value and mono labels', () => {
    expect(p.bgs.has(tw('bg-card').backgroundColor)).toBe(true);
    expect(p.fonts.has(FONT.display)).toBe(true); // big value
    expect(p.fonts.has(FONT.mono)).toBe(true); // uppercase label
  });
  it('trend colors the delta with the role ink (up→pos, down→neg)', () => {
    expect(p.colors.has(tw('text-pos-ink').color)).toBe(true);
    expect(p.colors.has(tw('text-neg-ink').color)).toBe(true);
  });
});

describe('Meter (progress bars)', () => {
  it('fills to the value width with role ink over a role-soft track, clamped 0–100', () => {
    const p = paint(<Meter items={[{ label: 'Cov', value: 73, role: 'positive' }, { label: 'Over', value: 140, role: 'negative' }]} />);
    expect(p.bgs.has(tw('bg-pos-soft').backgroundColor)).toBe(true); // track
    expect(p.bgs.has(tw('bg-pos-ink').backgroundColor)).toBe(true); // fill
    expect(p.widths.has('73%')).toBe(true);
    expect(p.widths.has('100%')).toBe(true); // 140 clamped
    expect(p.widths.has('140%')).toBe(false);
  });
});

describe('DefList (spec grid)', () => {
  it('zebra rows with mono terms and muted values', () => {
    const p = paint(<DefList rows={[{ term: 'a', value: '1' }, { term: 'b', value: '2' }]} />);
    expect(p.bgs.has(tw('bg-muted').backgroundColor)).toBe(true); // zebra
    expect(p.fonts.has(FONT.mono)).toBe(true); // term key
    expect(p.colors.has(tw('text-fg-muted').color)).toBe(true); // value ink
  });
});

describe('Timeline (milestone rail)', () => {
  it('marks events with role dots and threads a border connector', () => {
    const p = paint(<Timeline items={[{ time: 't1', title: 'A', role: 'positive' }, { time: 't2', title: 'B', role: 'accent' }]} />);
    expect(p.bgs.has(tw('bg-pos-ink').backgroundColor)).toBe(true); // dot
    expect(p.bgs.has(tw('bg-brand-ink').backgroundColor)).toBe(true);
    expect(p.fonts.has(FONT.mono)).toBe(true); // time kicker
  });
});

describe('Matrix (feature grid)', () => {
  const p = paint(
    <Matrix
      columns={['Cap', 'Free', 'Pro']}
      highlight={2}
      rows={[['PDF', true, true], ['Dark', false, true]]}
    />,
  );
  it('booleans render as ✓ / en-dash with positive ink for true', () => {
    expect(p.text).toContain('✓');
    expect(p.text).toContain('–'); // absence = en-dash (✗ has no glyph in the registered faces)
    expect(p.colors.has(tw('text-pos-ink').color)).toBe(true);
  });
  it('the highlighted column takes the brand soft tint', () => {
    expect(p.bgs.has(tw('bg-brand-soft').backgroundColor)).toBe(true);
  });
});

describe('Quote (pull-quote)', () => {
  it('sets the quote in the display font with a mono attribution', () => {
    const p = paint(<Quote by="me">A line.</Quote>);
    expect(p.fonts.has(FONT.display)).toBe(true);
    expect(p.fonts.has(FONT.mono)).toBe(true);
    expect(p.text).toContain('A line.');
  });
});

describe('Checklist (task list)', () => {
  it('done items fill an emerald box; the label lives beside it', () => {
    const p = paint(<Checklist items={[{ text: 'done', done: true }, { text: 'todo' }]} />);
    expect(p.bgs.has(tw('bg-pos-ink').backgroundColor)).toBe(true); // checked box
    expect(p.text).toContain('done');
    expect(p.text).toContain('todo');
  });
});

describe('Byline (author chip)', () => {
  it('renders a brand-soft avatar with derived initials', () => {
    const p = paint(<Byline name="Andrew Leach" role="Maintainer" />);
    expect(p.bgs.has(tw('bg-brand-soft').backgroundColor)).toBe(true);
    expect(p.colors.has(tw('text-brand-ink').color)).toBe(true);
    expect(p.text).toContain('AL'); // auto initials
  });
});

describe('Banner (alert strip)', () => {
  it('takes the role soft fill and ink title across the full width', () => {
    const p = paint(<Banner role="warning" title="Heads up">body</Banner>);
    expect(p.bgs.has(tw('bg-warn-soft').backgroundColor)).toBe(true);
    expect(p.colors.has(tw('text-warn-ink').color)).toBe(true);
    expect(p.text).toContain('Heads up');
  });
});

describe('References + Ref', () => {
  it('numbers sources with brand-ink mono markers', () => {
    const p = paint(<References items={['first', 'second']} />);
    expect(p.colors.has(tw('text-brand-ink').color)).toBe(true);
    expect(p.fonts.has(FONT.mono)).toBe(true);
    expect(p.text).toContain('1.');
    expect(p.text).toContain('2.');
  });
  it('the inline Ref cites with a brand-ink superscript marker', () => {
    const p = paint(<Ref n={3} />);
    expect(p.colors.has(tw('text-brand-ink').color)).toBe(true);
    expect(p.text).toContain('[3]');
  });
});
