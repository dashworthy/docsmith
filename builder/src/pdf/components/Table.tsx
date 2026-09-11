import type { ReactNode } from 'react';
import { Text, View } from '@react-pdf/renderer';
import { usePalette } from '../theme.js';
import { Card, RADIUS } from './surface.js';

/**
 * A data table with an accent-soft header band and zebra body rows. There is no `<table>` in
 * react-pdf, so it's built from flex rows with per-column weight. `overflow: 'hidden'` clips the
 * header/last-row corners to the card radius, and the card carries a drop shadow. The table is
 * atomic (via `Elevated`): tables here fit within a page and relocate rather than clip.
 */
export function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }): JSX.Element {
  const c = usePalette();
  const weights = head.length === 2 ? [0.4, 0.6] : head.map(() => 1);
  return (
    <Card radius={RADIUS.md} style={{ marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', backgroundColor: c.accentSoft }}>
          {head.map((h, i) => (
            <Text
              key={i}
              style={{ flex: weights[i], color: c.accent, fontWeight: 700, fontSize: 9, paddingTop: 8, paddingBottom: 4, paddingHorizontal: 9 }}
            >
              {h}
            </Text>
          ))}
        </View>
        {rows.map((row, ri) => (
          <View
            key={ri}
            style={{
              flexDirection: 'row',
              backgroundColor: ri % 2 === 1 ? c.surface2 : c.surface,
              borderTopColor: c.border,
              borderTopWidth: 1,
            }}
          >
            {row.map((cell, ci) => (
              <Text
                key={ci}
                style={{
                  flex: weights[ci],
                  color: ci === 0 ? c.ink : c.ink2,
                  fontSize: 9,
                  paddingVertical: 6,
                  paddingHorizontal: 9,
                }}
              >
                {cell}
              </Text>
            ))}
          </View>
        ))}
    </Card>
  );
}
