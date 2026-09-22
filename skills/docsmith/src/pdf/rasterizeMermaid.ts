// Mermaid for the react-pdf path. react-pdf can't run mermaid and can't render its SVG faithfully
// (no foreignObject / HTML labels), so — per the chosen approach — we render the diagram in headless
// Chrome exactly as the HTML path does (same base theme vars, same per-shape `.label-container`
// recolor), then screenshot it to a transparent, high-DPI PNG and hand that to the Mermaid
// component as an <Image>. Chrome is used only to bake the diagram image, not to lay out the page.

import puppeteer from 'puppeteer';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { findChrome } from './chrome.js';
import { SHADCN } from '../theme/palette.js';
import type { PdfTheme } from './theme.js';

// Saturated role colors for diagram shapes — the agreed role palette (vanilla ShadCN has no such
// semantic colors). Mid-tones that read on both the light and dark ground.
const AMBER = '#d97706'; // amber-600 — warning
const EMERALD = '#059669'; // emerald-600 — positive

const MERMAID_JS_PATH = fileURLToPath(
  new URL('../../node_modules/mermaid/dist/mermaid.min.js', import.meta.url),
);
let mermaidJs: string | null = null;
function loadMermaidJs(): string {
  mermaidJs ??= readFileSync(MERMAID_JS_PATH, 'utf8');
  return mermaidJs;
}

/**
 * Per-shape node colors: a muted ShadCN fill with a saturated role stroke, one role per shape.
 * Vanilla ShadCN has no soft-tint tokens, so (as with the KeyBox/Callout components) nodes share the
 * theme-swapped `muted` fill and carry their role in the stroke.
 */
function shapeColors(theme: PdfTheme) {
  const c = SHADCN[theme];
  return {
    process: { fill: c.muted, stroke: c.primary }, // note/info → primary
    decision: { fill: c.muted, stroke: AMBER }, // warning → amber
    datastore: { fill: c.muted, stroke: EMERALD }, // positive → emerald
    terminal: { fill: c.muted, stroke: c['muted-foreground'] }, // neutral
  };
}

/** mermaid `base`-theme variables sourced from the ShadCN tokens so diagrams match the doc. */
function mermaidVars(theme: PdfTheme) {
  const c = SHADCN[theme];
  return {
    darkMode: theme === 'dark',
    background: 'transparent',
    fontFamily: "'Inter', system-ui, sans-serif",
    primaryColor: c.muted,
    primaryBorderColor: c.primary,
    primaryTextColor: c.foreground,
    mainBkg: c.muted,
    nodeBorder: c.primary,
    nodeTextColor: c.foreground,
    secondaryColor: c.muted,
    secondaryBorderColor: EMERALD,
    secondaryTextColor: c.foreground,
    tertiaryColor: c.muted,
    tertiaryBorderColor: AMBER,
    tertiaryTextColor: c.foreground,
    lineColor: c['muted-foreground'],
    textColor: c['muted-foreground'],
    clusterBkg: c.muted,
    clusterBorder: c.border,
    edgeLabelBackground: c.background,
    titleColor: c.foreground,
    noteBkgColor: c.muted,
    noteBorderColor: AMBER,
    noteTextColor: c.foreground,
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
