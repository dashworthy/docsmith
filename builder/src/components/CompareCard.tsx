import type { ReactNode } from 'react';
import { cx, cssVar, t } from '../theme/tokens.js';
import type { TokenName } from '../theme/palette.js';

type ColRole = 'warning' | 'negative' | 'positive';

interface Column {
  label: string;
  role: ColRole;
  items: ReactNode[];
}

/** Column role → its text-color token, for the role-tinted column label. */
const ROLE_TEXT: Record<ColRole, string> = {
  warning: t.text.warning,
  negative: t.text.negative,
  positive: t.text.positive,
};

/** Column role → the palette variable its swatch fills with — typed, so no unchecked cast. */
const ROLE_VAR: Record<ColRole, TokenName> = {
  warning: 'warning',
  negative: 'negative',
  positive: 'positive',
};

function Col({ col, bordered }: { col: Column; bordered?: boolean }): JSX.Element {
  return (
    <div className={cx('px-5 py-4', bordered && cx(t.border.base, 'border-l'))}>
      <div
        className={cx(
          ROLE_TEXT[col.role],
          'mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide',
        )}
      >
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ background: cssVar(ROLE_VAR[col.role]) }}
        />
        {col.label}
      </div>
      <ul className={cx(t.text.ink2, 'list-disc space-y-1 pl-4 text-sm leading-relaxed')}>
        {col.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * A two-column comparison card: a neutral surface-2 header band carrying a
 * muted number and the title, two role-tinted columns (today vs. target), and an optional
 * accent-soft target footer. Kept whole across page breaks.
 */
export function CompareCard({
  num,
  title,
  a,
  b,
  target,
}: {
  num: string;
  title: string;
  a: Column;
  b: Column;
  target?: ReactNode;
}): JSX.Element {
  return (
    <div className={cx(t.border.base, 'break-inside-avoid overflow-hidden rounded-xl border')}>
      <div className={cx(t.bg.surface2, t.border.base, 'flex items-center gap-3 border-b px-5 py-3')}>
        <span className={cx(t.text.ink3, t.font.mono, 'text-sm')}>{num}</span>
        <h3 className={cx(t.text.ink, t.font.display, 'font-semibold')}>{title}</h3>
      </div>
      <div className="grid grid-cols-2">
        <Col col={a} />
        <Col col={b} bordered />
      </div>
      {target && (
        <div className={cx(t.bg.accentSoft, t.text.ink2, t.border.base, 'border-t px-5 py-3 text-sm')}>
          <b className={t.text.accent}>Target </b>
          {target}
        </div>
      )}
    </div>
  );
}
