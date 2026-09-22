import { Text, View } from '@react-pdf/renderer';
import { FONT, TYPE } from '../theme.js';
import { Card, RADIUS } from './surface.js';
import type { HighlightedCode } from '../highlightCode.js';

type Tok = { content: string; color: string };

/** A non-breaking space: react-pdf preserves these where it collapses ordinary leading spaces. */
const NBSP = '\u00A0';

/**
 * react-pdf collapses the leading whitespace of a <Text>, which erases code indentation (every line
 * renders flush-left). Preserve it by turning each line's leading spaces into non-breaking spaces,
 * which react-pdf does not collapse. Only the leading run is converted — interior spaces stay
 * ordinary (and breakable), so long lines still wrap. Token content and colors are otherwise intact.
 */
export function preserveIndent(line: Tok[]): Tok[] {
  const out: Tok[] = [];
  let leading = true;
  for (const tok of line) {
    if (!leading) {
      out.push(tok);
    } else if (/^ *$/.test(tok.content)) {
      out.push({ ...tok, content: NBSP.repeat(tok.content.length) });
    } else {
      out.push({ ...tok, content: tok.content.replace(/^ +/, (m) => NBSP.repeat(m.length)) });
      leading = false;
    }
  }
  return out;
}

/**
 * A syntax-highlighted code block. Takes pre-tokenized code (see `highlightCode`) — the doc builder
 * runs Shiki up front, since react-pdf render is synchronous — and lays each line out as mono
 * <Text> runs. The Shiki theme's own background/token colors are kept (they are tuned together for
 * contrast, and are orthogonal to the ShadCN palette); the card only contributes the ShadCN
 * `border-border` frame + radius. Leading indentation is preserved via `preserveIndent`; long lines
 * wrap (there is no horizontal scroll in a PDF).
 */
export function CodeBlock({ code }: { code: HighlightedCode }): JSX.Element {
  return (
    <Card radius={RADIUS.md} style={{ marginBottom: 10 }}>
      <View style={{ backgroundColor: code.bg, padding: 12 }}>
        {code.lines.map((line, i) => (
          <Text key={i} style={{ fontFamily: FONT.mono, fontSize: TYPE.code, lineHeight: 1.45, color: code.fg }}>
            {line.length > 0 ? (
              preserveIndent(line).map((tok, j) => (
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
