import type { ReactNode } from 'react';
import { cx, t } from '../theme/tokens.js';

/**
 * A two-column grid of panels (stacks to one column when the page is narrow). Wrap a set of
 * `Panel`s in it.
 */
export function PanelGrid({ children }: { children: ReactNode }): JSX.Element {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

/** A titled panel: a surface card with a hairline border, a display-face heading, and a body. */
export function Panel({ title, children }: { title: string; children: ReactNode }): JSX.Element {
  return (
    <div className={cx(t.bg.surface, t.border.base, 'break-inside-avoid rounded-xl border p-5')}>
      <h3 className={cx(t.text.ink, t.font.display, 'mb-2 font-semibold')}>{title}</h3>
      <div className={cx(t.text.ink2, 'text-sm leading-relaxed')}>{children}</div>
    </div>
  );
}
