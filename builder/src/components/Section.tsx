import type { ReactNode } from 'react';
import { cx, t } from '../theme/tokens.js';

/**
 * A section header in the artifact pattern: an accent kicker (eyebrow) above a clean bold title,
 * an optional muted deck line under it, then the section body. No underline or tab rule — the
 * accent lives only in the small kicker. The header stays glued to its body across page breaks.
 */
export function Section({
  eyebrow,
  title,
  deck,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  deck?: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <section className="mt-12 first:mt-0">
      <div className="break-after-avoid">
        {eyebrow && (
          <p
            className={cx(
              t.text.accent,
              t.font.mono,
              'mb-2 text-xs font-semibold uppercase tracking-[0.16em]',
            )}
          >
            {eyebrow}
          </p>
        )}
        <h2
          className={cx(
            t.text.ink,
            t.font.display,
            'text-2xl font-semibold tracking-tight',
          )}
        >
          {title}
        </h2>
        {deck && <p className={cx(t.text.ink2, 'mt-2 max-w-2xl leading-relaxed')}>{deck}</p>}
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}
