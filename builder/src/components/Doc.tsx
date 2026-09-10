import type { ReactNode } from 'react';
import { cx, t } from '../theme/tokens.js';

/**
 * The document root: a `<main>` that establishes the page ground, base ink color, and the sans
 * body face, then lays its children out in a centered, comfortably padded column. Everything
 * else in a doc nests inside one `<Doc>`.
 */
export function Doc({ children }: { children: ReactNode }): JSX.Element {
  return (
    <main
      className={cx(
        t.bg.ground,
        t.text.ink,
        t.font.sans,
        'min-h-screen antialiased leading-relaxed',
      )}
    >
      <div className="mx-auto w-full max-w-3xl px-10 py-12">{children}</div>
    </main>
  );
}
