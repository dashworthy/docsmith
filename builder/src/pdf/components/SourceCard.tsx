import type { ReactNode } from 'react';
import { Text, View } from '@react-pdf/renderer';
import { FONT, useTw } from '../theme.js';
import { Card, RADIUS } from './surface.js';

/** A reference card: a muted header band with a mono, indigo-accented title over a muted body. */
export function SourceCard({ title, children }: { title: string; children: ReactNode }): JSX.Element {
  const tw = useTw();
  return (
    <Card radius={RADIUS.md} style={{ marginBottom: 10 }}>
      <View
        style={[
          tw('bg-muted border-b border-border'),
          {
            // Extra top padding centers the mono title: it sits above its natural line-box center,
            // so it reads high under symmetric padding (same pattern as the table header / caption).
            paddingTop: 8.2,
            paddingBottom: 5.8,
            paddingHorizontal: 13,
          },
        ]}
      >
        <Text style={[tw('text-brand-ink'), { fontFamily: FONT.mono, fontSize: 9.5 }]}>{title}</Text>
      </View>
      <View style={[tw('bg-card'), { paddingVertical: 9, paddingHorizontal: 13 }]}>
        <Text style={[tw('text-fg-muted'), { fontSize: 9.5 }]}>{children}</Text>
      </View>
    </Card>
  );
}
