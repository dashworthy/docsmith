import { Text, View } from '@react-pdf/renderer';
import { FONT } from '../theme.js';
import { Card, RADIUS } from './surface.js';
import type { HighlightedCode } from '../highlightCode.js';

/**
 * A syntax-highlighted code block. Takes pre-tokenized code (see `highlightCode`) — the doc builder
 * runs Shiki up front, since react-pdf render is synchronous — and lays each line out as mono
 * <Text> runs. The Shiki theme's own background/token colors are kept (they are tuned together for
 * contrast, and are orthogonal to the ShadCN palette); the card only contributes the ShadCN
 * `border-border` frame + radius. Long lines wrap (there is no horizontal scroll in a PDF).
 */
export function CodeBlock({ code }: { code: HighlightedCode }): JSX.Element {
  return (
    <Card radius={RADIUS.md} style={{ marginBottom: 10 }}>
      <View style={{ backgroundColor: code.bg, padding: 12 }}>
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
    </Card>
  );
}
