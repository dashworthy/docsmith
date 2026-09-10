import type { ReactNode } from 'react';
import { cx, t } from '../theme/tokens.js';

type Role = 'neutral' | 'accent' | 'positive' | 'negative' | 'warning';

/** Per-role pill colors: text color paired with the matching soft background. */
const ROLE: Record<Role, string> = {
  neutral: cx(t.text.ink2, t.bg.surface2),
  accent: cx(t.text.accent, t.bg.accentSoft),
  positive: cx(t.text.positive, t.bg.positiveSoft),
  negative: cx(t.text.negative, t.bg.negativeSoft),
  warning: cx(t.text.warning, t.bg.warningSoft),
};

/** An inline status pill. `role` picks the tint; `neutral` is the default. */
export function Badge({
  role = 'neutral',
  children,
}: {
  role?: Role;
  children: ReactNode;
}): JSX.Element {
  return (
    <span
      className={cx(
        ROLE[role],
        t.font.mono,
        'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
      )}
    >
      {children}
    </span>
  );
}
