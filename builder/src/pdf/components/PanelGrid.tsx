import type { ReactNode } from 'react';
import { Text, View } from '@react-pdf/renderer';
import { useTw } from '../theme.js';
import { Elevated, RADIUS } from './surface.js';

/** A row of equal-width panels (they stretch to a shared height on the cross axis). */
export function PanelGrid({ children }: { children: ReactNode }): JSX.Element {
  const tw = useTw();
  return <View style={tw('flex-row items-stretch gap-3 mb-2.5')}>{children}</View>;
}

/** One panel: an elevated, bordered card surface with a bold title over a muted body. */
export function Panel({ title, children }: { title: string; children: ReactNode }): JSX.Element {
  const tw = useTw();
  return (
    <Elevated radius={RADIUS.md} style={{ flex: 1 }}>
      <View
        style={[
          tw('bg-card border border-border'),
          {
            // flexGrow (not `flex: 1`) so the panel keeps its natural content height while measuring
            // the row; `flex: 1` sets flexBasis:0, which collapses the card to ~0 and overflows the
            // body text onto the following content. It still fills the stretched (equal) row height.
            flexGrow: 1,
            borderRadius: RADIUS.md,
            padding: 14,
          },
        ]}
      >
        <Text style={[tw('text-foreground'), { fontWeight: 600, fontSize: 11, marginBottom: 5 }]}>{title}</Text>
        <Text style={[tw('text-fg-muted'), { fontSize: 9.5 }]}>{children}</Text>
      </View>
    </Elevated>
  );
}
