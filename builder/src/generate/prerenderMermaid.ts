// Pre-render pass that turns each Mermaid marker into a static, recolored inline SVG at
// generation time — so the output carries a real vector diagram and no runtime JS. It is a
// whole-body Pass that needs the shared Chrome (ctx.chrome): it launches the browser once, loads
// mermaid, renders every `<div data-mermaid>…source…</div>` marker to SVG, recolors each node by
// its shape, and swaps the marker for the SVG.
//
// The per-shape recolor keys off mermaid's `.label-container` element (the shape; there is also a
// trailing label rect to leave alone), giving every diagram the same shape→role mapping:
// rectangle = process (accent), diamond = decision (warning), cylinder = data store (positive),
// circle/stadium = terminal (neutral). Fills use the SOFT role tint with a saturated stroke and
// dark-ink labels — the legible scheme carried over from md2pdf — so all node labels stay readable
// against one text color; edges/arrows stay a distinct neutral.

import puppeteer from 'puppeteer';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Pass } from './html.js';
import { PALETTE } from '../theme/palette.js';
import { unescapeHtml } from './htmlEntities.js';

/** Matches a Mermaid marker; `data-mermaid` may be bare or `=""` (React emits the latter). */
const MARKER = /<div data-mermaid(?:="")?>([\s\S]*?)<\/div>/g;

const MERMAID_JS_PATH = fileURLToPath(
  new URL('../../node_modules/mermaid/dist/mermaid.min.js', import.meta.url),
);
let mermaidJs: string | null = null;
/** The mermaid browser bundle, read once and injected into the render page. */
function loadMermaidJs(): string {
  mermaidJs ??= readFileSync(MERMAID_JS_PATH, 'utf8');
  return mermaidJs;
}

/** Per-shape node colors from the theme palette: soft fill + saturated stroke, one role per shape. */
function shapeColors(theme: 'light' | 'dark') {
  const p = PALETTE[theme];
  return {
    process: { fill: p.accentSoft, stroke: p.accent },
    decision: { fill: p.warningSoft, stroke: p.warning },
    datastore: { fill: p.positiveSoft, stroke: p.positive },
    terminal: { fill: p.surface2, stroke: p.ink3 },
  };
}

/** mermaid `base`-theme variables sourced from the palette so diagrams match the doc. */
function mermaidVars(theme: 'light' | 'dark') {
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

export const prerenderMermaid: Pass = async (bodyHtml, theme, ctx) => {
  const matches = [...bodyHtml.matchAll(MARKER)];
  if (matches.length === 0) return bodyHtml;
  if (!ctx.chrome) {
    throw new Error(
      'Cannot pre-render mermaid diagrams: no Chrome/Chromium found. Set CHROME_PATH or ' +
        'PUPPETEER_EXECUTABLE_PATH to a Chromium-family executable.',
    );
  }

  const browser = await puppeteer.launch({
    executablePath: ctx.chrome,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  });
  try {
    const page = await browser.newPage();
    await page.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>');
    await page.addScriptTag({ content: loadMermaidJs() });

    const vars = mermaidVars(theme);
    const sc = shapeColors(theme);
    let out = bodyHtml;

    for (const m of matches) {
      const [marker, escaped] = m;
      const chart = unescapeHtml(escaped).trim();
      const svg = await page.evaluate(
        // Runs in the browser: render the chart, recolor each node by its shape, size the svg to
        // fit, and return the recolored markup.
        async (chartSrc: string, themeVars: unknown, shape: Record<string, { fill: string; stroke: string }>) => {
          const mermaid = (window as unknown as { mermaid: any }).mermaid;
          mermaid.initialize({
            startOnLoad: false,
            theme: 'base',
            themeVariables: themeVars,
            // 'antiscript' keeps HTML labels but strips any script/click handlers, so the SVG
            // spliced into the output preserves the "no runtime JS" invariant even for a chart
            // that tries to inject a handler.
            securityLevel: 'antiscript',
            flowchart: { htmlLabels: true, curve: 'basis' },
          });
          const id = 'm' + Math.random().toString(36).slice(2);
          const { svg } = await mermaid.render(id, chartSrc);
          const holder = document.createElement('div');
          holder.innerHTML = svg;

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
            // Append so our declarations win over mermaid's inline fill/stroke. Set via the style
            // attribute (not the CSSOM) so the literal hex survives into the serialized markup.
            el.setAttribute('style', `${prev};fill:${c.fill};stroke:${c.stroke};stroke-width:1.4px`);
          });
          const svgEl = holder.querySelector('svg');
          if (svgEl) {
            const prev = svgEl.getAttribute('style') || '';
            svgEl.setAttribute('style', `${prev};max-width:100%;height:auto`);
          }
          return holder.innerHTML;
        },
        chart,
        vars,
        sc,
      );
      out = out.replace(marker, () => svg);
    }
    return out;
  } finally {
    await browser.close();
  }
};
