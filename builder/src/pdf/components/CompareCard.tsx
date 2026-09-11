import type { ReactNode } from 'react';
import { Text, View } from '@react-pdf/renderer';
import { FONT, TYPE, useTw } from '../theme.js';
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
        <Text style={[tw(`${ROLE_TEXT[col.role]} font-bold uppercase tracking-wide`), { fontSize: TYPE.colLabel }]}>{col.label}</Text>
      </View>
      {col.items.map((item, i) => (
        <View key={i} style={tw('mb-0.5 flex-row')}>
          <Text style={[tw('text-fg-muted'), { marginRight: 5, fontSize: TYPE.cardBody }]}>•</Text>
          <Text style={[tw('flex-1 text-foreground'), { fontSize: TYPE.cardBody }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

/**
 * A two-column comparison card: the shared mono header band (from `Card`), two role-colored
 * columns, and an optional accent "Target" footer band. The card is a thin wrapper over `Card`,
 * which owns the header + footer chrome; this component only supplies the columns and the target
 * content.
 */
export function CompareCard({
  title,
  a,
  b,
  target,
}: {
  title: string;
  a: Column;
  b: Column;
  target?: ReactNode;
}): JSX.Element {
  const tw = useTw();
  return (
    <Card
      radius={RADIUS.lg}
      title={title}
      // The "Target" footer rides the shared accent footer band (brand-soft fill, dashed divider);
      // the content is a muted line led by a mono, uppercase "TARGET" kicker.
      footer={
        target ? (
          <Text style={[tw('text-fg-muted'), { fontSize: TYPE.cardBody }]}>
            <Text style={[tw('text-brand-ink'), { fontFamily: FONT.mono, fontSize: TYPE.eyebrow, fontWeight: 700, letterSpacing: 0.5 }]}>
              TARGET{'   '}
            </Text>
            {target}
          </Text>
        ) : undefined
      }
      footerTone="accent"
      style={tw('mb-2.5')}
    >
      <View style={tw('bg-card flex-row')}>
        <Col col={a} />
        <Col col={b} bordered />
      </View>
    </Card>
  );
}
