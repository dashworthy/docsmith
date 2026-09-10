import { cx, t } from '../theme/tokens.js';

/**
 * The provenance footer: a top hairline rule and a stack of muted mono lines (where a doc was
 * generated from, spec path, reference). One `<div>` per line.
 */
export function Footer({ lines }: { lines: string[] }): JSX.Element {
  return (
    <footer className={cx(t.border.base, t.text.ink3, t.font.mono, 'mt-16 border-t pt-5 text-xs leading-relaxed')}>
      {lines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </footer>
  );
}
