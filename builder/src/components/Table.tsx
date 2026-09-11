import type { ReactNode } from 'react';
import { cx, t } from '../theme/tokens.js';

/**
 * A data table with an accent-soft header band and a zebra-striped body. Wrapped in a bordered,
 * horizontally-scrollable frame so a wide table never runs off the page.
 */
export function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }): JSX.Element {
  return (
    <div className={cx(t.border.base, 'overflow-x-auto rounded-lg border')}>
      <table className="w-full border-collapse text-sm">
        <thead className={cx(t.bg.accentSoft, t.text.accent)}>
          <tr>
            {head.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={t.text.ink2}>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 1 ? t.bg.surface2 : t.bg.surface}>
              {row.map((cell, j) => (
                <td key={j} className={cx(t.border.base, 'border-t px-3 py-2 align-top')}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
