import { Text, View } from '@react-pdf/renderer';
import { useTw } from '../theme.js';

/** A struck-through list of things explicitly out of scope. */
export function NonGoals({ items }: { items: string[] }): JSX.Element {
  const tw = useTw();
  return (
    <View>
      {items.map((item, i) => (
        <View key={i} style={tw('flex-row gap-1.5 mb-1')}>
          <Text style={[tw('text-destructive'), { fontSize: 10 }]}>✕</Text>
          <Text style={[tw('flex-1 text-fg-muted'), { fontSize: 10, textDecoration: 'line-through' }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}
