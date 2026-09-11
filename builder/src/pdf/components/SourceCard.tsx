import type { ReactNode } from 'react';
import { Text, View } from '@react-pdf/renderer';
import { FONT, usePalette } from '../theme.js';
import { Card, RADIUS } from './surface.js';

/** A reference card: a surface-2 header band with a mono, accent-colored title over a muted body. */
export function SourceCard({ title, children }: { title: string; children: ReactNode }): JSX.Element {
  const c = usePalette();
  return (
    <Card radius={RADIUS.md} style={{ marginBottom: 10 }}>
      <View
        style={{
          backgroundColor: c.surface2,
          borderBottomColor: c.border,
          borderBottomWidth: 1,
          // Extra top padding centers the mono title: it sits above its natural line-box center,
          // so it reads high under symmetric padding (same pattern as the table header / caption).
          paddingTop: 8.2,
          paddingBottom: 5.8,
          paddingHorizontal: 13,
        }}
      >
        <Text style={{ fontFamily: FONT.mono, fontSize: 9.5, color: c.accent }}>{title}</Text>
      </View>
      <View style={{ backgroundColor: c.surface, paddingVertical: 9, paddingHorizontal: 13 }}>
        <Text style={{ color: c.ink2, fontSize: 9.5 }}>{children}</Text>
      </View>
    </Card>
  );
}
