import { Text, View } from '@react-pdf/renderer';
import { FONT, TYPE, useTw } from '../theme.js';

interface Item {
  text: string;
  done?: boolean;
}

/**
 * A task checklist — distinct from `QList` (numbered questions) and `NonGoals` (struck-through
 * exclusions). A done item gets a filled emerald box with a ✓ and muted, settled text; a pending
 * item gets an empty bordered box and full-strength ink. The box uses the positive role token, so
 * the "done" green holds on both theme grounds without a hardcoded tint.
 */
export function Checklist({ items }: { items: Item[] }): JSX.Element {
  const tw = useTw();
  return (
    <View style={{ marginBottom: 10 }}>
      {items.map((it, i) => (
        <View key={i} style={[tw('flex-row items-center'), { marginBottom: 6 }]}>
          {it.done ? (
            <View
              style={[
                tw('bg-pos-ink'),
                { width: 13, height: 13, borderRadius: 3, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
              ]}
            >
              <Text style={[tw('text-white'), { fontFamily: FONT.mono, fontSize: 8.5, lineHeight: 1 }]}>✓</Text>
            </View>
          ) : (
            <View
              style={{
                width: 13,
                height: 13,
                borderRadius: 3,
                borderWidth: 1.2,
                borderColor: tw('border-border').borderColor as string,
                marginRight: 8,
              }}
            />
          )}
          <Text style={[tw(it.done ? 'text-fg-muted' : 'text-foreground'), { fontSize: TYPE.cardBody }]}>{it.text}</Text>
        </View>
      ))}
    </View>
  );
}
