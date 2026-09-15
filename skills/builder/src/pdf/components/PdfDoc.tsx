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
  children,
}: {
  theme: PdfTheme;
  title: string;
  children: ReactNode;
}): JSX.Element {
  registerFonts();
  const tw = useMemo(() => createTw(shadcnConfig(theme)), [theme]);
  const styles = StyleSheet.create({
    page: {
      // The page ground + base ink are the vanilla ShadCN `background` / `foreground` tokens.
      backgroundColor: tw('bg-background').backgroundColor,
      color: tw('text-foreground').color,
      fontFamily: FONT.sans,
      fontSize: TYPE.body,
      lineHeight: 1.5,
      paddingVertical: PAGE.paddingV,
      paddingHorizontal: PAGE.paddingH,
    },
  });
  return (
    <TwProvider value={tw}>
      <Document title={title}>
        <Page size="A4" style={styles.page}>
          {children}
        </Page>
      </Document>
    </TwProvider>
  );
}
