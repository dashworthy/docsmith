import type { ReactNode } from 'react';
import { Text, View } from '@react-pdf/renderer';
import { TYPE, useTw } from '../theme.js';

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
 * facts alike are all a `KeyBox`, presented one way: a white (card) panel framed by the ShadCN
 * border, with a flush thick left accent bar (square left corners, only the right softened), a bold
 * role-colored `title`, and body `children`. `role` picks the color, which shows in the bar + title
 * only — the panel itself stays white and framed so the boxes read as clean cards. The title is
 * always explicit (there is no auto-label), so a "Note" and a "Dead end — zero results" differ only
 * in role and wording, never in shape.
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
        // The panel is the white card surface framed by the ShadCN border; the role identity lives in
        // the thick left bar + title ink, so the box reads as a clean framed card, not a colored block.
        tw('bg-card'),
        {
          borderColor: tw('border-border').borderColor as string,
          borderWidth: 1,
          // The left edge is the role accent bar — a thicker, role-colored override of the frame.
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
      <Text style={[tw(`text-${t}-ink`), { fontWeight: 700, fontSize: TYPE.cardTitle, marginBottom: 2 }]}>{title}</Text>
      <Text style={[tw('text-foreground'), { fontSize: TYPE.cardBody }]}>{children}</Text>
    </View>
  );
}
