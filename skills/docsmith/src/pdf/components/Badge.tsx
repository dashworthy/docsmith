import type { ReactNode } from 'react';
import { Text, View } from '@react-pdf/renderer';
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
 * A status pill, mirroring ShadCN's base Badge (`inline-flex items-center rounded-md border px-2
 * py-0.5`). react-pdf has no inline-flex, so this is a block `<View>` — the only layout mode that
 * honours the box model (padding + borderRadius); a nested inline `<Text>` silently drops both and
 * paints only its background. `alignSelf: flex-start` keeps it `w-fit`. Because it is a View it
 * cannot flow mid-sentence: place it on its own line, or in a `flexDirection: row` container (see
 * the gallery). For inline-in-prose emphasis, use plain styled text instead.
 */
export function Badge({ role = 'neutral', children }: { role?: Role; children: ReactNode }): JSX.Element {
  const tw = useTw();
  return (
    <View style={[tw(ROLE[role]), { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }]}>
      <Text style={{ fontSize: 8.5, lineHeight: 1.2 }}>{children}</Text>
    </View>
  );
}
