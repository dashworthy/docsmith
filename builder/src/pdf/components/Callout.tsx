import type { ReactNode } from 'react';
import { Text, View } from '@react-pdf/renderer';
import { useTw } from '../theme.js';

type Role = 'note' | 'tip' | 'important' | 'warning' | 'caution';

/**
 * Role → ShadCN Alert variant. Vanilla ShadCN ships only `default` and `destructive`; `tip` and
 * `warning` fill the gap with Tailwind's stock emerald/amber (the agreed role palette). Each role
 * sets the title color and the container's border color; the body is always muted-foreground.
 */
const ROLE: Record<Role, { title: string; border: string; label: string }> = {
  note: { title: 'text-foreground', border: 'border-border', label: 'Note' },
  important: { title: 'text-foreground', border: 'border-border', label: 'Important' },
  tip: { title: 'text-emerald-600', border: 'border-emerald-600', label: 'Tip' },
  warning: { title: 'text-amber-600', border: 'border-amber-600', label: 'Warning' },
  caution: { title: 'text-destructive', border: 'border-destructive', label: 'Caution' },
};

/** An admonition, styled as a ShadCN Alert: a bordered card with a role-colored title and body. */
export function Callout({ role, children }: { role: Role; children: ReactNode }): JSX.Element {
  const tw = useTw();
  const r = ROLE[role];
  return (
    <View wrap={false} style={tw(`bg-card ${r.border} mb-2.5 rounded-lg border px-4 py-3`)}>
      <Text style={tw(`${r.title} mb-1 text-xs font-semibold`)}>{r.label}</Text>
      <Text style={tw('text-fg-muted text-sm')}>{children}</Text>
    </View>
  );
}
