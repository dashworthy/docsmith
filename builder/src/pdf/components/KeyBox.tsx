import type { ReactNode } from 'react';
import { Text, View } from '@react-pdf/renderer';
import { useTw } from '../theme.js';

type Role = 'accent' | 'positive' | 'negative' | 'warning';

/**
 * Role → its color class for the left rule and the key, from the agreed role palette. Vanilla
 * ShadCN has no soft-tint tokens, and a fixed Tailwind tint (`emerald-50`) would glare in the dark
 * theme (react-pdf-tailwind has no `dark:`). So the box fills with the theme-safe `muted` token and
 * carries the role only in the rule + key — the same fill-less treatment the Callout Alert uses.
 */
const ROLE: Record<Role, { text: string; border: string }> = {
  accent: { text: 'text-primary', border: 'border-primary' },
  positive: { text: 'text-emerald-600', border: 'border-emerald-600' },
  negative: { text: 'text-destructive', border: 'border-destructive' },
  warning: { text: 'text-amber-600', border: 'border-amber-600' },
};

/** A labeled fact: a muted panel with a role-colored left rule, a bold role-colored key, muted value. */
export function KeyBox({ role, k, v }: { role: Role; k: string; v: ReactNode }): JSX.Element {
  const tw = useTw();
  const r = ROLE[role];
  return (
    <View
      wrap={false}
      style={[
        tw('bg-muted'),
        {
          borderLeftColor: tw(r.border).borderColor,
          borderLeftWidth: 4,
          borderTopRightRadius: 6,
          borderBottomRightRadius: 6,
          paddingVertical: 9,
          paddingHorizontal: 13,
          marginBottom: 8,
        },
      ]}
    >
      <Text style={[tw(r.text), { fontWeight: 700, fontSize: 10, marginBottom: 2 }]}>{k}</Text>
      <Text style={[tw('text-fg-muted'), { fontSize: 9.5 }]}>{v}</Text>
    </View>
  );
}
