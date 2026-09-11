import { Text, View } from '@react-pdf/renderer';
import { usePalette } from '../theme.js';

type Role = 'accent' | 'positive' | 'negative' | 'warning' | 'neutral';

/** A role-tint key: a row of colored dots with their labels. */
export function Legend({ items }: { items: { role: Role; label: string }[] }): JSX.Element {
  const c = usePalette();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 10 }}>
      {items.map((it, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <View
            style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: it.role === 'neutral' ? c.ink3 : c[it.role] }}
          />
          <Text style={{ color: c.ink2, fontSize: 9.5 }}>{it.label}</Text>
        </View>
      ))}
    </View>
  );
}
