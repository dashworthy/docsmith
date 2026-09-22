import { describe, it, expect } from 'vitest';
import TestRenderer from 'react-test-renderer';
import { createTw } from 'react-pdf-tailwind';
import { SHADCN } from '../src/theme/palette.js';
import { shadcnConfig, TwProvider, useTw } from '../src/pdf/theme.js';

describe('shadcnConfig', () => {
  it('resolves ShadCN semantic classes to the theme token colors (light)', () => {
    const tw = createTw(shadcnConfig('light'));
    expect(tw('bg-card').backgroundColor).toBe(SHADCN.light.card);
    expect(tw('text-primary').color).toBe(SHADCN.light.primary);
    expect(tw('border border-border').borderColor).toBe(SHADCN.light.border);
  });

  it('resolves surface-foreground tokens via the fg-* convention', () => {
    const tw = createTw(shadcnConfig('light'));
    // react-pdf-tailwind can't reach `text-X-foreground`; foregrounds are shades of `fg`.
    expect(tw('text-fg-muted').color).toBe(SHADCN.light['muted-foreground']);
    expect(tw('text-fg-primary').color).toBe(SHADCN.light['primary-foreground']);
    expect(tw('text-fg-card').color).toBe(SHADCN.light['card-foreground']);
  });

  it('selects the dark token set for the dark theme', () => {
    const tw = createTw(shadcnConfig('dark'));
    expect(tw('bg-card').backgroundColor).toBe(SHADCN.dark.card);
    expect(tw('text-fg-muted').color).toBe(SHADCN.dark['muted-foreground']);
  });
});

describe('useTw / TwProvider', () => {
  it('hands components the theme-bound tw from context', () => {
    let seen: Record<string, unknown> = {};
    function Probe() {
      const tw = useTw();
      seen = tw('bg-card') as Record<string, unknown>;
      return null;
    }
    const tw = createTw(shadcnConfig('dark'));
    TestRenderer.create(
      <TwProvider value={tw}>
        <Probe />
      </TwProvider>,
    );
    expect(seen.backgroundColor).toBe(SHADCN.dark.card);
  });
});
