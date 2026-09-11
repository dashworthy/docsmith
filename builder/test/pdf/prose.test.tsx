import { describe, it, expect } from 'vitest';
import type { ReactElement } from 'react';
import TestRenderer from 'react-test-renderer';
import { createTw } from 'react-pdf-tailwind';
import { Muted, Eyebrow } from '../../src/pdf/components/prose.js';
import { shadcnConfig, TwProvider } from '../../src/pdf/theme.js';

const tw = createTw(shadcnConfig('light'));

/** Merge a react-pdf style (object, or array of objects) into one object. */
function flat(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) return Object.assign({}, ...style.map(flat));
  return (style ?? {}) as Record<string, unknown>;
}

/** Render one prose element under the light `tw` and return its resolved leaf-Text style. */
function leafStyle(node: ReactElement): Record<string, unknown> {
  const tree = TestRenderer.create(<TwProvider value={tw}>{node}</TwProvider>).toJSON() as any;
  const n = Array.isArray(tree) ? tree[0] : tree;
  return flat(n.props.style);
}

describe('prose primitives (ShadCN tokens)', () => {
  it('Muted uses the ShadCN muted-foreground token', () => {
    expect(leafStyle(<Muted>x</Muted>).color).toBe(tw('text-fg-muted').color);
  });

  it('Eyebrow defaults to the brand accent (indigo) ink', () => {
    expect(leafStyle(<Eyebrow>x</Eyebrow>).color).toBe(tw('text-brand-ink').color);
  });

  it('Eyebrow honours an explicit role-color override', () => {
    expect(leafStyle(<Eyebrow color="#123456">x</Eyebrow>).color).toBe('#123456');
  });

  it('does not leak the old bespoke accent hex', () => {
    expect(leafStyle(<Eyebrow>x</Eyebrow>).color).not.toBe('#4b52d4');
  });
});
