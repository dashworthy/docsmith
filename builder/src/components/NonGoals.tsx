import type { ReactNode } from 'react';
import { cx, t } from '../theme/tokens.js';

/**
 * A struck list of non-goals: each item carries a negative "×" marker and its text is struck
 * through in muted ink, reading as "explicitly not this".
 */
export function NonGoals({ items }: { items: ReactNode[] }): JSX.Element {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className={cx(t.text.negative, 'shrink-0 text-sm font-semibold')}>×</span>
          <span className={cx(t.text.ink3, 'text-sm leading-relaxed line-through')}>{item}</span>
        </li>
      ))}
    </ul>
  );
}
