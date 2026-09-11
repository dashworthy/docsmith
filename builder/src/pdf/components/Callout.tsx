import type { ReactNode } from 'react';
import { Text, View } from '@react-pdf/renderer';
import { usePalette, type Palette } from '../theme.js';

type Role = 'note' | 'tip' | 'important' | 'warning' | 'caution';

/** Role → its accent color key and label; the soft fill is the matching `*Soft` palette role. */
const ROLE: Record<Role, { key: keyof Palette; soft: keyof Palette; label: string }> = {
  note: { key: 'accent', soft: 'accentSoft', label: 'Note' },
  tip: { key: 'positive', soft: 'positiveSoft', label: 'Tip' },
  important: { key: 'accent', soft: 'accentSoft', label: 'Important' },
  warning: { key: 'warning', soft: 'warningSoft', label: 'Warning' },
  caution: { key: 'negative', soft: 'negativeSoft', label: 'Caution' },
};

/** An admonition callout: a left rule in the role color over a soft role-tinted fill. */
export function Callout({ role, children }: { role: Role; children: ReactNode }): JSX.Element {
  const c = usePalette();
  const r = ROLE[role];
  return (
    <View
      wrap={false}
      style={{
        backgroundColor: c[r.soft],
        borderLeftColor: c[r.key],
        borderLeftWidth: 4,
        borderTopRightRadius: 6,
        borderBottomRightRadius: 6,
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginBottom: 10,
      }}
    >
      <Text style={{ color: c[r.key], fontWeight: 700, fontSize: 9, marginBottom: 3 }}>{r.label}</Text>
      <Text style={{ color: c.ink2, fontSize: 10 }}>{children}</Text>
    </View>
  );
}
