import type { ReactNode } from 'react';
import { Text, View } from '@react-pdf/renderer';
import { TYPE, useTw } from '../theme.js';

type Role = 'accent' | 'positive' | 'warning' | 'negative';

/** Role → its `ROLE` token stem (blue/emerald/amber/red), theme-swapped. */
const TONE: Record<Role, 'brand' | 'pos' | 'warn' | 'neg'> = {
  accent: 'brand',
  positive: 'pos',
  warning: 'warn',
  negative: 'neg',
};

/**
 * A full-width alert banner — a role-tinted strip for a single prominent message, distinct from
 * `KeyBox` (a white card with a left bar). The whole band takes the role's soft fill with a matching
 * ink border and ink title, so it reads as one saturated notice. Both the fill and border are role
 * tokens, so the banner keeps its identity on the dark ground without any fixed light tint.
 */
export function Banner({ role, title, children }: { role: Role; title: string; children?: ReactNode }): JSX.Element {
  const tw = useTw();
  const t = TONE[role];
  return (
    <View
      wrap={false}
      style={[
        tw(`bg-${t}-soft`),
        {
          borderColor: tw(`text-${t}-ink`).color as string,
          borderWidth: 1,
          borderRadius: 8,
          paddingVertical: 9,
          paddingHorizontal: 13,
          marginBottom: 10,
        },
      ]}
    >
      <Text style={[tw(`text-${t}-ink`), { fontWeight: 700, fontSize: TYPE.cardTitle, marginBottom: children ? 2 : 0 }]}>{title}</Text>
      {children && <Text style={[tw('text-foreground'), { fontSize: TYPE.cardBody }]}>{children}</Text>}
    </View>
  );
}
