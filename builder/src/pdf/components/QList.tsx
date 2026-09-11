import type { ReactNode } from 'react';
import { Text, View } from '@react-pdf/renderer';
import { FONT, usePalette } from '../theme.js';

/** A numbered question/step list — each item prefixed with an accent `Q1`, `Q2`, … marker. */
export function QList({ items }: { items: ReactNode[] }): JSX.Element {
  const c = usePalette();
  return (
    <View style={{ marginBottom: 6 }}>
      {items.map((item, i) => (
        <View key={i} wrap={false} style={{ flexDirection: 'row', gap: 8, marginBottom: 7 }}>
          <Text style={{ color: c.accent, fontWeight: 700, fontFamily: FONT.mono, fontSize: 9.5 }}>{`Q${i + 1}`}</Text>
          <Text style={{ flex: 1, color: c.ink2, fontSize: 10 }}>{item}</Text>
        </View>
      ))}
    </View>
  );
}
