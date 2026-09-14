import { describe, expect, it } from 'vitest';
import { CONTENT_HEIGHT, HEADLINE_MIN_PRESENCE } from '../../src/pdf/theme.js';

describe('page geometry — headline break threshold', () => {
  it('requires two-fifths of the content height below a headline (moderate orphan control)', () => {
    // Section passes this to its header block's `minPresenceAhead`: a headline is pushed to the
    // next page only when less than this remains below it. Two-fifths of the page — so a headline is
    // bumped when it would otherwise start in the bottom two-fifths, keeping a run of body beneath it.
    expect(HEADLINE_MIN_PRESENCE).toBe(CONTENT_HEIGHT * 0.4);
  });

  it('resolves to ≈298.4pt on A4 with the standard vertical padding', () => {
    expect(Math.round(HEADLINE_MIN_PRESENCE * 10) / 10).toBe(298.4);
  });
});
