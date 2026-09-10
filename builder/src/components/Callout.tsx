import type { ReactNode } from 'react';
import { cx, t } from '../theme/tokens.js';

type Role = 'note' | 'tip' | 'important' | 'warning' | 'caution';

/** Per-role styling: the accent text color, the soft background tint, the left-bar color, and the
 *  default label used when the caller gives no title. */
const ROLE: Record<Role, { text: string; soft: string; border: string; label: string }> = {
  note: { text: t.text.accent, soft: t.bg.accentSoft, border: t.border.accent, label: 'Note' },
  tip: { text: t.text.positive, soft: t.bg.positiveSoft, border: t.border.positive, label: 'Tip' },
  important: { text: t.text.accent, soft: t.bg.accentSoft, border: t.border.accent, label: 'Important' },
  warning: { text: t.text.warning, soft: t.bg.warningSoft, border: t.border.warning, label: 'Warning' },
  caution: { text: t.text.negative, soft: t.bg.negativeSoft, border: t.border.negative, label: 'Caution' },
};

/**
 * An admonition callout in the GitHub style: a soft role-tinted card with a colored left bar, a
 * role-colored title (the caller's or the role's default label), and the body beneath.
 */
export function Callout({
  role,
  title,
  children,
}: {
  role: Role;
  title?: string;
  children: ReactNode;
}): JSX.Element {
  const r = ROLE[role];
  return (
    <div className={cx(r.soft, r.border, 'break-inside-avoid rounded-r-lg border-l-4 px-4 py-3')}>
      <div className={cx(r.text, 'text-sm font-semibold')}>{title ?? r.label}</div>
      <div className={cx(t.text.ink2, 'mt-1 text-sm leading-relaxed')}>{children}</div>
    </div>
  );
}
