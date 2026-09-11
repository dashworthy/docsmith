import type { ReactNode } from 'react';
import { Document, Page, StyleSheet } from '@react-pdf/renderer';
import { FONT, PAGE, ThemeProvider, paletteFor, registerFonts, type PdfTheme } from '../theme.js';

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
  children,
}: {
  theme: PdfTheme;
  title: string;
  children: ReactNode;
}): JSX.Element {
  registerFonts();
  const c = paletteFor(theme);
  const styles = StyleSheet.create({
    page: {
      backgroundColor: c.ground,
      color: c.ink,
      fontFamily: FONT.sans,
      fontSize: 10.5,
      lineHeight: 1.5,
      paddingVertical: PAGE.paddingV,
      paddingHorizontal: PAGE.paddingH,
    },
  });
  return (
    <ThemeProvider value={c}>
      <Document title={title}>
        <Page size="A4" style={styles.page}>
          {children}
        </Page>
      </Document>
    </ThemeProvider>
  );
}
