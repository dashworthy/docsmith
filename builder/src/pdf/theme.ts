// react-pdf theme layer. Unlike the HTML path (Tailwind arbitrary utilities reading CSS
// variables), react-pdf has no CSS or custom properties: styles are plain objects with a small
// subset of flexbox/text properties, and fonts must be registered from real TTF/OTF files. This
// module registers the three faces once and exposes the palette (reused verbatim from the HTML
// path's single source of truth) through a React context so components read theme colors without
// prop-drilling.

import { createContext, useContext } from 'react';
import { Font } from '@react-pdf/renderer';
import { createTw } from 'react-pdf-tailwind';
import { fileURLToPath } from 'node:url';
import { PALETTE, SHADCN, type TokenName } from '../theme/palette.js';

/** Resolve a bundled font file to an absolute path react-pdf can read. */
function font(file: string): string {
  return fileURLToPath(new URL(`../../assets/fonts/${file}`, import.meta.url));
}

/** The three font families, by the names components reference in `fontFamily`. */
export const FONT = {
  sans: 'IBM Plex Sans',
  mono: 'IBM Plex Mono',
  display: 'Familjen Grotesk',
} as const;

let registered = false;
/** Register the faces once (idempotent) — importing this module is enough; render calls this. */
export function registerFonts(): void {
  if (registered) return;
  registered = true;
  Font.register({
    family: FONT.sans,
    fonts: [
      { src: font('IBMPlexSans-Regular.ttf'), fontWeight: 400 },
      { src: font('IBMPlexSans-Medium.ttf'), fontWeight: 500 },
      { src: font('IBMPlexSans-SemiBold.ttf'), fontWeight: 600 },
      { src: font('IBMPlexSans-Bold.ttf'), fontWeight: 700 },
    ],
  });
  Font.register({
    family: FONT.mono,
    fonts: [
      { src: font('IBMPlexMono-Regular.ttf'), fontWeight: 400 },
      { src: font('IBMPlexMono-Medium.ttf'), fontWeight: 500 },
      { src: font('IBMPlexMono-SemiBold.ttf'), fontWeight: 600 },
      { src: font('IBMPlexMono-Bold.ttf'), fontWeight: 700 },
    ],
  });
  Font.register({
    family: FONT.display,
    fonts: [
      { src: font('FamiljenGrotesk-SemiBold.ttf'), fontWeight: 600 },
      { src: font('FamiljenGrotesk-Bold.ttf'), fontWeight: 700 },
    ],
  });
  // react-pdf hyphenates at line breaks by default, which mangles technical identifiers
  // (`ConfiguratorProductsController`). Disable it: never split a word.
  Font.registerHyphenationCallback((word) => [word]);
}

/**
 * Page geometry, in PDF points. Shared by `PdfDoc` (which applies the padding) and the
 * presentation rules that reason about vertical position (e.g. the "headline not below the 50%
 * line" rule needs the content height to know where the midpoint is).
 */
export const PAGE = {
  /** A4 height in points. */
  height: 841.89,
  paddingV: 48,
  paddingH: 46,
} as const;

/** Usable content height between the top and bottom page padding. */
export const CONTENT_HEIGHT = PAGE.height - PAGE.paddingV * 2;

/** The vertical midpoint of the content area — half the usable height. */
export const HALF_CONTENT = CONTENT_HEIGHT / 2;

export type PdfTheme = 'light' | 'dark';

/** The resolved palette for the active theme — the exact-hex map, keyed by role. */
export type Palette = Record<TokenName, string>;

const ThemeContext = createContext<Palette>(PALETTE.light);

export const ThemeProvider = ThemeContext.Provider;

/** Read the active theme's palette inside any component under a `PdfDoc`. */
export function usePalette(): Palette {
  return useContext(ThemeContext);
}

/** The palette map for a theme (light/dark) — the value fed to `ThemeProvider`. */
export function paletteFor(theme: PdfTheme): Palette {
  return PALETTE[theme];
}

// ── ShadCN styling boundary (react-pdf-tailwind) ─────────────────────────────
// Components reach styling through one primitive: `useTw()`, a theme-bound class→style
// resolver provided once by `PdfDoc`. They write ShadCN semantic Tailwind classes
// (`bg-card`, `text-muted-foreground`, `border`, `rounded-lg`, …) and never see the engine,
// the points units, or which theme is active — all hidden here. See
// `.engineering/<run>/signal/interface-styling-theme.md` for the shape's rationale.

/** react-pdf-tailwind config for a theme — the thing `createTw` consumes. */
type TwConfig = Parameters<typeof createTw>[0];
/** A themed class→style resolver. `tw('bg-card p-4')` → a react-pdf style object. */
export type Tw = ReturnType<typeof createTw>;

/**
 * The ShadCN token palette shaped for react-pdf-tailwind's resolver.
 *
 * react-pdf-tailwind reads the *last* hyphen segment of a class as a shade and does not honour a
 * color's `DEFAULT`. So a **string** color resolves the bare utility (`bg-card`) but never
 * `X-foreground` (the trailing `-foreground` is read as a missing shade and falls back to the
 * base); an **object** color resolves its shades (`text-card-foreground`) but not the bare base
 * (no `DEFAULT`). The two are mutually exclusive for one key.
 *
 * So the base tokens stay flat strings — `bg-card`, `bg-muted`, `bg-primary`, `text-foreground`,
 * `border`, … all resolve, vanilla. The surface-foreground tokens live as shades of one `fg`
 * color, so ShadCN's `text-muted-foreground` is written `text-fg-muted` here (and
 * `text-primary-foreground` → `text-fg-primary`, etc.). Values are exactly vanilla ShadCN; only
 * the foreground *class spelling* diverges, forced by the library.
 */
function shadcnColors(theme: PdfTheme): Record<string, string | Record<string, string>> {
  const c = SHADCN[theme];
  return {
    background: c.background,
    foreground: c.foreground,
    card: c.card,
    popover: c.popover,
    primary: c.primary,
    secondary: c.secondary,
    muted: c.muted,
    accent: c.accent,
    destructive: c.destructive,
    border: c.border,
    input: c.input,
    ring: c.ring,
    // Foreground-on-surface tokens as shades of `fg` → `text-fg-muted`, `text-fg-primary`, …
    fg: {
      card: c['card-foreground'],
      popover: c['popover-foreground'],
      primary: c['primary-foreground'],
      secondary: c['secondary-foreground'],
      muted: c['muted-foreground'],
      accent: c['accent-foreground'],
      destructive: c['destructive-foreground'],
    },
  };
}

/**
 * The react-pdf-tailwind config for a theme: the vanilla ShadCN token palette wired into
 * Tailwind's color scale. Light/dark is a per-render selection here because react-pdf-tailwind
 * supports neither CSS variables nor the `dark:` variant — the theme picks the resolved token set.
 */
export function shadcnConfig(theme: PdfTheme): TwConfig {
  return { theme: { extend: { colors: shadcnColors(theme) } } } as TwConfig;
}

const TwContext = createContext<Tw>(createTw(shadcnConfig('light')));

/** Provides the theme-bound `tw` to every component under a `PdfDoc`. */
export const TwProvider = TwContext.Provider;

/** Read the active theme's `tw` resolver inside any component under a `PdfDoc`. */
export function useTw(): Tw {
  return useContext(TwContext);
}
