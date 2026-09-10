// The typed token module: the ONE surface component code uses to reach color, borders, and
// fonts. Every value is a native-Tailwind arbitrary utility that reads a CSS variable
// (`bg-[var(--surface)]`), so no `tailwind.config` customization is needed and the palette can
// be re-themed at generation time by swapping the variable values. Authors write `t.bg.surface`,
// never a raw hex or var name.

import { PALETTE, FONTS, type TokenName } from './palette.js';

/** camelCase palette key → kebab-case CSS variable name (`accentSoft` → `accent-soft`). */
function toVarName(key: string): string {
  return key.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
}

/**
 * The token surface. `bg`/`text` cover every palette role; `border` exposes the border-specific
 * roles plus the accent/state colors used for tinted card edges; `font` maps the three faces.
 */
export const t = {
  bg: {
    ground: 'bg-[var(--ground)]',
    surface: 'bg-[var(--surface)]',
    surface2: 'bg-[var(--surface2)]',
    accentSoft: 'bg-[var(--accent-soft)]',
    positiveSoft: 'bg-[var(--positive-soft)]',
    negativeSoft: 'bg-[var(--negative-soft)]',
    warningSoft: 'bg-[var(--warning-soft)]',
  },
  text: {
    ink: 'text-[var(--ink)]',
    ink2: 'text-[var(--ink2)]',
    ink3: 'text-[var(--ink3)]',
    accent: 'text-[var(--accent)]',
    positive: 'text-[var(--positive)]',
    negative: 'text-[var(--negative)]',
    warning: 'text-[var(--warning)]',
  },
  border: {
    base: 'border-[var(--border)]',
    strong: 'border-[var(--border-strong)]',
    accent: 'border-[var(--accent)]',
    positive: 'border-[var(--positive)]',
    negative: 'border-[var(--negative)]',
    warning: 'border-[var(--warning)]',
  },
  font: {
    sans: 'font-[var(--font-sans)]',
    mono: 'font-[var(--font-mono)]',
    display: 'font-[var(--font-display)]',
  },
} as const;

/** clsx-style join: keeps truthy string parts, space-separated. */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Escape hatch for places Tailwind classes can't reach — inline `style`, SVG `fill`, mermaid
 * theming: returns the `var(--…)` reference for a palette role.
 */
export function cssVar(name: TokenName): string {
  return `var(--${toVarName(name)})`;
}

function declarations(theme: 'light' | 'dark'): string {
  return Object.entries(PALETTE[theme])
    .map(([key, hex]) => `--${toVarName(key)}:${hex}`)
    .join(';');
}

/**
 * The generation-time theme block: light palette on `:root`, dark overrides under
 * `[data-theme=dark]`, and the body font. Baked into the HTML skeleton so the chosen theme is
 * static — no runtime JS toggles it.
 */
export function themeStyleBlock(): string {
  const fonts = `--font-sans:${FONTS.sans};--font-mono:${FONTS.mono};--font-display:${FONTS.display}`;
  return (
    '<style>' +
    `:root{${declarations('light')};${fonts}}` +
    `[data-theme=dark]{${declarations('dark')}}` +
    'body{font-family:var(--font-sans)}' +
    '</style>'
  );
}
