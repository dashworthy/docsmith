import { Text, View } from '@react-pdf/renderer';
import { FONT, useTw } from '../theme.js';

/** A muted mono footer, ruled off from the body with the ShadCN border. */
export function Footer({ lines }: { lines: string[] }): JSX.Element {
  const tw = useTw();
  return (
    <View style={{ marginTop: 26, paddingTop: 12, borderTopColor: tw('border-border').borderColor, borderTopWidth: 1 }}>
      {lines.map((line, i) => (
        <Text key={i} style={[tw('text-fg-muted'), { fontFamily: FONT.mono, fontSize: 8, marginBottom: 2 }]}>
          {line}
        </Text>
      ))}
    </View>
  );
}
