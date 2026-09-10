import type { ReactNode } from 'react';
import { cx, t } from '../theme/tokens.js';

/**
 * A numbered list of open questions. Each item gets an accent "Q1"/"Q2"… marker (rendered
 * explicitly rather than via a CSS counter, so the output stays static). Use for a run of open
 * questions a doc wants to enumerate.
 */
export function QList({ items }: { items: ReactNode[] }): JSX.Element {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className={cx(t.text.accent, t.font.mono, 'shrink-0 text-sm font-semibold')}>
            Q{i + 1}
          </span>
          <span className={cx(t.text.ink2, 'text-sm leading-relaxed')}>{item}</span>
        </li>
      ))}
    </ul>
  );
}
