import type { ReactNode } from 'react';
import { Text } from '@react-pdf/renderer';
import { FONT, usePalette } from '../theme.js';

/** A body paragraph. Inherits the page ink; adds the inter-paragraph gap. */
export function P({ children }: { children: ReactNode }): JSX.Element {
  return <Text style={{ marginBottom: 9 }}>{children}</Text>;
}

/** Inline bold run inside a paragraph. */
export function B({ children }: { children: ReactNode }): JSX.Element {
  return <Text style={{ fontWeight: 700 }}>{children}</Text>;
}

/** A muted deck / secondary line. */
export function Muted({ children }: { children: ReactNode }): JSX.Element {
  const c = usePalette();
  return <Text style={{ color: c.ink3, marginBottom: 9 }}>{children}</Text>;
}

/** A small mono, uppercase, letter-spaced kicker — the accent (or role-colored) eyebrow. */
export function Eyebrow({ children, color }: { children: ReactNode; color?: string }): JSX.Element {
  const c = usePalette();
  return (
    <Text
      style={{
        fontFamily: FONT.mono,
        fontSize: 8,
        fontWeight: 500,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: color ?? c.accent,
        lineHeight: 1,
        marginBottom: 3,
      }}
    >
      {children}
    </Text>
  );
}
