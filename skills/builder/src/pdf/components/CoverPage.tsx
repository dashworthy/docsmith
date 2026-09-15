import { Text, View } from '@react-pdf/renderer';
import { FONT, useTw } from '../theme.js';

type Role = 'accent' | 'positive' | 'warning' | 'negative';

interface Meta {
  label: string;
  value: string;
}

interface CoverPageProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  /** Short tag chips under the title (e.g. audience, status). */
  tags?: string[];
  /** A divided metadata strip pinned to the foot of the page — author, date, version, … */
  meta?: Meta[];
  /** The hero accent role: tint + bar + eyebrow ink. Defaults to the brand blue. */
  accent?: Role;
}

/** Role → its `ROLE` token stem (blue/emerald/amber/red), theme-swapped. */
const TONE: Record<Role, 'brand' | 'pos' | 'warn' | 'neg'> = {
  accent: 'brand',
  positive: 'pos',
  warning: 'warn',
  negative: 'neg',
};

/**
 * A full-bleed title page — pass it to `PdfDoc`'s `cover` slot, which gives it a dedicated,
 * inset-free `<Page>` so it fills the sheet corner to corner (a card in the content flow cannot
 * stretch to a full page). A full-height role accent bar runs the left edge; the role-tinted hero
 * grows to fill the sheet with the title block weighted toward the lower third; a divided metadata
 * strip is pinned to the foot. Every color is a role or ShadCN token, so the tint, bar, and strip
 * hold on both the light and dark ground; the accent role is swappable per document.
 */
export function CoverPage({ eyebrow, title, subtitle, tags, meta, accent = 'accent' }: CoverPageProps): JSX.Element {
  const tw = useTw();
  const t = TONE[accent];
  return (
    <View style={{ flexGrow: 1, flexDirection: 'row' }}>
      {/* Full-height accent bar down the left edge. */}
      <View style={[tw(`bg-${t}-ink`), { width: 7 }]} />
      <View style={{ flexGrow: 1, flexDirection: 'column' }}>
        {/* Hero: role tint fills the sheet; the title block sits in the lower third. */}
        <View style={[tw(`bg-${t}-soft`), { flexGrow: 1, justifyContent: 'flex-end', paddingHorizontal: 54, paddingTop: 64, paddingBottom: 48 }]}>
          <Text style={[tw(`text-${t}-ink uppercase`), { fontFamily: FONT.mono, fontSize: 9, letterSpacing: 1.6, marginBottom: 16 }]}>
            {eyebrow}
          </Text>
          <Text style={[tw('text-foreground'), { fontFamily: FONT.display, fontSize: 40, fontWeight: 700, lineHeight: 1.03, marginBottom: subtitle ? 14 : 0 }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[tw('text-fg-muted'), { fontSize: 13, lineHeight: 1.5, maxWidth: 440, marginBottom: tags ? 20 : 0 }]}>{subtitle}</Text>
          )}
          {tags && (
            <View style={tw('flex-row flex-wrap gap-1.5')}>
              {tags.map((tag, i) => (
                <Text
                  key={i}
                  style={[
                    tw('bg-card border border-border text-foreground rounded-full'),
                    { fontSize: 8.5, lineHeight: 1, paddingTop: 4, paddingBottom: 3.5, paddingHorizontal: 9 },
                  ]}
                >
                  {tag}
                </Text>
              ))}
            </View>
          )}
        </View>
        {/* Metadata strip: label→value columns split by hairline rules, pinned to the foot. */}
        {meta && meta.length > 0 && (
          <View style={[tw('bg-card flex-row'), { borderTopColor: tw('border-border').borderColor as string, borderTopWidth: 1, paddingVertical: 18, paddingHorizontal: 54 }]}>
            {meta.map((m, i) => (
              <View
                key={i}
                style={{
                  paddingRight: 24,
                  ...(i > 0 ? { paddingLeft: 24, borderLeftColor: tw('border-border').borderColor as string, borderLeftWidth: 1 } : {}),
                }}
              >
                <Text style={[tw('text-fg-muted uppercase'), { fontFamily: FONT.mono, fontSize: 7, letterSpacing: 0.8, marginBottom: 4 }]}>
                  {m.label}
                </Text>
                <Text style={[tw('text-foreground'), { fontWeight: 600, fontSize: 10 }]}>{m.value}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
