import { cx, t } from '../theme/tokens.js';

/**
 * A diagram card. It renders only the marker the `prerenderMermaid` generation pass replaces with
 * a recolored inline SVG — the mermaid source sits (HTML-escaped) inside the marker. An optional
 * title header and caption footer frame the diagram; the card chrome stays put while the pass
 * swaps the inner marker for the rendered SVG.
 */
export function Mermaid({
  chart,
  title,
  caption,
}: {
  chart: string;
  title?: string;
  caption?: string;
}): JSX.Element {
  return (
    <figure className={cx(t.border.base, 'break-inside-avoid overflow-hidden rounded-xl border')}>
      {title && (
        <figcaption
          className={cx(t.bg.surface2, t.text.ink, t.border.base, t.font.display, 'border-b px-4 py-2 text-sm font-semibold')}
        >
          {title}
        </figcaption>
      )}
      <div className={cx(t.bg.surface, 'flex justify-center px-4 py-4')}>
        <div data-mermaid="">{chart}</div>
      </div>
      {caption && (
        <figcaption className={cx(t.bg.surface2, t.text.ink3, t.border.base, 'border-t px-4 py-2 text-xs')}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
