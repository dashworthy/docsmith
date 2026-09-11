import { describe, it, expect } from 'vitest';
import TestRenderer from 'react-test-renderer';
import { Text } from '@react-pdf/renderer';
import { createTw } from 'react-pdf-tailwind';
import { Card, RADIUS } from '../../src/pdf/components/surface.js';
import { shadcnConfig, TwProvider } from '../../src/pdf/theme.js';

const tw = createTw(shadcnConfig('light'));

/** Merge a react-pdf style (object, or array of objects) into one object. */
function flat(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) return Object.assign({}, ...style.map(flat));
  return (style ?? {}) as Record<string, unknown>;
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
