import { describe, expect, it } from 'vitest';
import { ROLE } from '../src/theme/palette.js';

const HEX = /^#[0-9a-f]{6}$/;

describe('ROLE accent palette', () => {
  it('defines ink + soft (and any fill) for every role in both themes as valid hex', () => {
    for (const theme of ['light', 'dark'] as const) {
      for (const role of ['brand', 'pos', 'warn', 'neg'] as const) {
        const r = ROLE[theme][role];
        expect(r.ink, `${theme}.${role}.ink`).toMatch(HEX);
        expect(r.soft, `${theme}.${role}.soft`).toMatch(HEX);
        if (r.fill) expect(r.fill, `${theme}.${role}.fill`).toMatch(HEX);
      }
    }
  });

  it('brands ink + soft on Tailwind blue (not indigo or violet)', () => {
    // The brand accent standardizes on Tailwind's blue scale (was indigo ink/soft + violet fill).
    expect(ROLE.light.brand.ink).toBe('#2563eb'); // blue-600
    expect(ROLE.light.brand.soft).toBe('#eff6ff'); // blue-50
    expect(ROLE.dark.brand.ink).toBe('#60a5fa'); // blue-400
    expect(ROLE.dark.brand.soft).toBe('#172554'); // blue-950
  });

  it('footers on a soft blue-100 in light, the blue-950 panel tint in dark', () => {
    // The footer `fill` is tuned per ground: in light it is a soft blue-100, a gentle step above the
    // pale blue-50 panels so the footer still reads as its own strip; in dark it drops to blue-950,
    // matching the panels, so it sits quiet against the near-black card.
    expect(ROLE.light.brand.fill).toBe('#dbeafe'); // blue-100 (a step above the blue-50 panels)
    expect(ROLE.dark.brand.fill).toBe('#172554'); // blue-950 (= soft panels)
  });

  it('carries no leftover indigo/violet brand hexes', () => {
    const stale = ['#4f46e5', '#eef2ff', '#ddd6fe', '#818cf8', '#1e1b4b', '#5b21b6'];
    const brandHexes = [
      ROLE.light.brand.ink, ROLE.light.brand.soft, ROLE.light.brand.fill,
      ROLE.dark.brand.ink, ROLE.dark.brand.soft, ROLE.dark.brand.fill,
    ];
    for (const s of stale) expect(brandHexes).not.toContain(s);
  });

  it('leaves the non-blue roles (emerald / amber / red) untouched', () => {
    expect(ROLE.light.pos.ink).toBe('#059669'); // emerald-600
    expect(ROLE.light.warn.ink).toBe('#d97706'); // amber-600
    expect(ROLE.light.neg.ink).toBe('#dc2626'); // red-600
  });
});
