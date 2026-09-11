import type { ReactNode } from 'react';
import { Text } from '@react-pdf/renderer';
import { FONT, useTw } from '../theme.js';

/** A body paragraph. Inherits the page ink; adds the inter-paragraph gap. */
export function P({ children }: { children: ReactNode }): JSX.Element {
  const tw = useTw();
  return <Text style={tw('mb-2')}>{children}</Text>;
}

/** Inline bold run inside a paragraph. */
export function B({ children }: { children: ReactNode }): JSX.Element {
  const tw = useTw();
  return <Text style={tw('font-bold')}>{children}</Text>;
}

/** A muted deck / secondary line — ShadCN's `text-muted-foreground`. */
export function Muted({ children }: { children: ReactNode }): JSX.Element {
  const tw = useTw();
  return <Text style={tw('text-fg-muted mb-2')}>{children}</Text>;
}

/**
 * A small mono, uppercase, letter-spaced kicker. Defaults to the ShadCN `primary` ink (the
 * agreed note/info role); a role-colored eyebrow passes an explicit `color`. The mono family and
 * exact letter-spacing are raw style — react-pdf-tailwind resolves neither from our token config.
 */
export function Eyebrow({ children, color }: { children: ReactNode; color?: string }): JSX.Element {
  const tw = useTw();
  return (
    <Text
      style={[
        tw('text-[8px] font-medium uppercase'),
        { fontFamily: FONT.mono, letterSpacing: 1, lineHeight: 1, marginBottom: 3, color: color ?? tw('text-primary').color },
      ]}
    >
      {children}
    </Text>
  );
}
