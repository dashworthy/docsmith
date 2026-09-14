import { Image, Text, View } from '@react-pdf/renderer';
import { TYPE, useTw } from '../theme.js';
import { Card, RADIUS } from './surface.js';
import type { RasterDiagram } from '../rasterizeMermaid.js';

/** The content box a diagram must fit within, in points (A4 minus page + card padding). */
const MAX_W = 468;
const MAX_H = 560;

/**
 * A diagram card wrapping a pre-rasterized mermaid PNG (see `rasterizeMermaid`). The image is fitted
 * within the column width and a single page's height, preserving aspect ratio. A thin wrapper over
 * `Card`: the `title` rides the shared mono header band and the `caption` rides the shared muted
 * footer band — both owned by `Card` — so this component supplies only the fitted image body.
 */
export function Mermaid({
  diagram,
  title,
  caption,
}: {
  diagram: RasterDiagram;
  title?: string;
  caption?: string;
}): JSX.Element {
  const tw = useTw();
  let w = MAX_W;
  let h = w / diagram.aspect;
  if (h > MAX_H) {
    h = MAX_H;
    w = h * diagram.aspect;
  }
  return (
    <Card
      radius={RADIUS.md}
      title={title}
      footer={caption ? <Text style={[tw('text-fg-muted'), { fontSize: TYPE.caption }]}>{caption}</Text> : undefined}
      footerTone="muted"
      style={{ marginBottom: 10 }}
    >
      <View style={[tw('bg-card items-center'), { paddingVertical: 14, paddingHorizontal: 12 }]}>
        <Image src={diagram.dataUri} style={{ width: w, height: h }} />
      </View>
    </Card>
  );
}
