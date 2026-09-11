import type { ReactNode } from 'react';
import { Text } from '@react-pdf/renderer';
import { useTw } from '../theme.js';

type Role = 'neutral' | 'accent' | 'positive' | 'negative' | 'warning';

/**
 * Role → a vanilla ShadCN Badge variant (solid fill + its foreground). `neutral`/`accent`/`negative`
 * are the stock `secondary`/`default`/`destructive` variants; `positive`/`warning` fill the gap with
 * solid Tailwind emerald/amber + white ink (the agreed role palette).
 */
const ROLE: Record<Role, string> = {
  neutral: 'bg-secondary text-fg-secondary',
  accent: 'bg-primary text-fg-primary',
  positive: 'bg-emerald-600 text-white',
  negative: 'bg-destructive text-fg-destructive',
  warning: 'bg-amber-600 text-white',
};

/**
 * An inline status pill. Rendered as a nested `<Text>` (not a `<View>`) so it flows inline inside a
 * paragraph's text — react-pdf lays a styled Text inline with its background, where a View would break.
 */
export function Badge({ role = 'neutral', children }: { role?: Role; children: ReactNode }): JSX.Element {
  const tw = useTw();
  return (
    <Text style={[tw(ROLE[role]), { fontSize: 8.5, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 }]}>
      {children}
    </Text>
  );
}
