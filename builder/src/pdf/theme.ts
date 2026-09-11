// react-pdf theme layer. react-pdf has no CSS or custom properties: styles are plain objects with a
// small subset of flexbox/text properties, and fonts must be registered from real font files. This
// module registers the faces once, carries the page geometry, and exposes the ShadCN styling
// boundary — a theme-bound `tw` resolver provided via React context so components read ShadCN
// tokens without prop-drilling (see the boundary section below).

import { createContext, useContext } from 'react';
import { Font } from '@react-pdf/renderer';
import { createTw } from 'react-pdf-tailwind';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { SHADCN, ROLE } from '../theme/palette.js';

const require = createRequire(import.meta.url);

/** Resolve a bundled font file to an absolute path react-pdf can read. */
function font(file: string): string {
  return fileURLToPath(new URL(`../../assets/fonts/${file}`, import.meta.url));
}

/** Resolve an @fontsource Inter face (WOFF; react-pdf reads WOFF) to an absolute path. */
function inter(weight: 400 | 500 | 600 | 700): string {
  return require.resolve(`@fontsource/inter/files/inter-latin-${weight}-normal.woff`);
}

/**
 * The font families components reference. ShadCN's default UI font is Inter, used for both body
 * and headings (a single sans — the vanilla ShadCN choice); code keeps a mono face.
 */
export const FONT = {
  sans: 'Inter',
  mono: 'IBM Plex Mono',
  display: 'Inter',
} as const;

/**
 * The one type scale for the whole document, in PDF points. Sizes live here (not scattered as magic
 * numbers across components) so the doc reads at one consistent scale and a change is a single edit.
 * Anchored on the reference `SourceCard` body (9.5) and the parity artifact's ratios (section title
 * ~1.5×, deck / card body ~0.9×, eyebrow ~0.72× the body).
 */
export const TYPE = {
  /** Section headline. */
  sectionTitle: 15,
  /** Section deck / secondary line under a headline. */
  deck: 8.5,
  /** Base page body (the `Page` default). */
  body: 9.5,
  /** A card's mono header-band title (the shared `Card` header). */
  cardTitle: 9.5,
  /** Muted body text inside a card. */
  cardBody: 9,
  /** Mono uppercase section eyebrow / kicker. */
  eyebrow: 7,
  /** Compare-card column labels. */
  colLabel: 7.5,
  /** Mermaid caption band. */
  caption: 8,
  /** Table header row. */
  tableHeader: 8.5,
  /** Table body cells. */
  tableCell: 9,
  /** QList `Q1`/`Q2` mono marker. */
  qMarker: 7,
  /** Phase big display numeral. */
  phaseNum: 15,
  /** Phase title. */
  phaseTitle: 9.5,
} as const;

let registered = false;
/** Register the faces once (idempotent) — importing this module is enough; render calls this. */
export function registerFonts(): void {
  if (registered) return;
  registered = true;
  // Inter (ShadCN's default sans) serves both `sans` and `display`; register the family once.
  Font.register({
    family: FONT.sans,
    fonts: [
      { src: inter(400), fontWeight: 400 },
      { src: inter(500), fontWeight: 500 },
      { src: inter(600), fontWeight: 600 },
      { src: inter(700), fontWeight: 700 },
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

/**
 * The minimum content-height that must remain below a section headline for it to start on the
 * current page; below this, react-pdf breaks before the headline and pushes it to the next page.
 * Two-fifths (40%) of the usable height — moderate orphan control: a headline is bumped to the next
 * page when it would otherwise start in the bottom two-fifths, keeping a reasonable run of body
 * beneath a headline without leaving pages half-empty. Consumed by `Section`'s header block as its
 * `minPresenceAhead`.
 */
export const HEADLINE_MIN_PRESENCE = CONTENT_HEIGHT * 0.4;

export type PdfTheme = 'light' | 'dark';

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
  const r = ROLE[theme];
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
    // Semantic accent roles (Tailwind indigo/emerald/amber/red, theme-swapped) as object colors so
    // `text-brand-ink`, `bg-brand-soft`, `border-brand-ink`, … resolve. See ROLE in palette.ts.
    // brand also carries `fill` (a stronger violet tint than `soft`, violet-200/-800) → `bg-brand-fill`
    // for the card footer band.
    brand: { ink: r.brand.ink, soft: r.brand.soft, ...(r.brand.fill ? { fill: r.brand.fill } : {}) },
    pos: { ink: r.pos.ink, soft: r.pos.soft },
    warn: { ink: r.warn.ink, soft: r.warn.soft },
    neg: { ink: r.neg.ink, soft: r.neg.soft },
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
