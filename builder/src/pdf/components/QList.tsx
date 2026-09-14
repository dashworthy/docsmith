import type { ReactNode } from 'react';
import { Text, View } from '@react-pdf/renderer';
import { FONT, TYPE, useTw } from '../theme.js';

/**
 * A numbered question list matching the original design's `.oq`: each item is a row divided from
 * the one above by a top rule (the first has none), with a small mono, accent `Q1`/`Q2` marker in a
 * fixed gutter and muted body text.
 */
export function QList({ items }: { items: ReactNode[] }): JSX.Element {
  const tw = useTw();
  return (
    <View style={{ marginBottom: 6 }}>
      {items.map((item, i) => (
        <View
          key={i}
          wrap={false}
          style={[
            tw('flex-row'),
            {
              paddingVertical: 7,
              ...(i > 0 ? { borderTopWidth: 1, borderTopColor: tw('border-border').borderColor } : {}),
            },
          ]}
        >
          <Text style={[tw('text-brand-ink'), { width: 20, fontWeight: 700, fontFamily: FONT.mono, fontSize: TYPE.qMarker, marginTop: 1.5 }]}>
            {`Q${i + 1}`}
          </Text>
          <Text style={[tw('flex-1 text-fg-muted'), { fontSize: TYPE.cardBody }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}
