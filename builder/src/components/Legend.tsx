import { cx, cssVar, t } from '../theme/tokens.js';
import type { TokenName } from '../theme/palette.js';

type Role = 'accent' | 'positive' | 'negative' | 'warning' | 'neutral';

/** Legend role → the palette variable its dot fills with (`neutral` borrows the muted ink). */
const DOT: Record<Role, TokenName> = {
  accent: 'accent',
  positive: 'positive',
  negative: 'negative',
  warning: 'warning',
  neutral: 'ink3',
};

/**
 * A horizontal tint legend: one colored dot + label per role. The dot color comes through the
 * `cssVar` escape hatch (an inline `background`), since a color driven by data can't be a static
 * Tailwind class.
 */
export function Legend({ items }: { items: { role: Role; label: string }[] }): JSX.Element {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {items.map((item, i) => (
        <span key={i} className={cx(t.text.ink2, 'inline-flex items-center gap-2 text-sm')}>
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: cssVar(DOT[item.role]) }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}
