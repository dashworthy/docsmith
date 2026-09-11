import { Text, View } from '@react-pdf/renderer';
import { usePalette } from '../theme.js';

interface Phase {
  idx: string;
  title: string;
  body: string;
  /** A parallel phase gets a neutral chip instead of the accent one. */
  parallel?: boolean;
}

/** An ordered list of phases: a numbered chip beside a bold title and a muted body. */
export function Phases({ items }: { items: Phase[] }): JSX.Element {
  const c = usePalette();
  return (
    <View>
      {items.map((p, i) => (
        <View key={i} wrap={false} style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
          <View
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              backgroundColor: p.parallel ? c.surface2 : c.accentSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: p.parallel ? c.ink3 : c.accent, fontWeight: 700, fontSize: 11 }}>{p.idx}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.ink, fontWeight: 600, fontSize: 11, marginBottom: 2 }}>{p.title}</Text>
            <Text style={{ color: c.ink2, fontSize: 9.5 }}>{p.body}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
