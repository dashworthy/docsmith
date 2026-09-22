import { Text, View } from '@react-pdf/renderer';
import { FONT, TYPE, useTw } from '../theme.js';

interface BylineProps {
  name: string;
  /** A short role/title line under the name (e.g. "Staff Engineer"). */
  role?: string;
  /** Initials for the avatar chip; falls back to the name's first two initials. */
  initials?: string;
  /** An optional right-aligned date/meta kicker. */
  date?: string;
}

/** First-two initials from a display name ("Andrew Leach" → "AL"). */
function autoInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * An author byline — a round brand-soft avatar chip with initials, a semibold name, an optional
 * muted role line, and an optional right-aligned date kicker. For cover blocks and author credits. The
 * chip uses the brand soft/ink pair so it reads as a quiet accent, not a loud fill, in either theme.
 */
export function Byline({ name, role, initials, date }: BylineProps): JSX.Element {
  const tw = useTw();
  return (
    <View style={[tw('flex-row items-center'), { marginBottom: 10 }]}>
      <View
        style={[
          tw('bg-brand-soft'),
          { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 9 },
        ]}
      >
        <Text style={[tw('text-brand-ink'), { fontFamily: FONT.mono, fontWeight: 700, fontSize: TYPE.eyebrow + 1 }]}>
          {initials ?? autoInitials(name)}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[tw('text-foreground'), { fontWeight: 600, fontSize: TYPE.cardBody }]}>{name}</Text>
        {role && <Text style={[tw('text-fg-muted'), { fontSize: TYPE.eyebrow + 1 }]}>{role}</Text>}
      </View>
      {date && (
        <Text style={[tw('text-fg-muted uppercase'), { fontFamily: FONT.mono, fontSize: TYPE.eyebrow, letterSpacing: 0.6 }]}>{date}</Text>
      )}
    </View>
  );
}
