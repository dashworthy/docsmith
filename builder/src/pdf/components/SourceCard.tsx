import type { ReactNode } from 'react';
import { Text, View } from '@react-pdf/renderer';
import { TYPE, useTw } from '../theme.js';
import { Card, RADIUS } from './surface.js';

/**
 * A reference card: the shared mono header band (from `Card`) over a muted body. A thin wrapper —
 * `Card` owns the header treatment, so this card's header is identical to every other category card
 * by construction; this component supplies only the padded body.
 */
export function SourceCard({ title, children }: { title: string; children: ReactNode }): JSX.Element {
  const tw = useTw();
  return (
    <Card radius={RADIUS.md} title={title} style={{ marginBottom: 10 }}>
      <View style={[tw('bg-card'), { paddingVertical: 9, paddingHorizontal: 13 }]}>
        <Text style={[tw('text-fg-muted'), { fontSize: TYPE.cardBody }]}>{children}</Text>
      </View>
    </Card>
  );
}
