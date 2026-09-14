import { Text, View } from '@react-pdf/renderer';
import { useTw } from '../theme.js';

type Role = 'accent' | 'positive' | 'negative' | 'warning' | 'neutral';

/** Role → its dot fill class, from the agreed role palette (`neutral` = the muted-foreground ink). */
const DOT: Record<Role, string> = {
  accent: 'bg-primary',
  positive: 'bg-emerald-600',
  negative: 'bg-destructive',
  warning: 'bg-amber-600',
  neutral: 'bg-fg-muted',
};

/** A role-tint key: a row of colored dots with their labels. */
export function Legend({ items }: { items: { role: Role; label: string }[] }): JSX.Element {
  const tw = useTw();
  return (
    <View style={tw('flex-row flex-wrap gap-3.5 mb-2.5')}>
      {items.map((it, i) => (
        <View key={i} style={tw('flex-row items-center gap-1.5')}>
          <View style={[tw(DOT[it.role]), { width: 8, height: 8, borderRadius: 4 }]} />
          <Text style={[tw('text-fg-muted'), { fontSize: 9.5 }]}>{it.label}</Text>
        </View>
      ))}
    </View>
  );
}
