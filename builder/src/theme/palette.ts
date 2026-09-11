// Exact color and font values, transcribed once from the "Harvest × Bloom Parity"
// reference artifact. This module is the single source of truth for the palette: retuning a
// hex or renaming a role changes it here and nowhere else. Component code never sees these
// values — it reaches color only through the typed token module in tokens.ts, which turns
// these into CSS custom properties.

export const PALETTE = {
  light: {
    ground: '#f5f6f9',
    surface: '#ffffff',
    surface2: '#eef0f5',
    ink: '#171b22',
    ink2: '#4a5462',
    ink3: '#79828f',
    border: '#e0e4ea',
    borderStrong: '#cdd3dc',
    accent: '#4b52d4',
    accentSoft: '#e9eafb',
    positive: '#0f7a5a',
    positiveSoft: '#d9f2e8',
    negative: '#b83f36',
    negativeSoft: '#f7e2df',
    warning: '#a76d12',
    warningSoft: '#f8eeda',
  },
  dark: {
    ground: '#0c0f15',
    surface: '#141922',
    surface2: '#1b212c',
    ink: '#e7eaef',
    ink2: '#a7b0bd',
    ink3: '#79828f',
    border: '#242c38',
    borderStrong: '#333d4c',
    accent: '#838af6',
    accentSoft: '#23253f',
    positive: '#34c99a',
    positiveSoft: '#103028',
    negative: '#e2685e',
    negativeSoft: '#341c1a',
    warning: '#dca34a',
    warningSoft: '#33280f',
  },
} as const;

/** A palette role — the shared key set of both themes. */
export type TokenName = keyof typeof PALETTE.light;

/** Font stacks, exposed as CSS variables (`--font-sans` / `--font-mono` / `--font-display`). */
export const FONTS = {
  sans: "'IBM Plex Sans',system-ui,sans-serif",
  mono: "'IBM Plex Mono',ui-monospace,monospace",
  display: "'Familjen Grotesk',system-ui,sans-serif",
} as const;
