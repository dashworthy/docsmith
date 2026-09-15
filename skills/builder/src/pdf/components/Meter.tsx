import { Text, View } from '@react-pdf/renderer';
import { FONT, TYPE, useTw } from '../theme.js';

type Role = 'accent' | 'positive' | 'warning' | 'negative';

interface Bar {
  label: string;
  /** Fill fraction as a percentage 0–100. */
  value: number;
  role?: Role;
  /** Optional right-aligned value text; defaults to `${value}%`. */
  display?: string;
}

/** Role → its `ROLE` token stem (blue/emerald/amber/red), theme-swapped. */
const TONE: Record<Role, 'brand' | 'pos' | 'warn' | 'neg'> = {
  accent: 'brand',
  positive: 'pos',
  warning: 'warn',
  negative: 'neg',
};

/**
 * Labeled progress meters — coverage, budget, any 0–100 fraction. Each row is a label + value
 * caption over a rounded track: the track is the role's soft tint, the fill the role's ink, so the
 * pair stays legible in both themes (soft fills survive the dark ground) without any hardcoded
 * light tint. `value` is clamped to 0–100.
 */
export function Meter({ items }: { items: Bar[] }): JSX.Element {
  const tw = useTw();
  return (
    <View style={{ marginBottom: 10 }}>
      {items.map((b, i) => {
        const t = TONE[b.role ?? 'accent'];
        const pct = Math.max(0, Math.min(100, b.value));
        return (
          <View key={i} wrap={false} style={{ marginBottom: 9 }}>
            <View style={[tw('flex-row'), { justifyContent: 'space-between', marginBottom: 4 }]}>
              <Text style={[tw('text-foreground'), { fontSize: TYPE.cardBody }]}>{b.label}</Text>
              <Text style={[tw('text-fg-muted'), { fontFamily: FONT.mono, fontSize: TYPE.eyebrow + 1 }]}>
                {b.display ?? `${Math.round(pct)}%`}
              </Text>
            </View>
            <View style={[tw(`bg-${t}-soft`), { height: 7, borderRadius: 4 }]}>
              <View style={[tw(`bg-${t}-ink`), { width: `${pct}%`, height: 7, borderRadius: 4 }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}
