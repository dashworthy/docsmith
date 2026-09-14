import type { ReactNode } from 'react';
import { Text, View } from '@react-pdf/renderer';
import { TYPE, useTw } from '../theme.js';
import { Card, RADIUS } from './surface.js';

/**
 * A data table with a muted header band (blue-accented `th` labels) and zebra body rows.
 * There is no `<table>` in react-pdf, so it's built from flex rows with per-column weight. The card
 * clips the header/last-row corners to its radius, and the table is atomic (via `Elevated`): tables
 * here fit within a page and relocate rather than clip.
 */
export function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }): JSX.Element {
  const tw = useTw();
  const weights = head.length === 2 ? [0.4, 0.6] : head.map(() => 1);
  return (
    <Card radius={RADIUS.md} style={{ marginBottom: 10 }}>
      <View style={tw('flex-row bg-muted')}>
        {head.map((h, i) => (
          <Text
            key={i}
            style={[
              tw('text-brand-ink'),
              { flex: weights[i], fontWeight: 700, fontSize: TYPE.tableHeader, paddingTop: 8, paddingBottom: 4, paddingHorizontal: 9 },
            ]}
          >
            {h}
          </Text>
        ))}
      </View>
      {rows.map((row, ri) => (
        <View
          key={ri}
          style={[
            tw(ri % 2 === 1 ? 'bg-muted' : 'bg-card'),
            { flexDirection: 'row', borderTopColor: tw('border-border').borderColor, borderTopWidth: 1 },
          ]}
        >
          {row.map((cell, ci) => (
            <Text
              key={ci}
              style={[
                tw(ci === 0 ? 'text-foreground' : 'text-fg-muted'),
                { flex: weights[ci], fontSize: TYPE.tableCell, paddingVertical: 6, paddingHorizontal: 9 },
              ]}
            >
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </Card>
  );
}
