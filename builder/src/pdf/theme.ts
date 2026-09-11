// react-pdf theme layer. Unlike the HTML path (Tailwind arbitrary utilities reading CSS
// variables), react-pdf has no CSS or custom properties: styles are plain objects with a small
// subset of flexbox/text properties, and fonts must be registered from real TTF/OTF files. This
// module registers the three faces once and exposes the palette (reused verbatim from the HTML
// path's single source of truth) through a React context so components read theme colors without
// prop-drilling.

import { createContext, useContext } from 'react';
import { Font } from '@react-pdf/renderer';
import { fileURLToPath } from 'node:url';
import { PALETTE, type TokenName } from '../theme/palette.js';

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
