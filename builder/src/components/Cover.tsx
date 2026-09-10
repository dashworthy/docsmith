import type { ReactNode } from 'react';
import { cx, t } from '../theme/tokens.js';

/**
 * The document title band — the artifact's flat header: a muted mono eyebrow, a large
 * display-face title, an optional lede, and a row of metadata chips. Flat by design (a soft
 * surface band with a hairline border), no gradient or shadow.
 */
export function Cover({
  eyebrow,
  title,
  lede,
  chips,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: string;
  chips?: string[];
}): JSX.Element {
  return (
    <header
      className={cx(
        t.bg.surface2,
        t.border.base,
        'mb-12 rounded-xl border px-8 py-9',
      )}
    >
      {eyebrow && (
        <p
          className={cx(
            t.text.ink3,
            t.font.mono,
            'mb-3 text-xs font-medium uppercase tracking-[0.18em]',
          )}
        >
          {eyebrow}
        </p>
      )}
      <h1
        className={cx(
          t.text.ink,
          t.font.display,
          'text-4xl font-semibold leading-tight tracking-tight',
        )}
      >
        {title}
      </h1>
      {lede && (
        <p className={cx(t.text.ink2, 'mt-4 max-w-2xl text-lg leading-relaxed')}>{lede}</p>
      )}
      {chips && chips.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {chips.map((chip, i) => (
            <span
              key={i}
              className={cx(
                t.bg.surface,
                t.text.ink2,
                t.border.base,
                t.font.mono,
                'rounded-full border px-3 py-1 text-xs',
              )}
            >
              {chip}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}
