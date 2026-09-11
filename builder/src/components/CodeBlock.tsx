import { cx, t } from '../theme/tokens.js';

/**
 * A code block. It renders only the marker the `prerenderCode` generation pass replaces with
 * Shiki-highlighted HTML — the source sits (HTML-escaped) inside the marker, and the language
 * rides `data-code-lang`. The bordered, scrollable card chrome around the marker stays put; the
 * pass swaps only the inner marker for the highlighted `<pre>`.
 */
export function CodeBlock({ code, lang }: { code: string; lang: string }): JSX.Element {
  return (
    <div className={cx(t.border.base, 'overflow-x-auto rounded-lg border text-sm')}>
      <div data-code="" data-code-lang={lang}>
        {code}
      </div>
    </div>
  );
}
