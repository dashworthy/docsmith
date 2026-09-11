import { Image, Text, View } from '@react-pdf/renderer';
import { FONT, usePalette } from '../theme.js';
import { Card, RADIUS } from './surface.js';
import type { RasterDiagram } from '../rasterizeMermaid.js';

/** The content box a diagram must fit within, in points (A4 minus page + card padding). */
const MAX_W = 468;
const MAX_H = 560;

/**
 * A diagram card wrapping a pre-rasterized mermaid PNG (see `rasterizeMermaid`). The image is fitted
 * within the column width and a single page's height, preserving aspect ratio. `overflow: 'hidden'`
 * clips the title/caption bands to the card radius, and the card carries a drop shadow.
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
  const c = usePalette();
  let w = MAX_W;
  let h = w / diagram.aspect;
  if (h > MAX_H) {
    h = MAX_H;
    w = h * diagram.aspect;
  }
  return (
    <Card radius={RADIUS.md} style={{ marginBottom: 10 }}>
        {title && (
          <View
            style={{
              backgroundColor: c.surface2,
              borderBottomColor: c.border,
              borderBottomWidth: 1,
              // Uneven padding (less top) optically centers the display caps, which sit slightly
              // above their line-box center even at lineHeight:1.
              paddingTop: 5.2,
              paddingBottom: 6.8,
              paddingHorizontal: 12,
            }}
          >
            <Text style={{ fontFamily: FONT.display, fontSize: 10, fontWeight: 600, color: c.ink, lineHeight: 1 }}>{title}</Text>
          </View>
        )}
        <View style={{ backgroundColor: c.surface, alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12 }}>
          <Image src={diagram.dataUri} style={{ width: w, height: h }} />
        </View>
        {caption && (
          <View
            style={{
              backgroundColor: c.surface2,
              borderTopColor: c.border,
              borderTopWidth: 1,
              // Extra top padding centers the text: with the natural line box, this mixed-case line
              // sits above the box center (descender space reserved below), so it reads high under
              // symmetric padding.
              paddingTop: 7.3,
              paddingBottom: 4.7,
              paddingHorizontal: 12,
            }}
          >
            <Text style={{ fontSize: 8, color: c.ink3 }}>{caption}</Text>
          </View>
        )}
    </Card>
  );
}
