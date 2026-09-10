import type { ReactNode } from 'react';
import { cx, t } from '../theme/tokens.js';

type Role = 'accent' | 'positive' | 'negative' | 'warning';

/** Per-role styling: soft background, left-bar color, and the key's text color. */
const ROLE: Record<Role, { soft: string; border: string; text: string }> = {
  accent: { soft: t.bg.accentSoft, border: t.border.accent, text: t.text.accent },
  positive: { soft: t.bg.positiveSoft, border: t.border.positive, text: t.text.positive },
  negative: { soft: t.bg.negativeSoft, border: t.border.negative, text: t.text.negative },
  warning: { soft: t.bg.warningSoft, border: t.border.warning, text: t.text.warning },
};

/**
 * A key/value callout box: a soft role-tinted panel with a colored left bar, a role-colored key,
 * and a plain value beneath. Use for a short labeled fact (a gap, a metric, a status).
 */
export function KeyBox({
  role,
  k,
  v,
}: {
  role: Role;
  k: string;
  v: ReactNode;
}): JSX.Element {
  const r = ROLE[role];
  return (
    <div className={cx(r.soft, r.border, 'break-inside-avoid rounded-r-lg border-l-4 px-4 py-3')}>
      <div className={cx(r.text, 'text-sm font-semibold')}>{k}</div>
      <div className={cx(t.text.ink2, 'mt-0.5 text-sm leading-relaxed')}>{v}</div>
    </div>
  );
}
