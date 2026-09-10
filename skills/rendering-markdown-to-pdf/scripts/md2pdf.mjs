#!/usr/bin/env node
// md2pdf.mjs — Convert a Markdown file into a print-ready A4 PDF with mermaid
// diagrams rendered (as vector SVG) inside titled "cards", plus an optional
// "designed" theme: design tokens, web fonts, a frontmatter cover page, admonition
// callouts, badges, eyebrow section kickers, and styled tables.
//
// Usage:
//   node md2pdf.mjs <input.md> [output.pdf] [options]
//
// Options:
//   --design <designed|plain>   Visual theme (default: designed)
//   --accent <blue|green|slate|purple>   Accent colour (default: blue)
//   --theme  <default|neutral|forest|dark|base>   Mermaid theme (default: default)
//   --no-cards            Render diagrams plain (no title/caption/background card)
//   --title  "<text>"     Document <title> (default: frontmatter title or filename)
//   --keep-html           Write the intermediate .html next to the PDF (debugging)
//
// Authoring niceties (designed theme):
//   * YAML frontmatter (title/subtitle/eyebrow/author/status/date/version/reference/chips)
//     becomes a cover header with metadata chips.
//   * GitHub admonitions:  > [!NOTE] / [!TIP] / [!IMPORTANT] / [!WARNING] / [!CAUTION]
//   * Inline badges:  [[Label]]  [[positive:Done]]  [[warning:Beta]]  [[negative:Old]]  [[accent:New]]
//   * Eyebrow kicker above a heading:  <!-- eyebrow: The headline finding -->
//   * Diagram card title/caption:  <!-- figure: Title | Caption -->  or  <!-- caption: ... -->
//
// Requires: Node >= 18, a local Chrome/Chromium, and puppeteer-core (see SKILL.md).

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve, join, basename } from 'node:path';
import { tmpdir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
const VENDOR = join(HERE, 'vendor');

// Pinned browser libraries, downloaded once into ./vendor on first run.
const LIBS = {
  'marked.min.js': 'https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js',
  'mermaid.min.js': 'https://cdn.jsdelivr.net/npm/mermaid@11.17.2/dist/mermaid.min.js',
};

// Accent presets. `text` drives the design-system --accent; the rest style the
// diagram-card header band and its tinted dot-grid canvas.
const ACCENTS = {
  blue:   { text: '#1e5fbf', soft: '#e9eefb', band1: '#eef4fd', band2: '#e4edfb', border: '#d3e0f5', canvas: '#f5f8fe', dot: 'rgba(20,60,140,0.07)' },
  green:  { text: '#0a7a52', soft: '#d9f2e8', band1: '#f0f6f3', band2: '#e9f1ec', border: '#d3e4db', canvas: '#f6faf8', dot: 'rgba(20,80,60,0.07)' },
  slate:  { text: '#475569', soft: '#e8eef4', band1: '#f1f5f9', band2: '#e8eef4', border: '#dbe3ec', canvas: '#f8fafc', dot: 'rgba(30,41,59,0.06)' },
  purple: { text: '#6d28d9', soft: '#efe8fb', band1: '#f5f1fd', band2: '#efe8fb', border: '#e0d5f5', canvas: '#faf8fe', dot: 'rgba(80,40,140,0.07)' },
};

function parseArgs(argv) {
  const a = { _: [], design: 'designed', accent: 'blue', theme: 'default', cards: true, keepHtml: false, title: null, help: false };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === '--no-cards') a.cards = false;
    else if (t === '--design') a.design = argv[++i];
    else if (t === '--accent') a.accent = argv[++i];
    else if (t === '--theme') a.theme = argv[++i];
    else if (t === '--title') a.title = argv[++i];
    else if (t === '--keep-html') a.keepHtml = true;
    else if (t === '-h' || t === '--help') a.help = true;
    else a._.push(t);
  }
  return a;
}

function usage() {
  process.stdout.write(
    'Usage: node md2pdf.mjs <input.md> [output.pdf]\n' +
    '       [--design designed|plain] [--accent blue|green|slate|purple]\n' +
    '       [--theme default|neutral|forest|dark|base] [--no-cards] [--title "…"] [--keep-html]\n'
  );
}

async function ensureVendor() {
  if (!existsSync(VENDOR)) mkdirSync(VENDOR, { recursive: true });
  for (const [file, url] of Object.entries(LIBS)) {
    const dest = join(VENDOR, file);
    if (existsSync(dest)) continue;
    process.stderr.write('Downloading ' + file + ' (first run only)...\n');
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to download ' + url + ' — HTTP ' + res.status);
    writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  }
}

const escHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const unquote = (s) => s.replace(/^['"]|['"]$/g, '').trim();

// Minimal YAML-frontmatter parser: scalars, block lists (`- item`), inline lists (`[a, b]`).
function parseFrontmatter(md) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(md);
  if (!m) return { data: {}, body: md };
  const data = {};
  let curKey = null;
  for (const line of m[1].split(/\r?\n/)) {
    const li = /^\s*-\s+(.*)$/.exec(line);
    if (li && curKey) {
      if (!Array.isArray(data[curKey])) data[curKey] = [];
      data[curKey].push(unquote(li[1]));
      continue;
    }
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (kv) {
      const k = kv[1].trim();
      const v = kv[2].trim();
      curKey = k;
      if (v === '') data[k] = [];
      else if (/^\[.*\]$/.test(v)) data[k] = v.slice(1, -1).split(',').map((s) => unquote(s.trim())).filter(Boolean);
      else data[k] = unquote(v);
    }
  }
  return { data, body: md.slice(m[0].length) };
}

function buildCoverHtml(d) {
  if (!d || !d.title) return '';
  const chips = [];
  if (d.author) chips.push({ t: 'Author · ' + d.author });
  if (d.status) chips.push({ t: 'Status · ' + d.status, ok: /^(approved|done|complete|completed|shipped|final|ready)$/i.test(d.status) });
  if (d.version) chips.push({ t: 'v' + d.version });
  if (d.date) chips.push({ t: String(d.date) });
  if (d.reference) chips.push({ t: 'Reference · ' + d.reference });
  if (Array.isArray(d.chips)) d.chips.forEach((c) => chips.push({ t: c }));
  const lede = d.lede || d.subtitle || '';
  const chipHtml = chips.map((c) => '<span class="chip' + (c.ok ? ' ok' : '') + '">' + escHtml(c.t) + '</span>').join('');
  return '<header class="cover">' +
    (d.eyebrow ? '<span class="eyebrow">' + escHtml(d.eyebrow) + '</span>' : '') +
    '<h1>' + escHtml(d.title) + '</h1>' +
    (lede ? '<p class="lede">' + escHtml(lede) + '</p>' : '') +
    (chipHtml ? '<div class="chips">' + chipHtml + '</div>' : '') +
    '</header>';
}

// Walk the markdown: build a diagram-card list (in document order) and, in the
// designed theme, convert `<!-- eyebrow: … -->` comments into eyebrow kickers.
// Figure/eyebrow directive comments are stripped so they never render as text.
function preprocess(md, { cards: cardsOn, designed }) {
  const lines = md.split('\n');
  const out = [];
  const cards = [];
  let heading = null;
  let inFence = false;
  let pending = null;
  let n = 0;

  for (const line of lines) {
    const fence = line.match(/^\s*```(.*)$/);
    if (fence) {
      if (!inFence) {
        const lang = fence[1].trim().toLowerCase();
        if (lang === 'mermaid' && cardsOn) {
          n++;
          const title = (pending && pending.title) || (heading ? 'Figure ' + n + ' · ' + heading : 'Figure ' + n);
          const caption = (pending && pending.caption) || '';
          cards.push({ title, caption });
        }
        inFence = true;
      } else {
        inFence = false;
      }
      pending = null;
      out.push(line);
      continue;
    }
    if (inFence) { out.push(line); continue; }

    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { heading = h[2].replace(/[*_`]/g, '').trim(); pending = null; out.push(line); continue; }

    const eye = line.match(/^\s*<!--\s*eyebrow:\s*(.*?)\s*-->\s*$/i);
    if (eye) {
      // Emit the kicker as its own HTML block, then a blank line — without the blank
      // line marked absorbs the following paragraph/table into the raw HTML block and
      // stops parsing it (badges, bold, tables would render literally).
      if (designed) { out.push('<p class="eyebrow">' + escHtml(eye[1].trim()) + '</p>'); out.push(''); }
      continue;
    }

    const fig = line.match(/^\s*<!--\s*figure:\s*(.*?)\s*-->\s*$/i);
    if (fig) {
      const parts = fig[1].split('|');
      pending = { title: (parts[0] || '').trim() || null, caption: (parts[1] || '').trim() };
      continue;
    }
    const cap = line.match(/^\s*<!--\s*caption:\s*(.*?)\s*-->\s*$/i);
    if (cap) { pending = { title: null, caption: cap[1].trim() }; continue; }

    if (line.trim() === '') { out.push(line); continue; }

    pending = null;
    out.push(line);
  }
  return { md: out.join('\n'), cards };
}

// ---- Stylesheets -----------------------------------------------------------

// Shared page-fit rules for diagrams, tables and code (both themes).
function fitCss() {
  return `
  pre { background: var(--surface-2); padding: 12px 14px; border-radius: 8px; page-break-inside: avoid; white-space: pre-wrap; word-wrap: break-word; overflow-wrap: anywhere; }
  pre code { background: none; padding: 0; font-size: 12px; }
  table { border-collapse: collapse; width: 100%; margin: 14px 0; font-size: 12.5px; }
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; }
  th, td { border: 1px solid var(--border); padding: 7px 10px; text-align: left; vertical-align: top; word-wrap: break-word; overflow-wrap: anywhere; }
  td code { word-break: break-word; }
  .diagram-card { margin: 18px 0; border: 1px solid var(--card-border); border-radius: 8px; overflow: hidden; background: var(--surface); box-shadow: var(--shadow); page-break-inside: avoid; }
  .diagram-card__title { font-family: var(--mono); font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--card-accent); padding: 8px 14px; background: linear-gradient(180deg, var(--card-band1), var(--card-band2)); border-bottom: 1px solid var(--card-border); }
  .diagram-card__canvas { padding: 16px 14px; text-align: center; background-color: var(--card-canvas); background-image: radial-gradient(var(--card-dot) 1px, transparent 1px); background-size: 14px 14px; }
  .diagram-card__desc { font-size: 11.5px; font-style: italic; color: var(--ink-2); line-height: 1.5; padding: 9px 14px; background: var(--surface); border-top: 1px solid var(--card-border); }
  .mermaid { text-align: center; margin: 0; overflow: hidden; }
  .mermaid svg { display: block; margin: 0 auto; max-width: 100% !important; width: auto !important; height: auto !important; max-height: 105mm !important; }
  @page { size: A4; margin: 12mm 12mm; }`;
}

function plainCss(accent) {
  return `
  :root {
    --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    --mono: "SF Mono", ui-monospace, Menlo, Consolas, monospace;
    --display: var(--sans);
    --ink:#1a1a1a; --ink-2:#555; --ink-3:#777; --border:#ddd; --border-strong:#ccc;
    --surface:#fff; --surface-2:#f6f8fa; --ground:#fff; --shadow: 0 1px 3px rgba(0,0,0,0.05);
    --accent:${accent.text}; --accent-soft:${accent.soft};
    --card-accent:${accent.text}; --card-band1:${accent.band1}; --card-band2:${accent.band2};
    --card-border:${accent.border}; --card-canvas:${accent.canvas}; --card-dot:${accent.dot};
  }
  * { box-sizing: border-box; }
  body { font: 14px/1.6 var(--sans); color: var(--ink); margin: 0; background: var(--ground); }
  .page { max-width: 820px; margin: 0 auto; padding: 32px 40px; }
  h1 { font-size: 28px; border-bottom: 2px solid var(--border); padding-bottom: 8px; page-break-after: avoid; }
  h2 { font-size: 22px; margin-top: 34px; border-bottom: 1px solid var(--border); padding-bottom: 5px; page-break-after: avoid; }
  h3 { font-size: 17px; margin-top: 24px; page-break-after: avoid; }
  h4 { font-size: 15px; page-break-after: avoid; }
  p, li { orphans: 3; widows: 3; }
  a { color: var(--accent); text-decoration: none; }
  hr { border: none; border-top: 1px solid var(--border); margin: 28px 0; }
  code { font-family: var(--mono); font-size: 12.5px; background: var(--surface-2); padding: 1.5px 5px; border-radius: 4px; }
  th { background: var(--surface-2); }
  blockquote { border-left: 3px solid var(--border); margin: 0; padding: 2px 16px; color: var(--ink-2); }
  .eyebrow { display:block; font-family: var(--mono); font-size: 11px; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color: var(--ink-3); }
  ${fitCss()}`;
}

function designedCss(accent) {
  return `
  :root {
    --sans: "IBM Plex Sans", system-ui, -apple-system, sans-serif;
    --mono: "IBM Plex Mono", ui-monospace, Menlo, monospace;
    --display: "Familjen Grotesk", system-ui, sans-serif;
    --ground:#f5f6f9; --surface:#ffffff; --surface-2:#eef0f5;
    --ink:#171b22; --ink-2:#4a5462; --ink-3:#79828f;
    --border:#e0e4ea; --border-strong:#cdd3dc;
    --accent:${accent.text}; --accent-soft:${accent.soft};
    --positive:#0f7a5a; --positive-soft:#d9f2e8;
    --negative:#b83f36; --negative-soft:#f7e2df;
    --warning:#a76d12; --warning-soft:#f8eeda;
    --neutral:#79828f; --neutral-soft:#eef0f5;
    --shadow: 0 1px 2px rgba(20,24,33,.04), 0 8px 24px -14px rgba(20,24,33,.18);
    --card-accent:${accent.text}; --card-band1:${accent.band1}; --card-band2:${accent.band2};
    --card-border:${accent.border}; --card-canvas:${accent.canvas}; --card-dot:${accent.dot};
  }
  * { box-sizing: border-box; }
  body { font-family: var(--sans); font-size: 14px; line-height: 1.62; color: var(--ink); margin: 0; background: var(--ground); -webkit-font-smoothing: antialiased; }
  .page { max-width: 820px; margin: 0 auto; padding: 28px 40px 40px; background: var(--ground); }
  h1, h2, h3, h4 { font-family: var(--display); letter-spacing: -.01em; text-wrap: balance; }
  h1 { font-size: 30px; margin: 8px 0 4px; page-break-after: avoid; }
  h2 { font-size: 22px; font-weight: 700; margin-top: 34px; padding-bottom: 6px; border-bottom: 1px solid var(--border); page-break-after: avoid; }
  h3 { font-size: 16.5px; font-weight: 600; margin-top: 22px; page-break-after: avoid; }
  h4 { font-size: 14.5px; font-weight: 600; page-break-after: avoid; }
  p, li { orphans: 3; widows: 3; }
  a { color: var(--accent); text-decoration: none; }
  hr { border: none; border-top: 1px solid var(--border); margin: 28px 0; }
  code { font-family: var(--mono); font-size: .86em; background: var(--surface-2); color: var(--ink-2); padding: .12em .42em; border-radius: 5px; border: 1px solid var(--border); }
  blockquote { border-left: 3px solid var(--border-strong); margin: 14px 0; padding: 2px 16px; color: var(--ink-2); }

  /* Eyebrow kicker */
  .eyebrow { display:block; font-family: var(--mono); font-size: 11px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); margin: 22px 0 -10px; }

  /* Cover header */
  .cover { margin: 0 0 6px; padding: 6px 0 22px; border-bottom: 2px solid var(--border); }
  .cover .eyebrow { margin: 0 0 10px; }
  .cover h1 { font-size: clamp(26px, 4.4vw, 38px); line-height: 1.04; margin: 0; }
  .cover .lede { font-size: 15px; color: var(--ink-2); max-width: 62ch; margin: 12px 0 0; }
  .cover .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
  .chip { font-family: var(--mono); font-size: 11px; font-weight: 500; padding: 4px 10px; border-radius: 999px; border: 1px solid var(--border-strong); background: var(--surface); color: var(--ink-2); white-space: nowrap; }
  .chip.ok { color: var(--positive); background: var(--positive-soft); border-color: color-mix(in srgb, var(--positive) 34%, var(--border)); }

  /* Badges / pills */
  .badge { display: inline-block; font-family: var(--mono); font-size: .74em; font-weight: 600; line-height: 1.5; padding: 0 8px; border-radius: 999px; border: 1px solid var(--border-strong); background: var(--surface-2); color: var(--ink-2); vertical-align: baseline; }
  .badge-accent   { color: var(--accent);   background: var(--accent-soft);   border-color: color-mix(in srgb, var(--accent) 30%, var(--border)); }
  .badge-positive { color: var(--positive); background: var(--positive-soft); border-color: color-mix(in srgb, var(--positive) 30%, var(--border)); }
  .badge-negative { color: var(--negative); background: var(--negative-soft); border-color: color-mix(in srgb, var(--negative) 30%, var(--border)); }
  .badge-warning  { color: var(--warning);  background: var(--warning-soft);  border-color: color-mix(in srgb, var(--warning) 34%, var(--border)); }

  /* Admonition callouts */
  .callout { display: grid; grid-template-columns: 5px 1fr; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; box-shadow: var(--shadow); margin: 16px 0; page-break-inside: avoid; }
  .callout-bar { background: var(--role); }
  .callout-body { padding: 12px 16px; background: var(--role-soft); }
  .callout-title { font-family: var(--mono); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: var(--role); display: flex; align-items: center; gap: 7px; margin-bottom: 5px; }
  .callout-ico { font-size: 13px; }
  .callout-body > :last-child { margin-bottom: 0; }
  .callout-info     { --role: var(--accent);   --role-soft: var(--accent-soft); }
  .callout-positive { --role: var(--positive); --role-soft: var(--positive-soft); }
  .callout-accent   { --role: var(--accent);   --role-soft: var(--accent-soft); }
  .callout-warning  { --role: var(--warning);  --role-soft: var(--warning-soft); }
  .callout-negative { --role: var(--negative); --role-soft: var(--negative-soft); }

  /* Tables */
  thead th { background: var(--accent-soft); color: var(--accent); font-family: var(--mono); font-size: 10.5px; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; }
  tbody tr:nth-child(even) { background: var(--surface-2); }

  ${fitCss()}`;
}

// ---- HTML assembly ---------------------------------------------------------

function buildHtml({ md, cards, accent, mermaidTheme, docTitle, coverHtml, designed }) {
  const marked = readFileSync(join(VENDOR, 'marked.min.js'), 'utf8');
  const mermaid = readFileSync(join(VENDOR, 'mermaid.min.js'), 'utf8');
  const mdB64 = Buffer.from(md, 'utf8').toString('base64');
  const fonts = designed
    ? '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@600;700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap">'
    : '';
  const css = designed ? designedCss(accent) : plainCss(accent);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escHtml(docTitle)}</title>
${fonts}
<style>${css}</style>
</head>
<body class="${designed ? 'designed' : 'plain'}">
<div class="page">${coverHtml}<div id="content"></div></div>

<script>window.MD_B64 = "${mdB64}"; window.CARDS = ${JSON.stringify(cards)}; window.MERMAID_THEME = ${JSON.stringify(mermaidTheme)}; window.DESIGNED = ${designed ? 'true' : 'false'};</script>
<script>${marked}</script>
<script>${mermaid}</script>
<script>
  (async () => {
    var bin = atob(window.MD_B64);
    var bytes = Uint8Array.from(bin, function (c) { return c.charCodeAt(0); });
    var raw = new TextDecoder('utf-8').decode(bytes);

    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    // Inline badge extension: [[Label]] / [[role:Label]]
    if (window.DESIGNED) {
      marked.use({ extensions: [{
        name: 'badge', level: 'inline',
        start: function (src) { return src.indexOf('[['); },
        tokenizer: function (src) {
          var m = /^\\[\\[(?:(accent|positive|negative|warning|neutral):)?\\s*([^\\]\\n]+?)\\s*\\]\\]/.exec(src);
          if (m) { return { type: 'badge', raw: m[0], role: (m[1] || 'neutral').toLowerCase(), text: m[2] }; }
        },
        renderer: function (t) { return '<span class="badge badge-' + t.role + '">' + esc(t.text) + '</span>'; }
      }] });
    }

    var idx = 0;
    var renderer = new marked.Renderer();
    var origCode = renderer.code.bind(renderer);
    renderer.code = function (code, lang) {
      var text = (typeof code === 'object') ? code.text : code;
      var language = (typeof code === 'object') ? code.lang : lang;
      if ((language || '').trim() === 'mermaid') {
        var body = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        var meta = window.CARDS[idx];
        idx++;
        if (!meta) { return '<div class="mermaid">' + body + '</div>'; }
        return '<figure class="diagram-card">' +
          '<figcaption class="diagram-card__title">' + esc(meta.title) + '</figcaption>' +
          '<div class="diagram-card__canvas"><div class="mermaid">' + body + '</div></div>' +
          (meta.caption ? '<figcaption class="diagram-card__desc">' + esc(meta.caption) + '</figcaption>' : '') +
          '</figure>';
      }
      return origCode(code, lang);
    };

    // Admonition callouts (designed theme): > [!NOTE] / [!TIP] / [!IMPORTANT] / [!WARNING] / [!CAUTION]
    if (window.DESIGNED) {
      var MAP = {
        NOTE: ['info', 'ⓘ', 'Note'], TIP: ['positive', '✓', 'Tip'], IMPORTANT: ['accent', '★', 'Important'],
        WARNING: ['warning', '⚠', 'Warning'], CAUTION: ['negative', '⛔', 'Caution']
      };
      var origQuote = renderer.blockquote.bind(renderer);
      renderer.blockquote = function (quote) {
        var html = (typeof quote === 'object') ? origQuote(quote) : quote;
        var m = /^\\s*<p>\\s*\\[!(\\w+)\\]/i.exec(html);
        if (m) {
          var conf = MAP[m[1].toUpperCase()];
          if (conf) {
            var inner = html.replace(/^\\s*<p>\\s*\\[!\\w+\\][ \\t]*(<br\\s*\\/?>)?\\s*/i, '<p>').replace(/^<p>\\s*<\\/p>\\s*/i, '');
            return '<div class="callout callout-' + conf[0] + '"><div class="callout-bar"></div>' +
              '<div class="callout-body"><div class="callout-title"><span class="callout-ico">' + conf[1] + '</span>' + conf[2] + '</div>' + inner + '</div></div>';
          }
        }
        return origQuote(quote);
      };
    }

    document.getElementById('content').innerHTML = marked.parse(raw, { renderer: renderer, gfm: true, breaks: false });

    mermaid.initialize({ startOnLoad: false, theme: window.MERMAID_THEME, securityLevel: 'loose', flowchart: { htmlLabels: true } });
    try {
      await mermaid.run({ querySelector: '.mermaid' });
    } catch (e) {
      document.title = 'MERMAID_ERROR: ' + (e && e.message ? e.message : e);
    }
    try { if (document.fonts && document.fonts.ready) { await document.fonts.ready; } } catch (e) {}
    window.__RENDER_DONE__ = true;
  })();
</script>
</body>
</html>`;
}

function findChrome() {
  const cands = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium', '/usr/bin/chromium-browser', '/snap/bin/chromium',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  ].filter(Boolean);
  return cands.find((p) => existsSync(p)) || null;
}

async function renderPdf(htmlPath, pdfPath, chrome) {
  let puppeteer;
  try {
    puppeteer = (await import('puppeteer-core')).default;
  } catch {
    throw new Error("puppeteer-core is not installed. Run:  npm install --prefix '" + HERE + "'");
  }
  const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox', '--disable-gpu'] });
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.waitForFunction('window.__RENDER_DONE__ === true', { timeout: 60000 });
    const title = await page.title();
    if (title.startsWith('MERMAID_ERROR')) throw new Error('A mermaid diagram failed to render — ' + title);
    await page.pdf({ path: pdfPath, format: 'A4', printBackground: true, displayHeaderFooter: false, preferCSSPageSize: true });
  } finally {
    await browser.close();
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args._.length < 1) { usage(); process.exit(args.help ? 0 : 1); }

  const input = resolve(args._[0]);
  if (!existsSync(input)) throw new Error('Input not found: ' + input);
  const output = resolve(args._[1] || input.replace(/\.md$/i, '') + '.pdf');

  if (args.design !== 'designed' && args.design !== 'plain') throw new Error('Unknown --design "' + args.design + '". Options: designed, plain');
  const designed = args.design === 'designed';
  const accent = ACCENTS[args.accent];
  if (!accent) throw new Error('Unknown --accent "' + args.accent + '". Options: ' + Object.keys(ACCENTS).join(', '));

  const chrome = findChrome();
  if (!chrome) throw new Error('No Chrome/Chromium found. Set CHROME_PATH or PUPPETEER_EXECUTABLE_PATH to its executable.');

  await ensureVendor();

  const { data: front, body } = parseFrontmatter(readFileSync(input, 'utf8'));
  const { md, cards } = preprocess(body, { cards: args.cards, designed });
  const coverHtml = designed ? buildCoverHtml(front) : '';
  const docTitle = args.title || front.title || basename(input);
  const html = buildHtml({ md, cards, accent, mermaidTheme: args.theme, docTitle, coverHtml, designed });

  const htmlPath = args.keepHtml ? output.replace(/\.pdf$/i, '') + '.html' : join(tmpdir(), 'md2pdf-' + process.pid + '-' + Date.now() + '.html');
  writeFileSync(htmlPath, html);
  try {
    await renderPdf(htmlPath, output, chrome);
    process.stdout.write('Wrote ' + output + '  (' + args.design + ' theme, accent ' + args.accent + ', ' + cards.length + ' diagram card' + (cards.length === 1 ? '' : 's') + (coverHtml ? ', cover' : '') + ')\n');
  } finally {
    if (!args.keepHtml) { try { rmSync(htmlPath); } catch {} }
  }
}

main().catch((e) => { process.stderr.write('Error: ' + e.message + '\n'); process.exit(1); });
