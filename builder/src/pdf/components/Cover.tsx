import { Text, View } from '@react-pdf/renderer';
import { FONT, useTw } from '../theme.js';
import { Elevated, RADIUS } from './surface.js';

/** The document title band: a muted ShadCN panel with a mono eyebrow, display title, lede, chips. */
export function Cover({
  eyebrow,
  title,
  lede,
  chips,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  chips?: string[];
}): JSX.Element {
  const tw = useTw();
  return (
    <Elevated radius={RADIUS.lg} style={{ marginBottom: 22 }}>
      <View
        style={[
          tw('bg-muted border border-border'),
          { borderRadius: RADIUS.lg, paddingVertical: 22, paddingHorizontal: 26 },
        ]}
      >
        <Text
          style={[
            tw('text-fg-muted uppercase'),
            { fontFamily: FONT.mono, fontSize: 8.5, letterSpacing: 1.2, marginBottom: 10 },
          ]}
        >
          {eyebrow}
        </Text>
        <Text
          style={[
            tw('text-foreground'),
            { fontFamily: FONT.display, fontSize: 30, fontWeight: 700, lineHeight: 1.1, marginBottom: 10 },
          ]}
        >
          {title}
        </Text>
        {lede && (
          <Text style={[tw('text-fg-muted'), { fontSize: 12, lineHeight: 1.5, marginBottom: chips ? 14 : 0 }]}>
            {lede}
          </Text>
        )}
        {chips && (
          <View style={tw('flex-row flex-wrap gap-1.5')}>
            {chips.map((chip, i) => (
              <Text
                key={i}
                style={[
                  tw('bg-card border border-border text-foreground rounded-full'),
                  // lineHeight:1 collapses the font's built-in leading so the glyphs sit in a
                  // tight box the symmetric-ish padding can actually center; paddingTop edges
                  // paddingBottom to sit the x-height on the pill's centerline.
                  { fontSize: 8.5, lineHeight: 1, paddingTop: 4, paddingBottom: 3.5, paddingHorizontal: 9 },
                ]}
              >
                {chip}
              </Text>
            ))}
          </View>
        )}
      </View>
    </Elevated>
  );
}
