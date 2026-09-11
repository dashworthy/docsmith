// The vanilla ShadCN token palette — the single source of truth for color in the PDF component set.
// The canonical ShadCN default theme (slate base), transcribed from its `globals.css`
// `:root`/`.dark` custom properties and resolved from HSL to hex (react-pdf parses hex reliably; it
// has no CSS variables). Components reach these through the `tw()` styling boundary (see
// `pdf/theme.ts`), never directly. Kept deliberately vanilla: retuning toward a custom look happens
// here and nowhere else.

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
    // A deliberately retuned neutral ramp (still all Tailwind slate) so light mode reads as a
    // grounded surface rather than flat white: a light grey **ground** (slate-100), white **cards**
    // framed off it by a **border** (slate-300, defined enough to carry the card edge on its own),
    // and **muted** (slate-200) for the recessed bands / panels / chips that sit on white surfaces.
    background: '#f1f5f9', // slate-100 — the page ground
    foreground: '#020817',
    card: '#ffffff', // white — framed off the ground by the slate-300 border
    'card-foreground': '#020817',
    popover: '#ffffff',
    'popover-foreground': '#020817',
    primary: '#0f172a',
    'primary-foreground': '#f8fafc',
    secondary: '#e2e8f0', // slate-200
    'secondary-foreground': '#0f172a',
    muted: '#e2e8f0', // slate-200 — recessed bands on white surfaces
    'muted-foreground': '#64748b',
    accent: '#e2e8f0', // slate-200
    'accent-foreground': '#0f172a',
    destructive: '#ef4444',
    'destructive-foreground': '#f8fafc',
    border: '#cbd5e1', // slate-300 — a defined card frame against the grey ground
    input: '#cbd5e1',
    ring: '#020817',
  },
  dark: {
    background: '#020817',
    foreground: '#f8fafc',
    // Lifted card (slate-900) so surfaces read as raised off the near-black ground, rather than
    // vanishing into it — the dark-mode counterpart to the off-white light ground above.
    card: '#0f172a',
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
    border: '#334155', // slate-700 — a defined card frame against the near-black ground
    input: '#334155',
    ring: '#cbd5e1',
  },
} as const;

/**
 * Semantic accent roles ShadCN's slate palette doesn't carry — layered on top of `SHADCN` to give
 * callouts, section eyebrows, key boxes, and inline highlights a colored identity again. Every value
 * is drawn straight from Tailwind's own default color scales (indigo / emerald / amber / red), never
 * a bespoke hue, so the accent stays inside the Tailwind palette.
 *
 * Each role is `{ ink, soft }`, theme-swapped: `ink` is the saturated mid-tone for text, a left
 * accent bar, or a border (Tailwind's 600 in light, 400 in dark — legible on both the page and its
 * own soft fill); `soft` is the tinted surface behind it (the 50 tint in light, the 950 tint in
 * dark, so it never glares on the near-black ground the way a fixed light tint would).
 *
 * `fill` is an optional third, one step *more* saturated than `soft` (the -200 tint in light, a
 * mid-dark -900 in dark), for a band that needs to read unmistakably as the accent where the pale
 * `soft` tint washes out to grey — the CompareCard "Target" footer. Only `brand` carries it today.
 */
export type Role = 'brand' | 'pos' | 'warn' | 'neg';

export const ROLE: {
  light: Record<Role, { ink: string; soft: string; fill?: string }>;
  dark: Record<Role, { ink: string; soft: string; fill?: string }>;
} = {
  light: {
    // Matching the original design: a very pale fill (Tailwind's -100 tint) with a medium ink (-600)
    // for the left bar and title. On the light (slate-100) ground the pale fill still reads clearly
    // as its hue, and the medium ink keeps the accent the same indigo the rest of the doc uses.
    brand: { ink: '#4f46e5', soft: '#e0e7ff', fill: '#c7d2fe' }, // indigo-600 / -100 / -200
    pos: { ink: '#059669', soft: '#d1fae5' }, // emerald-600 / emerald-100
    warn: { ink: '#d97706', soft: '#fef3c7' }, // amber-600 / amber-100
    neg: { ink: '#dc2626', soft: '#fee2e2' }, // red-600 / red-100
  },
  dark: {
    brand: { ink: '#818cf8', soft: '#1e1b4b', fill: '#312e81' }, // indigo-400 / -950 / -900
    pos: { ink: '#34d399', soft: '#022c22' }, // emerald-400 / emerald-950
    warn: { ink: '#fbbf24', soft: '#451a03' }, // amber-400 / amber-950
    neg: { ink: '#f87171', soft: '#450a0a' }, // red-400 / red-950
  },
} as const;
