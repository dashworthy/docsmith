import type { ReactNode } from 'react';
import { Text } from '@react-pdf/renderer';
import { usePalette, type Palette } from '../theme.js';

type Role = 'neutral' | 'accent' | 'positive' | 'negative' | 'warning';

/** Role → its text-color key and soft-fill key. */
const ROLE: Record<Role, { text: keyof Palette; soft: keyof Palette }> = {
  neutral: { text: 'ink2', soft: 'surface2' },
  accent: { text: 'accent', soft: 'accentSoft' },
  positive: { text: 'positive', soft: 'positiveSoft' },
  negative: { text: 'negative', soft: 'negativeSoft' },
  warning: { text: 'warning', soft: 'warningSoft' },
};

/**
 * An inline status pill. Rendered as a nested `<Text>` (not a `<View>`) so it flows inline inside a
 * paragraph's text — react-pdf lays a styled Text inline with its background, where a View would break.
 */
export function Badge({ role = 'neutral', children }: { role?: Role; children: ReactNode }): JSX.Element {
  const c = usePalette();
  const r = ROLE[role];
  return (
    <Text
      style={{
        fontSize: 8.5,
        color: c[r.text],
        backgroundColor: c[r.soft],
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 4,
      }}
    >
      {children}
    </Text>
  );
}
