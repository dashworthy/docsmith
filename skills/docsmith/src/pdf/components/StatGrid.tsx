import { Text, View } from '@react-pdf/renderer';
import { FONT, TYPE, useTw } from '../theme.js';

type Trend = 'up' | 'down' | 'flat';

interface Stat {
  label: string;
  value: string;
  /** An optional delta line under the value; `trend` colors it (up→pos, down→neg, flat→muted). */
  delta?: string;
  trend?: Trend;
}

/**
 * Trend → its delta ink class + sign glyph (the agreed role palette: up→emerald, down→red,
 * flat→muted). The signs are plain `+ − ·` (not ▲▼ triangles, which Inter has no glyph for and
 * would render as tofu).
 */
const TREND: Record<Trend, { text: string; glyph: string }> = {
  up: { text: 'text-pos-ink', glyph: '+' },
  down: { text: 'text-neg-ink', glyph: '−' },
  flat: { text: 'text-fg-muted', glyph: '·' },
};

/**
 * A row of KPI tiles — the report-opening metric strip. Each tile is a framed card (white/lifted
 * surface, ShadCN border, rounded) carrying a mono uppercase label, a big display value, and an
 * optional trend delta. Tiles flex to equal width and wrap when the row runs out of room; the tile
 * stays flat and bordered so the strip reads as one consistent surface in both themes.
 */
export function StatGrid({ items }: { items: Stat[] }): JSX.Element {
  const tw = useTw();
  return (
    <View style={[tw('flex-row flex-wrap'), { gap: 8, marginBottom: 10 }]}>
      {items.map((s, i) => {
        const t = s.trend ? TREND[s.trend] : null;
        return (
          <View
            key={i}
            wrap={false}
            style={[
              tw('bg-card'),
              {
                flexGrow: 1,
                flexBasis: 120,
                borderColor: tw('border-border').borderColor as string,
                borderWidth: 1,
                borderRadius: 10,
                paddingVertical: 11,
                paddingHorizontal: 13,
              },
            ]}
          >
            <Text
              style={[
                tw('text-fg-muted uppercase'),
                { fontFamily: FONT.mono, fontSize: TYPE.eyebrow, letterSpacing: 0.8, marginBottom: 5 },
              ]}
            >
              {s.label}
            </Text>
            <Text style={[tw('text-foreground'), { fontFamily: FONT.display, fontWeight: 700, fontSize: TYPE.statValue, lineHeight: 1 }]}>
              {s.value}
            </Text>
            {t && (
              <Text style={[tw(t.text), { fontSize: TYPE.eyebrow + 1, marginTop: 4 }]}>
                {t.glyph} {s.delta}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}
