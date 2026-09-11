import type { ReactNode } from 'react';
import { Text, View } from '@react-pdf/renderer';
import { FONT, usePalette } from '../theme.js';
import { Card, RADIUS } from './surface.js';

type ColRole = 'warning' | 'negative' | 'positive';

interface Column {
  label: string;
  role: ColRole;
  items: ReactNode[];
}

function Col({ col, bordered }: { col: Column; bordered?: boolean }): JSX.Element {
  const c = usePalette();
  return (
    <View
      style={{
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderLeftColor: bordered ? c.border : undefined,
        borderLeftWidth: bordered ? 1 : 0,
      }}
    >
      {/* The dot is positioned deterministically: the row is top-aligned and the dot is pushed down
          by a fixed marginTop into the caps zone. react-pdf's flex `center`/`baseline` both misplace
          it here (its numeric lineHeight inflates the text box, and a childless View's baseline is
          its top), so an explicit offset tuned to the label's cap height is the reliable approach. */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 5, marginBottom: 6 }}>
        <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: c[col.role], marginTop: 3 }} />
        <Text
          style={{ color: c[col.role], fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}
        >
          {col.label}
        </Text>
      </View>
      {col.items.map((item, i) => (
        <View key={i} style={{ flexDirection: 'row', marginBottom: 3 }}>
          <Text style={{ color: c.ink3, marginRight: 5, fontSize: 9.5 }}>•</Text>
          <Text style={{ flex: 1, color: c.ink2, fontSize: 9.5 }}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

/** A two-column comparison card: an accent-tagged header band, two role-tinted columns, an optional target footer. */
export function CompareCard({
  num,
  title,
  a,
  b,
  target,
}: {
  num: string;
  title: string;
  a: Column;
  b: Column;
  target?: ReactNode;
}): JSX.Element {
  const c = usePalette();
  return (
    <Card radius={RADIUS.lg} style={{ marginBottom: 10 }}>
        {/* Pill/title vertical alignment is done deterministically, because react-pdf's flex
            `center`/`baseline` misplace them (numeric lineHeight inflates the text box). The row is
            top-anchored; the pill's `marginTop` drops it so its caps sit level with the title's, and
            its top padding exceeds bottom by ~0.75 to center the (box-high) uppercase label in it. */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 8,
            backgroundColor: c.surface2,
            borderBottomColor: c.border,
            borderBottomWidth: 1,
            paddingVertical: 8,
            paddingHorizontal: 14,
          }}
        >
          <View style={{ backgroundColor: c.accentSoft, borderColor: c.accent, borderWidth: 1, borderRadius: 4, paddingHorizontal: 6, paddingTop: 1.5, paddingBottom: 4, marginTop: 1 }}>
            <Text
              style={{ fontFamily: FONT.mono, fontSize: 7.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: c.accent, lineHeight: 1 }}
            >
              {num}
            </Text>
          </View>
          <Text style={{ fontFamily: FONT.display, fontSize: 12, fontWeight: 600, color: c.ink, lineHeight: 1 }}>{title}</Text>
        </View>
        <View style={{ flexDirection: 'row', backgroundColor: c.surface }}>
          <Col col={a} />
          <Col col={b} bordered />
        </View>
        {target && (
          <View
            style={{
              backgroundColor: c.accentSoft,
              borderTopColor: c.border,
              borderTopWidth: 1,
              paddingVertical: 8,
              paddingHorizontal: 14,
            }}
          >
            <Text style={{ color: c.ink2, fontSize: 9.5 }}>
              <Text style={{ color: c.accent, fontWeight: 700 }}>Target </Text>
              {target}
            </Text>
          </View>
        )}
    </Card>
  );
}
