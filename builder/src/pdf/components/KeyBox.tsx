import type { ReactNode } from 'react';
import { Text, View } from '@react-pdf/renderer';
import { useTw } from '../theme.js';

type Role = 'accent' | 'positive' | 'warning' | 'negative';

/**
 * Role → an accent role from the `ROLE` palette (Tailwind indigo/emerald/amber/red, theme-swapped):
 * `accent` = indigo brand (notes, neutral facts), `positive` = emerald (tips), `warning` = amber,
 * `negative` = red (dead ends, cautions).
 */
const TONE: Record<Role, 'brand' | 'pos' | 'warn' | 'neg'> = {
  accent: 'brand',
  positive: 'pos',
  warning: 'warn',
  negative: 'neg',
};

/**
 * The one standardized admonition for the whole set — Note, Important, Tip, warnings, and labeled
 * facts alike are all a `KeyBox`, presented one way: a soft role-tinted panel with a flush left
 * accent bar (square left corners, only the right softened), a bold role-colored `title`, and body
 * `children`. `role` picks the color; the title is always explicit (there is no auto-label), so a
 * "Note" and a "Dead end — zero results" differ only in role and wording, never in shape.
 */
export function KeyBox({
  role,
  title,
  children,
}: {
  role: Role;
  title: string;
  children: ReactNode;
}): JSX.Element {
  const tw = useTw();
  const t = TONE[role];
  return (
    <View
      wrap={false}
      style={[
        // The fill is a light tint of the same hue as the accent bar (see ROLE `soft`), so the panel
        // reads as clearly colored against the ground while the bar + title carry the saturated ink.
        tw(`bg-${t}-soft`),
        {
          borderLeftColor: tw(`text-${t}-ink`).color as string,
          borderLeftWidth: 4,
          borderTopRightRadius: 6,
          borderBottomRightRadius: 6,
          paddingVertical: 9,
          paddingHorizontal: 13,
          marginBottom: 10,
        },
      ]}
    >
      <Text style={[tw(`text-${t}-ink`), { fontWeight: 700, fontSize: 10.5, marginBottom: 2 }]}>{title}</Text>
      <Text style={[tw('text-foreground'), { fontSize: 10 }]}>{children}</Text>
    </View>
  );
}
