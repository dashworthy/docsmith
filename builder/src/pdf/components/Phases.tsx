import { Text, View } from '@react-pdf/renderer';
import { useTw } from '../theme.js';

interface Phase {
  idx: string;
  title: string;
  body: string;
  /** A parallel phase gets a neutral (muted) chip instead of the solid primary one. */
  parallel?: boolean;
}

/** An ordered list of phases: a numbered chip beside a bold title and a muted body. */
export function Phases({ items }: { items: Phase[] }): JSX.Element {
  const tw = useTw();
  return (
    <View>
      {items.map((p, i) => (
        <View key={i} wrap={false} style={tw('flex-row gap-2.5 mb-2.5')}>
          <View
            style={[
              tw(p.parallel ? 'bg-muted' : 'bg-primary'),
              { width: 26, height: 26, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
            ]}
          >
            <Text style={[tw(p.parallel ? 'text-fg-muted' : 'text-fg-primary'), { fontWeight: 700, fontSize: 11 }]}>
              {p.idx}
            </Text>
          </View>
          <View style={tw('flex-1')}>
            <Text style={[tw('text-foreground'), { fontWeight: 600, fontSize: 11, marginBottom: 2 }]}>{p.title}</Text>
            <Text style={[tw('text-fg-muted'), { fontSize: 9.5 }]}>{p.body}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
