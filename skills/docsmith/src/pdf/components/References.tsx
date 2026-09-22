import type { ReactNode } from 'react';
import { Text, View } from '@react-pdf/renderer';
import { FONT, TYPE, useTw } from '../theme.js';

/**
 * A numbered reference / footnote list — the sources block at the foot of a doc. Each entry is a
 * mono brand-ink marker (matching the `Ref` superscript that cites it) beside muted body text, so a
 * citation and its footnote share one visual key. Markers are 1-based by position.
 */
export function References({ items }: { items: ReactNode[] }): JSX.Element {
  const tw = useTw();
  return (
    <View style={{ marginBottom: 10 }}>
      {items.map((text, i) => (
        <View key={i} style={[tw('flex-row'), { marginBottom: 5 }]}>
          <Text style={[tw('text-brand-ink'), { width: 18, fontFamily: FONT.mono, fontSize: TYPE.eyebrow + 1 }]}>{`${i + 1}.`}</Text>
          <Text style={[tw('text-fg-muted'), { flex: 1, fontSize: TYPE.cardBody }]}>{text}</Text>
        </View>
      ))}
    </View>
  );
}

/**
 * The inline citation that pairs with `References` — a small mono brand-ink superscript marker
 * placed after a word or clause. `n` is the 1-based index into the matching `References` list.
 */
export function Ref({ n }: { n: number }): JSX.Element {
  const tw = useTw();
  return (
    <Text style={[tw('text-brand-ink'), { fontFamily: FONT.mono, fontSize: TYPE.eyebrow - 1, verticalAlign: 'super' }]}>
      {`[${n}]`}
    </Text>
  );
}
