import { Text, View } from '@react-pdf/renderer';
import { FONT, useTw } from '../theme.js';
import { Card, RADIUS } from './surface.js';

interface Phase {
  idx: string;
  title: string;
  body: string;
  /** A parallel phase takes the positive (emerald) accent on its number column instead of indigo. */
  parallel?: boolean;
}

/**
 * An ordered list of phases, each a bordered card with a full-height accent-soft number column and
 * a title + body — matching the original design's phase cards (accent-soft column, big accent
 * number). A parallel phase swaps the indigo brand accent for the positive (emerald) role.
 */
export function Phases({ items }: { items: Phase[] }): JSX.Element {
  const tw = useTw();
  return (
    <View>
      {items.map((p, i) => {
        const role = p.parallel ? 'pos' : 'brand';
        return (
          <Card key={i} radius={RADIUS.md} style={{ marginBottom: 8 }}>
            <View style={tw('bg-card flex-row')}>
              {/* Full-height number column: it stretches to the card's height (default cross-axis
                  stretch) and centers the big display numeral; the card clips it to the radius. */}
              <View style={[tw(`bg-${role}-soft`), { width: 42, alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={[tw(`text-${role}-ink`), { fontFamily: FONT.display, fontWeight: 700, fontSize: 17 }]}>
                  {p.idx}
                </Text>
              </View>
              <View style={[tw('flex-1'), { paddingVertical: 11, paddingHorizontal: 14 }]}>
                <Text style={[tw('text-foreground'), { fontWeight: 600, fontSize: 11, marginBottom: 2 }]}>{p.title}</Text>
                <Text style={[tw('text-fg-muted'), { fontSize: 9.5 }]}>{p.body}</Text>
              </View>
            </View>
          </Card>
        );
      })}
    </View>
  );
}
