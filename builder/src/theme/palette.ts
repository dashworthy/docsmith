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

// ── Vanilla ShadCN token palette ────────────────────────────────────────────
// The canonical ShadCN default theme (slate base), transcribed from its `globals.css`
// `:root`/`.dark` custom properties and resolved from HSL to hex (react-pdf parses hex
// reliably; it has no CSS variables). This is the sole color source for the react-pdf
// component set — components reach these through the `tw()` styling boundary (see
// `pdf/theme.ts`), never directly. Kept deliberately vanilla: retuning toward a custom look
// happens here and nowhere else. Coexists with the bespoke `PALETTE` above only until the
// last `usePalette()` consumer is migrated, then `PALETTE`/`TokenName` are removed.

/** A ShadCN semantic design token — the shared key set of both themes. */
export type ShadcnToken =
  | 'background' | 'foreground'
  | 'card' | 'card-foreground'
  | 'popover' | 'popover-foreground'
  | 'primary' | 'primary-foreground'
  | 'secondary' | 'secondary-foreground'
  | 'muted' | 'muted-foreground'
  | 'accent' | 'accent-foreground'
  | 'destructive' | 'destructive-foreground'
  | 'border' | 'input' | 'ring';

export const SHADCN: { light: Record<ShadcnToken, string>; dark: Record<ShadcnToken, string> } = {
  light: {
    background: '#ffffff',
    foreground: '#020817',
    card: '#ffffff',
    'card-foreground': '#020817',
    popover: '#ffffff',
    'popover-foreground': '#020817',
    primary: '#0f172a',
    'primary-foreground': '#f8fafc',
    secondary: '#f1f5f9',
    'secondary-foreground': '#0f172a',
    muted: '#f1f5f9',
    'muted-foreground': '#64748b',
    accent: '#f1f5f9',
    'accent-foreground': '#0f172a',
    destructive: '#ef4444',
    'destructive-foreground': '#f8fafc',
    border: '#e2e8f0',
    input: '#e2e8f0',
    ring: '#020817',
  },
  dark: {
    background: '#020817',
    foreground: '#f8fafc',
    card: '#020817',
    'card-foreground': '#f8fafc',
    popover: '#020817',
    'popover-foreground': '#f8fafc',
    primary: '#f8fafc',
    'primary-foreground': '#0f172a',
    secondary: '#1e293b',
    'secondary-foreground': '#f8fafc',
    muted: '#1e293b',
    'muted-foreground': '#94a3b8',
    accent: '#1e293b',
    'accent-foreground': '#f8fafc',
    destructive: '#7f1d1d',
    'destructive-foreground': '#f8fafc',
    border: '#1e293b',
    input: '#1e293b',
    ring: '#cbd5e1',
  },
} as const;

/** Font stacks, exposed as CSS variables (`--font-sans` / `--font-mono` / `--font-display`). */
export const FONTS = {
  sans: "'IBM Plex Sans',system-ui,sans-serif",
  mono: "'IBM Plex Mono',ui-monospace,monospace",
  display: "'Familjen Grotesk',system-ui,sans-serif",
} as const;
