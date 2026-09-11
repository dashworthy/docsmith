import type { ReactNode } from 'react';
import { Text, View } from '@react-pdf/renderer';
import { FONT, HALF_CONTENT, usePalette } from '../theme.js';
import { Eyebrow } from './prose.js';

/** A section: an accent kicker, a display title, an optional muted deck, then the section body. */
export function Section({
  eyebrow,
  title,
  deck,
  children,
}: {
  eyebrow: string;
  title: string;
  deck?: string;
  children: ReactNode;
}): JSX.Element {
  const c = usePalette();
  // Presentation rule: a headline must not start below the 50% line of the page.
  //
  // react-pdf's `shouldBreak` only honors `minPresenceAhead` when the node (a) does NOT itself
  // split across the break (`!shouldSplit`) and (b) has a previous sibling in the same parent
  // (`breakingImprovesPresence`). So it must sit on the short `wrap={false}` header block — which
  // fits without splitting — AND that block must be a top-level sibling of the surrounding sections
  // (which precede it) rather than the first child of a section wrapper. We therefore render the
  // section as a Fragment: the header and the body flow as siblings among the document's top-level
  // children, so react-pdf can break *before* the header and push it to the next page when fewer
  // than `HALF_CONTENT` points remain below it.
  return (
    <>
      <View wrap={false} minPresenceAhead={HALF_CONTENT} style={{ marginTop: 22 }}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Text
          style={{
            fontFamily: FONT.display,
            fontSize: 17,
            fontWeight: 700,
            lineHeight: 1.2,
            color: c.ink,
            marginBottom: deck ? 5 : 10,
          }}
        >
          {title}
        </Text>
        {deck && <Text style={{ color: c.ink3, marginBottom: 10 }}>{deck}</Text>}
      </View>
      {children}
    </>
  );
}
