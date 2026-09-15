import type { ReactNode } from 'react';
import { Text } from '@react-pdf/renderer';
import { useTw } from '../theme.js';

type Role = 'neutral' | 'accent' | 'positive' | 'negative' | 'warning';

/**
 * Role → a Badge variant. `accent` is the soft-blue highlight (Tailwind `brand`: soft fill +
 * blue ink) used to call out an inline value without the harsh contrast of a solid dark pill;
 * `neutral` stays the stock ShadCN `secondary`. `positive`/`warning`/`negative` fill the gap with
 * solid Tailwind emerald/amber/destructive (the agreed role palette).
 */
const ROLE: Record<Role, string> = {
  neutral: 'bg-secondary text-fg-secondary',
  accent: 'bg-brand-soft text-brand-ink',
  positive: 'bg-emerald-600 text-white',
  negative: 'bg-destructive text-fg-destructive',
  warning: 'bg-amber-600 text-white',
};

/**
 * An inline status pill. Rendered as a nested `<Text>` (not a `<View>`) so it flows inline inside a
 * paragraph's text — react-pdf lays a styled Text inline with its background, where a View would break.
 * The horizontal padding + radius give the highlight room to breathe instead of crowding the glyphs.
 */
export function Badge({ role = 'neutral', children }: { role?: Role; children: ReactNode }): JSX.Element {
  const tw = useTw();
  return (
    <Text style={[tw(ROLE[role]), { fontSize: 8.5, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 }]}>
      {children}
    </Text>
  );
}
