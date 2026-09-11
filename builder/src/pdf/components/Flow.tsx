import { Text, View } from '@react-pdf/renderer';
import { FONT, usePalette, type Palette } from '../theme.js';

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

/** Tone → its text color, soft fill, and border palette keys. */
const TONE: Record<Tone, { text: keyof Palette; soft: keyof Palette; border: keyof Palette }> = {
  bad: { text: 'negative', soft: 'negativeSoft', border: 'negative' },
  good: { text: 'positive', soft: 'positiveSoft', border: 'positive' },
};

/** Stacked flow lanes: a tinted row with a tag and mono step chips separated by arrows. */
export function Flow({ lanes }: { lanes: Lane[] }): JSX.Element {
  const c = usePalette();
  return (
    <View style={{ marginBottom: 10 }}>
      {lanes.map((lane, i) => {
        const lt = TONE[lane.tone];
        return (
          <View
            key={i}
            wrap={false}
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 8,
              backgroundColor: c[lt.soft],
              borderColor: c[lt.border],
              borderWidth: 1,
              borderRadius: 8,
              padding: 9,
              marginBottom: 8,
            }}
          >
            <Text
              style={{ color: c[lt.text], fontFamily: FONT.mono, fontSize: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              {lane.tag}
            </Text>
            {lane.steps.map((step, j) => {
              const st = step.tone ? TONE[step.tone] : null;
              return (
                <View key={j} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {j > 0 && <Text style={{ color: c.ink3 }}>→</Text>}
                  <Text
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: 8.5,
                      color: st ? c[st.text] : c.ink2,
                      backgroundColor: st ? c[st.soft] : c.surface2,
                      paddingHorizontal: 6,
                      paddingVertical: 3,
                      borderRadius: 4,
                    }}
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
