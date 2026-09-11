import type { ReactNode } from 'react';
import { cx, t } from '../theme/tokens.js';

interface Phase {
  idx: string;
  title: ReactNode;
  body: string;
  /** A phase that can run alongside the others — tiled positive instead of accent. */
  parallel?: boolean;
}

/**
 * A vertical list of phases, each a numbered index tile beside a title and body. Normal phases
 * carry the accent tint; a `parallel` phase is tinted positive to mark that it is independent of
 * the sequence.
 */
export function Phases({ items }: { items: Phase[] }): JSX.Element {
  return (
    <div className="space-y-3">
      {items.map((phase, i) => {
        const tile = phase.parallel
          ? cx(t.bg.positiveSoft, t.text.positive)
          : cx(t.bg.accentSoft, t.text.accent);
        return (
          <div key={i} className="flex items-start gap-4 break-inside-avoid">
            <div
              className={cx(
                tile,
                t.font.mono,
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold',
              )}
            >
              {phase.idx}
            </div>
            <div>
              <h3 className={cx(t.text.ink, t.font.display, 'font-semibold')}>{phase.title}</h3>
              <p className={cx(t.text.ink2, 'mt-0.5 text-sm leading-relaxed')}>{phase.body}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
