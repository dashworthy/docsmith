import { describe, it, expect } from 'vitest';
import TestRenderer from 'react-test-renderer';
import { createTw } from 'react-pdf-tailwind';
import { Callout } from '../../src/pdf/components/Callout.js';
import { shadcnConfig, TwProvider } from '../../src/pdf/theme.js';

const tw = createTw(shadcnConfig('light'));

/** Merge a react-pdf style (object, or array of objects) into one object. */
function flat(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) return Object.assign({}, ...style.map(flat));
  return (style ?? {}) as Record<string, unknown>;
}

function render(role: string) {
  const tree = TestRenderer.create(
    <TwProvider value={tw}>
      {/* @ts-expect-error role is a union; string is fine for the test matrix */}
      <Callout role={role}>body text</Callout>
    </TwProvider>,
  ).toJSON() as any;
  const container = Array.isArray(tree) ? tree[0] : tree;
  const texts: any[] = [];
  const walk = (n: any) => {
    if (!n) return;
    if (n.type === 'TEXT') texts.push(n);
    (n.children ?? []).forEach(walk);
  };
  walk(container);
  return { container, title: texts[0], body: texts[1] };
}

describe('Callout (ShadCN Alert)', () => {
  it('note uses the default (neutral) alert — foreground title, border border', () => {
    const { container, title, body } = render('note');
    expect(flat(container.props.style).borderColor).toBe(tw('border-border').borderColor);
    expect(flat(title.props.style).color).toBe(tw('text-foreground').color);
    expect(flat(body.props.style).color).toBe(tw('text-fg-muted').color);
  });

  it('caution uses the destructive variant', () => {
    const { container, title } = render('caution');
    expect(flat(container.props.style).borderColor).toBe(tw('border-destructive').borderColor);
    expect(flat(title.props.style).color).toBe(tw('text-destructive').color);
  });

  it('warning uses amber, tip uses emerald (Tailwind gap-fill roles)', () => {
    expect(flat(render('warning').title.props.style).color).toBe(tw('text-amber-600').color);
    expect(flat(render('tip').title.props.style).color).toBe(tw('text-emerald-600').color);
  });

  it('renders the role label and the body', () => {
    const { title, body } = render('tip');
    expect(title.children?.join('')).toBe('Tip');
    expect(body.children?.join('')).toBe('body text');
  });
});
