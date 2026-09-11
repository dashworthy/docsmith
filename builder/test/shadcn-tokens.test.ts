import { describe, expect, it } from 'vitest';
import { SHADCN, type ShadcnToken } from '../src/theme/palette.js';

// The full ShadCN semantic token vocabulary both themes must define.
const TOKENS: ShadcnToken[] = [
  'background', 'foreground', 'card', 'card-foreground',
  'popover', 'popover-foreground', 'primary', 'primary-foreground',
  'secondary', 'secondary-foreground', 'muted', 'muted-foreground',
  'accent', 'accent-foreground', 'destructive', 'destructive-foreground',
  'border', 'input', 'ring',
];

const HEX = /^#[0-9a-f]{6}$/;

describe('SHADCN token maps', () => {
  it('defines every token in both light and dark as a valid hex color', () => {
    for (const token of TOKENS) {
      expect(SHADCN.light[token], `light.${token}`).toMatch(HEX);
      expect(SHADCN.dark[token], `dark.${token}`).toMatch(HEX);
    }
  });

  it('resolves light and dark to genuinely different surfaces', () => {
    // A per-render theme selection is only meaningful if the two sets differ.
    expect(SHADCN.light.background).not.toBe(SHADCN.dark.background);
    expect(SHADCN.light.card).not.toBe(SHADCN.dark.card);
    expect(SHADCN.light.foreground).not.toBe(SHADCN.dark.foreground);
  });

  it('uses vanilla ShadCN default (slate) values', () => {
    // Spot-check the canonical defaults so a drift from vanilla ShadCN is caught.
    expect(SHADCN.light.primary).toBe('#0f172a'); // slate-900
    expect(SHADCN.light.border).toBe('#e2e8f0'); // slate-200
    expect(SHADCN.light.destructive).toBe('#ef4444'); // red-500
    expect(SHADCN.dark.background).toBe('#020817');
  });
});
