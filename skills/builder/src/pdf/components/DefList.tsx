import type { ReactNode } from 'react';
import { Text, View } from '@react-pdf/renderer';
import { FONT, TYPE, useTw } from '../theme.js';
import { Card, RADIUS } from './surface.js';

interface Row {
  term: string;
  value: ReactNode;
}

/**
 * A definition / spec grid — metadata and config as term→value rows. Built like the Table (there is
 * no `<dl>` in react-pdf): a bordered, corner-clipped card of zebra rows, the term a mono semibold
 * key in a fixed-weight left column, the value muted body on the right. `title` renders the shared
 * Card header band. Rows relocate atomically with the card rather than clipping across a page.
 */
export function DefList({ title, rows }: { title?: string; rows: Row[] }): JSX.Element {
  const tw = useTw();
  return (
    <Card radius={RADIUS.md} title={title} style={{ marginBottom: 10 }}>
      <View style={tw('bg-card')}>
        {rows.map((r, i) => (
          <View
            key={i}
            style={[
              tw(i % 2 === 1 ? 'bg-muted flex-row' : 'bg-card flex-row'),
              { paddingVertical: 7, paddingHorizontal: 13 },
            ]}
          >
            <Text
              style={[
                tw('text-foreground'),
                { width: '38%', fontFamily: FONT.mono, fontWeight: 500, fontSize: TYPE.tableCell, paddingRight: 10 },
              ]}
            >
              {r.term}
            </Text>
            <Text style={[tw('text-fg-muted'), { flex: 1, fontSize: TYPE.tableCell }]}>{r.value}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}
