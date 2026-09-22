import { Text, View } from '@react-pdf/renderer';
import { FONT, useTw } from '../theme.js';

type Tone = 'bad' | 'good';

interface Step {
  text: string;
  tone?: Tone;
}

interface Lane {
  tag: string;
  tone: Tone;
  steps: Step[];
}

/**
 * Tone → its ShadCN/Tailwind text + border class (the agreed role palette: bad→destructive,
 * good→emerald). Lanes fill with the theme-safe `muted` token and carry the tone in the border,
 * the tag, and the toned step chips — no fixed soft tints (which would glare in the dark theme).
 */
const TONE: Record<Tone, { text: string; border: string }> = {
  bad: { text: 'text-destructive', border: 'border-destructive' },
  good: { text: 'text-emerald-600', border: 'border-emerald-600' },
};

/** Stacked flow lanes: a muted row with a tone tag and mono step chips separated by arrows. */
export function Flow({ lanes }: { lanes: Lane[] }): JSX.Element {
  const tw = useTw();
  return (
    <View style={{ marginBottom: 10 }}>
      {lanes.map((lane, i) => {
        const lt = TONE[lane.tone];
        return (
          <View
            key={i}
            wrap={false}
            style={[
              tw(`flex-row flex-wrap items-center gap-2 bg-muted rounded-lg border ${lt.border}`),
              { padding: 9, marginBottom: 8 },
            ]}
          >
            <Text
              style={[
                tw(`${lt.text} uppercase`),
                { fontFamily: FONT.mono, fontSize: 8, fontWeight: 500, letterSpacing: 0.5 },
              ]}
            >
              {lane.tag}
            </Text>
            {lane.steps.map((step, j) => {
              const st = step.tone ? TONE[step.tone] : null;
              return (
                <View key={j} style={tw('flex-row items-center gap-1.5')}>
                  {j > 0 && <Text style={[tw('text-fg-muted'), { fontFamily: FONT.mono }]}>→</Text>}
                  <Text
                    style={[
                      tw(st ? `bg-card border ${st.border} ${st.text} rounded` : 'bg-card border border-border text-fg-muted rounded'),
                      { fontFamily: FONT.mono, fontSize: 8.5, paddingHorizontal: 6, paddingVertical: 3 },
                    ]}
                  >
                    {step.text}
                  </Text>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}
