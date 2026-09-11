// Mermaid for the react-pdf path. react-pdf can't run mermaid and can't render its SVG faithfully
// (no foreignObject / HTML labels), so — per the chosen approach — we render the diagram in headless
// Chrome exactly as the HTML path does (same base theme vars, same per-shape `.label-container`
// recolor), then screenshot it to a transparent, high-DPI PNG and hand that to the Mermaid
// component as an <Image>. Chrome is used only to bake the diagram image, not to lay out the page.

import puppeteer from 'puppeteer';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { findChrome } from '../generate/chrome.js';
import { PALETTE } from '../theme/palette.js';
import type { PdfTheme } from './theme.js';

const MERMAID_JS_PATH = fileURLToPath(
  new URL('../../node_modules/mermaid/dist/mermaid.min.js', import.meta.url),
);
let mermaidJs: string | null = null;
function loadMermaidJs(): string {
  mermaidJs ??= readFileSync(MERMAID_JS_PATH, 'utf8');
  return mermaidJs;
}

/** Per-shape node colors: soft fill + saturated stroke, one role per shape (matches the HTML path). */
function shapeColors(theme: PdfTheme) {
  const p = PALETTE[theme];
  return {
    process: { fill: p.accentSoft, stroke: p.accent },
    decision: { fill: p.warningSoft, stroke: p.warning },
    datastore: { fill: p.positiveSoft, stroke: p.positive },
    terminal: { fill: p.surface2, stroke: p.ink3 },
  };
}

/** mermaid `base`-theme variables sourced from the palette so diagrams match the doc. */
function mermaidVars(theme: PdfTheme) {
  const p = PALETTE[theme];
  return {
    darkMode: theme === 'dark',
    background: 'transparent',
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    primaryColor: p.accentSoft,
    primaryBorderColor: p.accent,
    primaryTextColor: p.ink,
    mainBkg: p.accentSoft,
    nodeBorder: p.accent,
    nodeTextColor: p.ink,
    secondaryColor: p.positiveSoft,
    secondaryBorderColor: p.positive,
    secondaryTextColor: p.ink,
    tertiaryColor: p.warningSoft,
    tertiaryBorderColor: p.warning,
    tertiaryTextColor: p.ink,
    lineColor: p.ink3,
    textColor: p.ink2,
    clusterBkg: p.surface2,
    clusterBorder: p.borderStrong,
    edgeLabelBackground: p.surface,
    titleColor: p.ink,
    noteBkgColor: p.warningSoft,
    noteBorderColor: p.warning,
    noteTextColor: p.ink,
  };
}

/** A rasterized diagram: a PNG data URI and its intrinsic aspect ratio (width / height). */
export interface RasterDiagram {
  dataUri: string;
  aspect: number;
}

/** Render one mermaid chart to a transparent, high-DPI PNG for embedding in the PDF. */
export async function rasterizeMermaid(chart: string, theme: PdfTheme): Promise<RasterDiagram> {
  const chrome = findChrome();
  if (!chrome) {
    throw new Error(
      'Cannot rasterize mermaid: no Chrome/Chromium found. Set CHROME_PATH or ' +
        'PUPPETEER_EXECUTABLE_PATH to a Chromium-family executable.',
    );
  }
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  });
  try {
    const page = await browser.newPage();
    // High device scale so the rasterized diagram stays crisp when placed in the PDF. A flowchart's
    // natural width is often only a few hundred CSS px; displayed at the column width (~468pt) that
    // would upscale a 3× capture into softness, so we capture at 5× (~300+ DPI at print size).
    await page.setViewport({ width: 1400, height: 1000, deviceScaleFactor: 5 });
    await page.setContent(
      '<!doctype html><html><head><meta charset="utf-8">' +
        '<style>body{margin:0;background:transparent}#d{display:inline-block}</style></head><body></body></html>',
    );
    await page.addScriptTag({ content: loadMermaidJs() });

    const size = await page.evaluate(
      async (chartSrc: string, themeVars: unknown, shape: Record<string, { fill: string; stroke: string }>) => {
        const mermaid = (window as unknown as { mermaid: any }).mermaid;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          themeVariables: themeVars,
          securityLevel: 'antiscript',
          flowchart: { htmlLabels: true, curve: 'basis' },
        });
        const id = 'm' + Math.random().toString(36).slice(2);
        const { svg } = await mermaid.render(id, chartSrc);
        const holder = document.createElement('div');
        holder.id = 'd';
        holder.innerHTML = svg;
        document.body.appendChild(holder);

        const KIND: Record<string, string> = {
          rect: 'process',
          polygon: 'decision',
          path: 'datastore',
          circle: 'terminal',
          ellipse: 'terminal',
        };
        holder.querySelectorAll('svg g.node').forEach((node) => {
          const el = node.querySelector('.label-container');
          if (!el) return;
          const c = shape[KIND[el.tagName.toLowerCase()]];
          if (!c) return;
          const prev = el.getAttribute('style') || '';
          el.setAttribute('style', `${prev};fill:${c.fill};stroke:${c.stroke};stroke-width:1.4px`);
        });
        const svgEl = holder.querySelector('svg') as SVGSVGElement;
        // Pin explicit pixel dimensions so the screenshot captures the whole diagram at natural size.
        const rect = svgEl.getBoundingClientRect();
        svgEl.setAttribute('width', String(rect.width));
        svgEl.setAttribute('height', String(rect.height));
        svgEl.style.maxWidth = 'none';
        return { w: rect.width, h: rect.height };
      },
      chart.trim(),
      mermaidVars(theme),
      shapeColors(theme),
    );

    const el = await page.$('#d');
    if (!el) throw new Error('mermaid: diagram element not found after render');
    const png = (await el.screenshot({ omitBackground: true, type: 'png' })) as Buffer;
    const dataUri = `data:image/png;base64,${png.toString('base64')}`;
    return { dataUri, aspect: size.w / size.h };
  } finally {
    await browser.close();
  }
}
