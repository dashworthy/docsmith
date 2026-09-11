import { Text, View } from '@react-pdf/renderer';
import { usePalette } from '../theme.js';

/** A struck-through list of things explicitly out of scope. */
export function NonGoals({ items }: { items: string[] }): JSX.Element {
  const c = usePalette();
  return (
    <View>
      {items.map((item, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 6, marginBottom: 4 }}>
          <Text style={{ color: c.negative, fontSize: 10 }}>✕</Text>
          <Text style={{ flex: 1, color: c.ink3, fontSize: 10, textDecoration: 'line-through' }}>{item}</Text>
        </View>
      ))}
    </View>
  );
}
