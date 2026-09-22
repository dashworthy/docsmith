import { useMemo, type ReactNode } from 'react';
import { Document, Page, StyleSheet } from '@react-pdf/renderer';
import { createTw } from 'react-pdf-tailwind';
import { FONT, PAGE, TYPE, TwProvider, registerFonts, shadcnConfig, type PdfTheme } from '../theme.js';

/**
 * The react-pdf document root. Unlike the HTML path (where a headless-Chrome print leaves the
 * page margin unpainted), react-pdf has a true paged model: the `<Page>` owns its own
 * `backgroundColor` and `padding`, so every printed page is the ground color to the paper edge
 * with a uniform doc-like inset — no fixed-layer tricks, no white margin band. Content longer than
 * one page flows and paginates automatically.
 */
export function PdfDoc({
  theme,
  title,
  cover,
  frontMatter,
  children,
}: {
  theme: PdfTheme;
  title: string;
  /**
   * An optional full-bleed cover rendered as its own dedicated first `<Page>` — no page inset, so a
   * `CoverPage`'s tinted hero bleeds to the paper edge. Content `children` start on the page after.
   */
  cover?: ReactNode;
  /**
   * Optional front-matter (e.g. a `Toc`) rendered on its own inset `<Page>` between the cover and the
   * body. Kept out of `children` so it reads as an unnumbered front-matter page — the body's own page
   * numbering starts on the first content page after it.
   */
  frontMatter?: ReactNode;
  children: ReactNode;
}): JSX.Element {
  registerFonts();
  const tw = useMemo(() => createTw(shadcnConfig(theme)), [theme]);
  const ground = tw('bg-background').backgroundColor;
  const styles = StyleSheet.create({
    page: {
      // The page ground + base ink are the vanilla ShadCN `background` / `foreground` tokens.
      backgroundColor: ground,
      color: tw('text-foreground').color,
      fontFamily: FONT.sans,
      fontSize: TYPE.body,
      lineHeight: 1.5,
      paddingVertical: PAGE.paddingV,
      paddingHorizontal: PAGE.paddingH,
    },
    // The cover page carries no inset — the cover fills it corner to corner and paints its own ground.
    coverPage: {
      backgroundColor: ground,
      color: tw('text-foreground').color,
      fontFamily: FONT.sans,
      fontSize: TYPE.body,
      lineHeight: 1.5,
      padding: 0,
    },
  });
  return (
    <TwProvider value={tw}>
      <Document title={title}>
        {cover && (
          <Page size="A4" style={styles.coverPage}>
            {cover}
          </Page>
        )}
        {frontMatter && (
          <Page size="A4" style={styles.page}>
            {frontMatter}
          </Page>
        )}
        <Page size="A4" style={styles.page}>
          {children}
        </Page>
      </Document>
    </TwProvider>
  );
}
