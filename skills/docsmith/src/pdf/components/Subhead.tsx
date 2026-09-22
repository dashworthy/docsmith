import { Text, View } from '@react-pdf/renderer';
import { FONT, TYPE, useTw } from '../theme.js';

/**
 * A subsection heading (h3) for dividing a `Section` body into labeled parts — a step below the
 * Section title, so a long section reads as a few named runs rather than one wall. A bold display
 * title over an optional hairline `rule`, with an optional muted supporting line. `wrap={false}`
 * plus a modest `minPresenceAhead` keep it from being stranded at the foot of a page, ahead of its
 * content. Sits in the content flow (no eyebrow) — that structural kicker belongs to `Section`.
 */
export function Subhead({ title, deck, rule = true }: { title: string; deck?: string; rule?: boolean }): JSX.Element {
  const tw = useTw();
  return (
    <View wrap={false} minPresenceAhead={54} style={{ marginTop: 16, marginBottom: deck ? 6 : 9 }}>
      <Text
        style={[
          tw('text-foreground'),
          { fontFamily: FONT.display, fontWeight: 700, fontSize: TYPE.subhead, lineHeight: 1.2, marginBottom: rule ? 5 : deck ? 3 : 0 },
        ]}
      >
        {title}
      </Text>
      {rule && <View style={{ borderTopColor: tw('border-border').borderColor as string, borderTopWidth: 1, marginBottom: deck ? 6 : 0 }} />}
      {deck && <Text style={[tw('text-fg-muted'), { fontSize: TYPE.deck }]}>{deck}</Text>}
    </View>
  );
}
