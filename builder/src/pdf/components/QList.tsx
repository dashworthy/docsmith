import type { ReactNode } from 'react';
import { Text, View } from '@react-pdf/renderer';
import { FONT, useTw } from '../theme.js';

/** A numbered question/step list — each item prefixed with a primary `Q1`, `Q2`, … marker. */
export function QList({ items }: { items: ReactNode[] }): JSX.Element {
  const tw = useTw();
  return (
    <View style={{ marginBottom: 6 }}>
      {items.map((item, i) => (
        <View key={i} wrap={false} style={tw('flex-row gap-2 mb-1.5')}>
          <Text style={[tw('text-primary'), { fontWeight: 700, fontFamily: FONT.mono, fontSize: 9.5 }]}>{`Q${i + 1}`}</Text>
          <Text style={[tw('flex-1 text-fg-muted'), { fontSize: 10 }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}
