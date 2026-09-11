import type { ReactNode } from 'react';
import { Text, View } from '@react-pdf/renderer';
import { usePalette, type Palette } from '../theme.js';

type Role = 'accent' | 'positive' | 'negative' | 'warning';

const SOFT: Record<Role, keyof Palette> = {
  accent: 'accentSoft',
  positive: 'positiveSoft',
  negative: 'negativeSoft',
  warning: 'warningSoft',
};

/** A labeled fact: a left rule + soft fill in the role color, a bold key, and a muted value. */
export function KeyBox({ role, k, v }: { role: Role; k: string; v: ReactNode }): JSX.Element {
  const c = usePalette();
  return (
    <View
      wrap={false}
      style={{
        backgroundColor: c[SOFT[role]],
        borderLeftColor: c[role],
        borderLeftWidth: 4,
        borderTopRightRadius: 6,
        borderBottomRightRadius: 6,
        paddingVertical: 9,
        paddingHorizontal: 13,
        marginBottom: 8,
      }}
    >
      <Text style={{ color: c[role], fontWeight: 700, fontSize: 10, marginBottom: 2 }}>{k}</Text>
      <Text style={{ color: c.ink2, fontSize: 9.5 }}>{v}</Text>
    </View>
  );
}
