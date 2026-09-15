import { Text, View } from '@react-pdf/renderer';
import { FONT, TYPE, useTw } from '../theme.js';

interface Entry {
  title: string;
  /** Page number (or any short locator) shown at the right; omit for an un-numbered entry. */
  page?: string | number;
  /** Nesting depth: 0 = top level, 1 = a sub-entry (indented, muted), … */
  level?: number;
}

/**
 * A table of contents — entries with a dotted leader running to a right-aligned page number. There
 * is no tab-leader in react-pdf, so each row is a flex line: the title, a `flex-1` spacer whose
 * dotted bottom border draws the leader, and a mono page number. Sub-entries (`level > 0`) indent
 * and drop to the muted ink, so the outline's shape reads at a glance. `title` renders an optional
 * mono uppercase heading above the list. All ShadCN/role tokens, so it holds in both themes.
 */
export function Toc({ title = 'Contents', items }: { title?: string; items: Entry[] }): JSX.Element {
  const tw = useTw();
  return (
    <View style={{ marginBottom: 16 }}>
      {title && (
        <Text style={[tw('text-fg-muted uppercase'), { fontFamily: FONT.mono, fontSize: TYPE.eyebrow, letterSpacing: 1, marginBottom: 10 }]}>
          {title}
        </Text>
      )}
      {items.map((it, i) => {
        const level = it.level ?? 0;
        const top = level === 0;
        return (
          <View key={i} style={[tw('flex-row items-end'), { marginBottom: 7, paddingLeft: level * 16 }]}>
            <Text style={[tw(top ? 'text-foreground' : 'text-fg-muted'), { fontSize: TYPE.cardBody, fontWeight: top ? 600 : 400 }]}>
              {it.title}
            </Text>
            <View
              style={{
                flex: 1,
                marginHorizontal: 6,
                marginBottom: 3,
                borderBottomWidth: 1,
                borderBottomColor: tw('border-border').borderColor as string,
                borderStyle: 'dotted',
              }}
            />
            {it.page !== undefined && (
              <Text style={[tw(top ? 'text-brand-ink' : 'text-fg-muted'), { fontFamily: FONT.mono, fontSize: TYPE.eyebrow + 1 }]}>{it.page}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}
