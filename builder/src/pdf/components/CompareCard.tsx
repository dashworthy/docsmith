import type { ReactNode } from 'react';
import { Text, View } from '@react-pdf/renderer';
import { FONT, useTw } from '../theme.js';
import { Card, RADIUS } from './surface.js';

type ColRole = 'warning' | 'negative' | 'positive';

interface Column {
  label: string;
  role: ColRole;
  items: ReactNode[];
}

/** Column role → its text color and dot background, from the agreed role palette. */
const ROLE_TEXT: Record<ColRole, string> = {
  warning: 'text-amber-600',
  negative: 'text-destructive',
  positive: 'text-emerald-600',
};
const ROLE_BG: Record<ColRole, string> = {
  warning: 'bg-amber-600',
  negative: 'bg-destructive',
  positive: 'bg-emerald-600',
};

function Col({ col, bordered }: { col: Column; bordered?: boolean }): JSX.Element {
  const tw = useTw();
  return (
    <View style={[tw('flex-1 px-3.5 py-3'), bordered ? tw('border-l border-border') : {}]}>
      {/* The dot is positioned deterministically: the row is top-aligned and the dot is pushed down
          by a fixed marginTop into the caps zone. react-pdf's flex `center`/`baseline` both misplace
          it here (its numeric lineHeight inflates the text box, and a childless View's baseline is
          its top), so an explicit offset tuned to the label's cap height is the reliable approach. */}
      <View style={tw('mb-1.5 flex-row items-start gap-1.5')}>
        <View style={[tw(`${ROLE_BG[col.role]} rounded-full`), { width: 5, height: 5, marginTop: 3 }]} />
        <Text style={tw(`${ROLE_TEXT[col.role]} text-[8px] font-bold uppercase tracking-wide`)}>{col.label}</Text>
      </View>
      {col.items.map((item, i) => (
        <View key={i} style={tw('mb-0.5 flex-row')}>
          <Text style={[tw('text-fg-muted'), { marginRight: 5, fontSize: 9.5 }]}>•</Text>
          <Text style={[tw('flex-1 text-foreground'), { fontSize: 9.5 }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

/** A two-column comparison card: a header band, two role-colored columns, an optional target footer. */
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
  const tw = useTw();
  return (
    <Card radius={RADIUS.lg} style={tw('mb-2.5')}>
      {/* Pill and title are centered against each other on the row. Both the pill's label and the
          title carry lineHeight:1 (tight boxes), so `items-center` aligns their optical centers;
          the pill's slightly-heavier bottom padding centers the caps-high label inside it. */}
      <View style={tw('bg-muted flex-row items-center gap-2 border-b border-border px-3.5 py-2')}>
        {/* Soft-indigo outlined pill: the old `bg-secondary` pill sat invisibly on the identical
            `bg-muted` header (both slate-100); the brand border + soft fill give it back its edge. */}
        <View style={[tw('bg-brand-soft border border-brand-ink rounded'), { paddingHorizontal: 6, paddingTop: 2, paddingBottom: 3 }]}>
          <Text
            style={[tw('text-brand-ink uppercase'), { fontFamily: FONT.mono, fontSize: 7.5, fontWeight: 700, letterSpacing: 0.5, lineHeight: 1 }]}
          >
            {num}
          </Text>
        </View>
        <Text style={[tw('text-foreground'), { fontFamily: FONT.display, fontSize: 11, fontWeight: 600, lineHeight: 1 }]}>{title}</Text>
      </View>
      <View style={tw('bg-card flex-row')}>
        <Col col={a} />
        <Col col={b} bordered />
      </View>
      {target && (
        // The "Target" footer: a clearly-indigo band — `brand-fill` (indigo-200 in light, a deep
        // indigo-900 in dark) reads as the accent where the paler keyblock `soft` tint washes out to
        // grey in this thin band, and theme-swaps rather than glaring as a fixed light band on the
        // dark card — with a dashed top divider, muted body text, and a mono, uppercase, "TARGET" kicker.
        <View
          style={[
            tw('bg-brand-fill px-3.5 py-2'),
            { borderTopWidth: 1, borderTopColor: tw('border-border').borderColor, borderStyle: 'dashed' },
          ]}
        >
          <Text style={[tw('text-fg-muted'), { fontSize: 9.5 }]}>
            <Text style={[tw('text-brand-ink'), { fontFamily: FONT.mono, fontSize: 7, fontWeight: 700, letterSpacing: 0.5 }]}>
              TARGET{'   '}
            </Text>
            {target}
          </Text>
        </View>
      )}
    </Card>
  );
}
