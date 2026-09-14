import type { ReactNode } from 'react';
import { Text, View } from '@react-pdf/renderer';
import { FONT, HEADLINE_MIN_PRESENCE, TYPE, useTw } from '../theme.js';
import { Eyebrow } from './prose.js';

/** A section: a primary kicker, a display title, an optional muted deck, then the section body. */
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
  const tw = useTw();
  // Presentation rule: a headline must not start in the bottom two-fifths (40%) of the page (moderate orphan control).
  //
  // react-pdf's `shouldBreak` only honors `minPresenceAhead` when the node (a) does NOT itself
  // split across the break (`!shouldSplit`) and (b) has a previous sibling in the same parent
  // (`breakingImprovesPresence`). So it must sit on the short `wrap={false}` header block — which
  // fits without splitting — AND that block must be a top-level sibling of the surrounding sections
  // (which precede it) rather than the first child of a section wrapper. We therefore render the
  // section as a Fragment: the header and the body flow as siblings among the document's top-level
  // children, so react-pdf can break *before* the header and push it to the next page when fewer
  // than `HEADLINE_MIN_PRESENCE` points (two-fifths of the content height) remain below it.
  return (
    <>
      <View wrap={false} minPresenceAhead={HEADLINE_MIN_PRESENCE} style={{ marginTop: 22 }}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Text
          style={[
            tw('text-foreground'),
            { fontFamily: FONT.display, fontSize: TYPE.sectionTitle, fontWeight: 700, lineHeight: 1.2, marginBottom: deck ? 5 : 10 },
          ]}
        >
          {title}
        </Text>
        {deck && <Text style={[tw('text-fg-muted mb-2.5'), { fontSize: TYPE.deck }]}>{deck}</Text>}
      </View>
      {children}
    </>
  );
}
