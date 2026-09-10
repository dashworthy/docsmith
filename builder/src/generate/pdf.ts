// Prints a generated HTML file to PDF with headless Chrome. Reuses md2pdf.mjs's proven
// page.pdf settings. Because our HTML carries no runtime JS (diagrams and code are pre-rendered
// to static markup), the render-gate is simply "network idle + web fonts loaded" rather than a
// script-set flag.

import puppeteer from 'puppeteer';
import { pathToFileURL } from 'node:url';

export async function renderPdf(htmlPath: string, pdfPath: string, chrome: string): Promise<void> {
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  });
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle0', timeout: 60000 });
    // Deterministic render-gate: wait for the web fonts so text metrics are final before printing.
    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
    });
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: false,
      preferCSSPageSize: true,
    });
  } finally {
    await browser.close();
  }
}
