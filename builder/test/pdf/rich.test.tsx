import { describe, it, expect } from 'vitest';
import type { ReactElement } from 'react';
import TestRenderer from 'react-test-renderer';
import { createTw } from 'react-pdf-tailwind';
import { CodeBlock } from '../../src/pdf/components/CodeBlock.js';
import { Mermaid } from '../../src/pdf/components/Mermaid.js';
import { shadcnConfig, TwProvider } from '../../src/pdf/theme.js';
import type { HighlightedCode } from '../../src/pdf/highlightCode.js';

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

const CODE: HighlightedCode = {
  bg: '#282c34',
  fg: '#abb2bf',
  lines: [[{ content: 'const', color: '#c678dd' }]],
};

describe('CodeBlock (ShadCN frame, Shiki colors)', () => {
  const p = paint(<CodeBlock code={CODE} />);
  it('frames the snippet in a ShadCN border', () => {
    expect(p.borders.has(tw('border-border').borderColor)).toBe(true);
  });
  it("preserves Shiki's own background and token colors", () => {
    expect(p.bgs.has('#282c34')).toBe(true);
    expect(p.colors.has('#c678dd')).toBe(true);
  });
});

describe('Mermaid (ShadCN tokens)', () => {
  const p = paint(
    <Mermaid diagram={{ dataUri: 'data:image/png;base64,AAAA', aspect: 1.5 }} title="Flow" caption="how it flows" />,
  );
  it('bands in muted with border + shared mono indigo title, muted caption', () => {
    expect(p.bgs.has(tw('bg-muted').backgroundColor)).toBe(true);
    expect(p.bgs.has(tw('bg-card').backgroundColor)).toBe(true);
    expect(p.borders.has(tw('border-border').borderColor)).toBe(true);
    expect(p.colors.has(tw('text-brand-ink').color)).toBe(true); // shared Card mono header title
    expect(p.colors.has(tw('text-fg-muted').color)).toBe(true); // caption
  });
  it('does not leak old palette hexes', () => {
    expect(p.bgs.has('#eef0f5')).toBe(false); // surface2
  });
});
