import type { ReactNode } from 'react';
import { Text, View } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';
import { FONT, TYPE, useTw } from '../theme.js';

/** Card corner radii, shared so a card body and its rounded header/footer bands agree. */
export const RADIUS = { md: 10, lg: 12 } as const;

/** A footer band's tone: `accent` = the emphasized target band; `muted` = a subdued caption. */
export type FooterTone = 'accent' | 'muted';

/**
 * The shared card header band. Every titled card renders exactly this — a muted band with a mono,
 * indigo, `TYPE.cardTitle` title — so all category-card headers are identical by construction
 * (they cannot each hand-roll their own and drift apart). Owned here, not by the wrappers.
 */
function HeaderBand({ title }: { title: string }): JSX.Element {
  const tw = useTw();
  return (
    <View
      style={[
        tw('bg-muted border-b border-border'),
        // Extra top padding optically centers the mono caps, which sit above their line-box center.
        { paddingTop: 8.2, paddingBottom: 5.8, paddingHorizontal: 13 },
      ]}
    >
      <Text style={[tw('text-brand-ink'), { fontFamily: FONT.mono, fontSize: TYPE.cardTitle }]}>{title}</Text>
    </View>
  );
}

/**
 * The shared card footer band. Card owns the band frame + tone (a top border and the tint); the
 * caller supplies the inner `content` (which varies — a mono kicker + body for the accent target,
 * a single muted line for a caption). `accent` reads as the emphasized target (brand-soft fill,
 * dashed divider); `muted` as a subdued caption (muted fill, solid divider).
 */
function FooterBand({ tone, content }: { tone: FooterTone; content: ReactNode }): JSX.Element {
  const tw = useTw();
  return (
    <View
      style={[
        tw(tone === 'accent' ? 'bg-brand-soft' : 'bg-muted'),
        {
          borderTopWidth: 1,
          borderTopColor: tw('border-border').borderColor,
          borderStyle: tone === 'accent' ? 'dashed' : 'solid',
          paddingVertical: 8,
          paddingHorizontal: 14,
        },
      ]}
    >
      {content}
    </View>
  );
}

/**
 * A rounded, bordered card frame with clipped corners, optionally wrapping a shared header band
 * (`title`) and/or footer band (`footer` + `footerTone`). The border and the corner-clip cannot
 * live on the same view: react-pdf clips a child's background to the *outer* (border) box, so a
 * full-bleed band paints over the border stroke at the rounded corners and the border vanishes
 * there. So we split the two jobs — an inner view clips the header/body/footer to the radius (no
 * border of its own), and the border is drawn as an absolutely-positioned overlay on top, where
 * nothing can paint over it. The `children` body is a raw slot: each wrapper controls its own body
 * padding/background, since bodies differ (padded text, edge-to-edge columns, a centered image).
 */
export function Card({
  radius = RADIUS.md,
  title,
  footer,
  footerTone = 'muted',
  children,
  border,
  style,
}: {
  radius?: number;
  /** When set, Card renders the shared mono header band (owned here, not by the wrapper). */
  title?: string;
  /** When set, Card renders a footer band around this content. */
  footer?: ReactNode;
  /** The footer band's tone; only meaningful when `footer` is set. */
  footerTone?: FooterTone;
  children: ReactNode;
  /** Border color; defaults to the ShadCN `border` token for a defined edge. */
  border?: string;
  style?: Style;
}): JSX.Element {
  const tw = useTw();
  return (
    <Elevated radius={radius} style={style}>
      <View style={{ position: 'relative', borderRadius: radius }}>
        <View style={{ borderRadius: radius, overflow: 'hidden' }}>
          {title !== undefined && <HeaderBand title={title} />}
          {children}
          {footer !== undefined && footer !== false && footer !== null && (
            <FooterBand tone={footerTone} content={footer} />
          )}
        </View>
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
