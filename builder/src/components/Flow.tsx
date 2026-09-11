import { cx, t } from '../theme/tokens.js';

type Tone = 'bad' | 'good';

interface Step {
  text: string;
  /** Overrides the chip tint for a single step; defaults to neutral. */
  tone?: Tone;
}

interface Lane {
  tag: string;
  tone: Tone;
  steps: Step[];
}

/** Lane/step tone → its className fragments: role text color, soft fill, and border token. */
const TONE: Record<Tone, { text: string; soft: string; border: string }> = {
  bad: { text: t.text.negative, soft: t.bg.negativeSoft, border: t.border.negative },
  good: { text: t.text.positive, soft: t.bg.positiveSoft, border: t.border.positive },
};

/**
 * Stacked flow lanes: each lane is a tinted row with a tag and a sequence of mono step chips
 * separated by arrows. The lane tone tints the row (a "today" lane negative, a "target" lane
 * positive); an individual step may override its own chip tone.
 */
export function Flow({ lanes }: { lanes: Lane[] }): JSX.Element {
  return (
    <div className="space-y-3">
      {lanes.map((lane, i) => {
        const lt = TONE[lane.tone];
        return (
          <div
            key={i}
            className={cx(lt.soft, lt.border, 'flex flex-wrap items-center gap-3 rounded-lg border p-3 break-inside-avoid')}
          >
            <span className={cx(lt.text, t.font.mono, 'text-xs font-semibold uppercase tracking-wide')}>
              {lane.tag}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {lane.steps.map((step, j) => {
                const st = step.tone ? TONE[step.tone] : null;
                return (
                  <span key={j} className="flex items-center gap-2">
                    {j > 0 && <span className={t.text.ink3}>→</span>}
                    <span
                      className={cx(
                        st ? cx(st.soft, st.text) : cx(t.bg.surface2, t.text.ink2),
                        t.font.mono,
                        'rounded px-2 py-1 text-xs',
                      )}
                    >
                      {step.text}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
