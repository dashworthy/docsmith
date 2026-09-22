import { Text, View } from '@react-pdf/renderer';
import { FONT, TYPE, useTw } from '../theme.js';
import { Card, RADIUS } from './surface.js';

/** A cell is either a boolean (rendered as a role-colored ✓/✗) or literal text. */
type Cell = boolean | string;

interface MatrixProps {
  /** Column headers; the first labels the row (feature) column, the rest are the compared options. */
  columns: string[];
  /** One array per row; `row[0]` is the feature label, the rest align to `columns[1..]`. */
  rows: Cell[][];
  /** A 1-based option column to emphasize (soft-tinted band) — e.g. the recommended plan. */
  highlight?: number;
}

/**
 * A feature matrix — rows of capabilities against columns of options, with ✓/✗ cells. Built on the
 * same flex-row + zebra chrome as `Table` (blue mono-less `th` labels, corner-clipped card), but
 * every option cell is centered and a boolean resolves to an emerald ✓ (mono — the only face here
 * with the glyph) or a muted en-dash for absence, so a grid of support reads at a glance. One option
 * column can be `highlight`ed with the brand soft tint to mark
 * the recommended choice — the tint is a role token, so it holds in both themes.
 */
export function Matrix({ columns, rows, highlight }: MatrixProps): JSX.Element {
  const tw = useTw();
  const weights = columns.map((_, i) => (i === 0 ? 1.6 : 1));
  const isHi = (ci: number) => highlight !== undefined && ci === highlight;
  return (
    <Card radius={RADIUS.md} style={{ marginBottom: 10 }}>
      <View style={tw('flex-row bg-muted')}>
        {columns.map((h, i) => (
          <Text
            key={i}
            style={[
              tw(isHi(i) ? 'text-brand-ink bg-brand-soft' : 'text-brand-ink'),
              {
                flex: weights[i],
                fontWeight: 700,
                fontSize: TYPE.tableHeader,
                textAlign: i === 0 ? 'left' : 'center',
                paddingTop: 8,
                paddingBottom: 4,
                paddingHorizontal: 9,
              },
            ]}
          >
            {h}
          </Text>
        ))}
      </View>
      {rows.map((row, ri) => (
        <View
          key={ri}
          style={[tw(ri % 2 === 1 ? 'bg-muted' : 'bg-card'), { flexDirection: 'row', borderTopColor: tw('border-border').borderColor, borderTopWidth: 1 }]}
        >
          {row.map((cell, ci) => {
            const bool = typeof cell === 'boolean';
            const tone = bool ? (cell ? 'text-pos-ink' : 'text-fg-muted') : ci === 0 ? 'text-foreground' : 'text-fg-muted';
            return (
              <Text
                key={ci}
                style={[
                  tw(isHi(ci) ? `${tone} bg-brand-soft` : tone),
                  {
                    flex: weights[ci],
                    fontSize: TYPE.tableCell,
                    fontWeight: bool ? 700 : 400,
                    ...(bool ? { fontFamily: FONT.mono } : {}),
                    textAlign: ci === 0 ? 'left' : 'center',
                    paddingVertical: 6,
                    paddingHorizontal: 9,
                  },
                ]}
              >
                {bool ? (cell ? '✓' : '–') : cell}
              </Text>
            );
          })}
        </View>
      ))}
    </Card>
  );
}
