import type { ReactNode } from 'react';
import { Text, View } from '@react-pdf/renderer';
import { FONT, TYPE, useTw } from '../theme.js';

/**
 * A pull-quote — a large display line lifted out of the running text, set off by a thick brand
 * accent bar on the left and an optional attribution. The quote ink stays `foreground` (it is a
 * highlight, not a role callout) while the bar carries the brand accent; the attribution is a mono
 * muted kicker. No fill, so it sits cleanly on either theme ground.
 */
export function Quote({ children, by }: { children: ReactNode; by?: string }): JSX.Element {
  const tw = useTw();
  return (
    <View
      wrap={false}
      style={{
        borderLeftColor: tw('text-brand-ink').color as string,
        borderLeftWidth: 4,
        paddingLeft: 14,
        paddingVertical: 4,
        marginBottom: 10,
      }}
    >
      <Text style={[tw('text-foreground'), { fontFamily: FONT.display, fontSize: TYPE.quote, lineHeight: 1.35 }]}>
        {children}
      </Text>
      {by && (
        <Text style={[tw('text-fg-muted uppercase'), { fontFamily: FONT.mono, fontSize: TYPE.eyebrow, letterSpacing: 0.6, marginTop: 6 }]}>
          — {by}
        </Text>
      )}
    </View>
  );
}
