// Render a react-pdf document element to a .pdf file. This is the react-pdf path's answer to the
// HTML path's Puppeteer print: react-pdf lays the PDF out itself from the primitive tree, so no
// browser is involved in pagination (Chrome is used only, upstream, to rasterize mermaid diagrams
// to images).

import type { ReactElement } from 'react';
import { renderToFile } from '@react-pdf/renderer';

export async function renderPdfToFile(doc: ReactElement, outPath: string): Promise<void> {
  await renderToFile(doc, outPath);
}
