import type { ReactNode } from 'react';
import { cx, t } from '../theme/tokens.js';

/**
 * A reference/source card: a neutral surface-2 header band carrying a mono, accent-colored title
 * (a class or API name that wraps cleanly rather than overflowing), and a plain body beneath.
 * Kept whole across page breaks.
 */
export function SourceCard({
  title,
  children,
}: {
  title: ReactNode;
  children: ReactNode;
}): JSX.Element {
  return (
    <div className={cx(t.border.base, 'break-inside-avoid overflow-hidden rounded-xl border')}>
      <div className={cx(t.bg.surface2, t.border.base, 'border-b px-4 py-2.5')}>
        <code className={cx(t.text.accent, t.font.mono, 'break-all text-sm font-medium')}>
          {title}
        </code>
      </div>
      <div className={cx(t.text.ink2, 'px-4 py-3 text-sm leading-relaxed')}>{children}</div>
    </div>
  );
}
