import { Text, View } from '@react-pdf/renderer';
import { FONT, TYPE, useTw } from '../theme.js';

type Role = 'accent' | 'positive' | 'warning' | 'negative' | 'neutral';

interface Event {
  time: string;
  title: string;
  body?: string;
  role?: Role;
}

/** Role → its dot ink class (the agreed role palette; `neutral` = the muted-foreground ink). */
const DOT: Record<Role, string> = {
  accent: 'bg-brand-ink',
  positive: 'bg-pos-ink',
  warning: 'bg-warn-ink',
  negative: 'bg-neg-ink',
  neutral: 'bg-fg-muted',
};

/**
 * A vertical milestone rail: dated events threaded on a connector line, each marked by a role dot.
 * The rail is a fixed-width left column — a centered dot over a 1px `border` line that runs to the
 * next event (omitted on the last) — beside a mono time kicker, a semibold title, and optional
 * muted body. The line uses the ShadCN border token, so it reads as a quiet thread in both themes.
 */
export function Timeline({ items }: { items: Event[] }): JSX.Element {
  const tw = useTw();
  return (
    <View style={{ marginBottom: 10 }}>
      {items.map((e, i) => {
        const last = i === items.length - 1;
        return (
          <View key={i} style={tw('flex-row')}>
            {/* Left rail: dot + connector line to the next event. */}
            <View style={{ width: 16, alignItems: 'center' }}>
              <View style={[tw(DOT[e.role ?? 'accent']), { width: 9, height: 9, borderRadius: 5, marginTop: 2 }]} />
              {!last && <View style={{ flexGrow: 1, width: 1, backgroundColor: tw('border-border').borderColor as string, marginTop: 3 }} />}
            </View>
            <View style={{ flex: 1, paddingLeft: 10, paddingBottom: last ? 0 : 12 }}>
              <Text style={[tw('text-fg-muted uppercase'), { fontFamily: FONT.mono, fontSize: TYPE.eyebrow, letterSpacing: 0.6, marginBottom: 2 }]}>
                {e.time}
              </Text>
              <Text style={[tw('text-foreground'), { fontWeight: 600, fontSize: TYPE.phaseTitle, marginBottom: e.body ? 2 : 0 }]}>{e.title}</Text>
              {e.body && <Text style={[tw('text-fg-muted'), { fontSize: TYPE.cardBody }]}>{e.body}</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
}
