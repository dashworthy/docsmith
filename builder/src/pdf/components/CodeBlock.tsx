import { Text, View } from '@react-pdf/renderer';
import { FONT } from '../theme.js';
import type { HighlightedCode } from '../highlightCode.js';

/**
 * A syntax-highlighted code block. Takes pre-tokenized code (see `highlightCode`) — the doc builder
 * runs Shiki up front, since react-pdf render is synchronous — and lays each line out as mono
 * <Text> runs on the theme's own code background. Long lines wrap (there is no horizontal scroll in
 * a PDF), so nothing is clipped.
 */
export function CodeBlock({ code }: { code: HighlightedCode }): JSX.Element {
  return (
    <View wrap={false} style={{ backgroundColor: code.bg, borderRadius: 8, padding: 12, marginBottom: 10 }}>
      {code.lines.map((line, i) => (
        <Text key={i} style={{ fontFamily: FONT.mono, fontSize: 8.5, lineHeight: 1.5, color: code.fg }}>
          {line.length > 0 ? (
            line.map((tok, j) => (
              <Text key={j} style={{ color: tok.color }}>
                {tok.content}
              </Text>
            ))
          ) : (
            <Text> </Text>
          )}
        </Text>
      ))}
    </View>
  );
}
