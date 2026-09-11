import type { ReactNode } from 'react';
import { View } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';
import { useTw } from '../theme.js';

/** Card corner radii, shared so a card body and its rounded header/footer bands agree. */
export const RADIUS = { md: 10, lg: 12 } as const;

/**
 * A rounded, bordered card frame with clipped corners. The border and the corner-clip cannot live
 * on the same view: react-pdf clips a child's background to the *outer* (border) box, so a
 * full-bleed header/footer band paints over the border stroke at the rounded corners and the
 * border vanishes there. So we split the two jobs — an inner view clips the bands to the radius
 * (no border of its own), and the border is drawn as an absolutely-positioned overlay on top,
 * where nothing can paint over it. `children` are the bands/body; they fill to the clipped edge.
 */
export function Card({
  radius,
  children,
  border,
  style,
}: {
  radius: number;
  children: ReactNode;
  /** Border color; defaults to the ShadCN `border` token for a defined edge. */
  border?: string;
  style?: Style;
}): JSX.Element {
  const tw = useTw();
  return (
    <Elevated radius={radius} style={style}>
      <View style={{ position: 'relative', borderRadius: radius }}>
        <View style={{ borderRadius: radius, overflow: 'hidden' }}>{children}</View>
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderColor: border ?? tw('border-border').borderColor,
            borderWidth: 1,
            borderRadius: radius,
          }}
        />
      </View>
    </Elevated>
  );
}

/**
 * A card wrapper that keeps a card atomic on the page. It carries no drop shadow — cards read as
 * flat, bordered surfaces — but stays a distinct component so callers keep a single, consistent
 * card boundary (and the `radius` prop documents the corner the child's border/overflow honors).
 */
export function Elevated({
  children,
  style,
}: {
  /** The card's corner radius, kept in the signature so call sites read consistently. */
  radius?: number;
  children: ReactNode;
  style?: Style;
}): JSX.Element {
  // Atomic: a card never splits across pages — blocks shorter than a full page relocate to the next
  // page rather than clipping.
  return <View wrap={false} style={style}>{children}</View>;
}
