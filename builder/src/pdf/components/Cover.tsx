import { Text, View } from '@react-pdf/renderer';
import { FONT, usePalette } from '../theme.js';
import { Elevated, RADIUS } from './surface.js';

/** The document title band: a soft surface panel with a mono eyebrow, display title, lede, chips. */
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
  const c = usePalette();
  return (
    <Elevated radius={RADIUS.lg} style={{ marginBottom: 22 }}>
    <View
      style={{
        backgroundColor: c.surface2,
        borderColor: c.borderStrong,
        borderWidth: 1,
        borderRadius: RADIUS.lg,
        paddingVertical: 22,
        paddingHorizontal: 26,
      }}
    >
      <Text
        style={{
          fontFamily: FONT.mono,
          fontSize: 8.5,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: c.ink3,
          marginBottom: 10,
        }}
      >
        {eyebrow}
      </Text>
      <Text
        style={{ fontFamily: FONT.display, fontSize: 30, fontWeight: 700, lineHeight: 1.1, color: c.ink, marginBottom: 10 }}
      >
        {title}
      </Text>
      {lede && (
        <Text style={{ fontSize: 12, color: c.ink2, lineHeight: 1.5, marginBottom: chips ? 14 : 0 }}>{lede}</Text>
      )}
      {chips && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {chips.map((chip, i) => (
            <Text
              key={i}
              style={{
                fontSize: 8.5,
                color: c.ink2,
                backgroundColor: c.surface,
                borderColor: c.border,
                borderWidth: 1,
                borderRadius: 20,
                paddingVertical: 3,
                paddingHorizontal: 9,
              }}
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
