import { Text, View } from '@react-pdf/renderer';
import { FONT, usePalette } from '../theme.js';

/** A muted mono footer, ruled off from the body. */
export function Footer({ lines }: { lines: string[] }): JSX.Element {
  const c = usePalette();
  return (
    <View style={{ marginTop: 26, paddingTop: 12, borderTopColor: c.border, borderTopWidth: 1 }}>
      {lines.map((line, i) => (
        <Text key={i} style={{ fontFamily: FONT.mono, fontSize: 8, color: c.ink3, marginBottom: 2 }}>
          {line}
        </Text>
      ))}
    </View>
  );
}
