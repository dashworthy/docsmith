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
// diagram-card header band and its tinted dot-grid canvas. Light and dark variants.
const ACCENTS = {
  blue:   { text: '#1e5fbf', soft: '#e9eefb', band1: '#eef4fd', band2: '#e4edfb', border: '#d3e0f5', canvas: '#f5f8fe', dot: 'rgba(20,60,140,0.07)' },
  green:  { text: '#0a7a52', soft: '#d9f2e8', band1: '#f0f6f3', band2: '#e9f1ec', border: '#d3e4db', canvas: '#f6faf8', dot: 'rgba(20,80,60,0.07)' },
  slate:  { text: '#475569', soft: '#e8eef4', band1: '#f1f5f9', band2: '#e8eef4', border: '#dbe3ec', canvas: '#f8fafc', dot: 'rgba(30,41,59,0.06)' },
  purple: { text: '#6d28d9', soft: '#efe8fb', band1: '#f5f1fd', band2: '#efe8fb', border: '#e0d5f5', canvas: '#faf8fe', dot: 'rgba(80,40,140,0.07)' },
};
const ACCENTS_DARK = {
  blue:   { text: '#7ba3f8', soft: '#1b2742', band1: '#1a2440', band2: '#151d33', border: '#2b3550', canvas: '#141a24', dot: 'rgba(150,180,255,0.12)' },
  green:  { text: '#37c99a', soft: '#0f2a22', band1: '#12241d', band2: '#0f1e18', border: '#20362c', canvas: '#141a24', dot: 'rgba(90,220,180,0.12)' },
  slate:  { text: '#a3b3c6', soft: '#1b2430', band1: '#19212c', band2: '#151c26', border: '#2c3644', canvas: '#141a24', dot: 'rgba(180,200,220,0.10)' },
  purple: { text: '#a78bfa', soft: '#241b3a', band1: '#1f1930', band2: '#181327', border: '#33294d', canvas: '#141a24', dot: 'rgba(180,150,255,0.12)' },
};

function parseArgs(argv) {
  const a = { _: [], design: 'designed', mode: 'dark', accent: 'blue', theme: 'default', cards: true, keepHtml: false, title: null, help: false };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === '--no-cards') a.cards = false;
    else if (t === '--design') a.design = argv[++i];
    else if (t === '--mode') a.mode = argv[++i];
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
    '       [--design designed|plain] [--mode dark|light] [--accent blue|green|slate|purple]\n' +
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

// Designed theme: a 2-column table reads better as a grid of reference cards than as a
// table with a cramped, hyphenated first column. Wrap each 2-column table in a ```cards
// fence (rendered client-side). Precede a table with `<!-- table -->` to force a plain table.
function cardifyTables(md, designed) {
  if (!designed) return md;
  const isSep = (s) => /\|/.test(s) && /-/.test(s) && /^[\s|:-]+$/.test(s.trim());
  const isRow = (s) => /\|/.test(s) && s.trim() !== '';
  const colCount = (sep) => sep.split('|').map((c) => c.trim()).filter((c) => c.length).length;

  const lines = md.split('\n');
  const out = [];
  let inFence = false;
  let forcePlain = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*```/.test(line)) { inFence = !inFence; out.push(line); continue; }
    if (inFence) { out.push(line); continue; }

    if (/^\s*<!--\s*table\s*-->\s*$/i.test(line)) { forcePlain = true; continue; }

    if (isRow(line) && i + 1 < lines.length && isSep(lines[i + 1])) {
      const block = [line, lines[i + 1]];
      let j = i + 2;
      while (j < lines.length && isRow(lines[j])) { block.push(lines[j]); j++; }
      if (colCount(lines[i + 1]) === 2 && !forcePlain) {
        out.push('```cards');
        block.forEach((b) => out.push(b));
        out.push('```');
      } else {
        block.forEach((b) => out.push(b));
      }
      forcePlain = false;
      i = j - 1;
      continue;
    }

    if (line.trim() !== '') forcePlain = false;
    out.push(line);
  }
  return out.join('\n');
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
  .mermaid svg { display: block; margin: 0 auto; max-width: 100% !important; width: auto !important; height: auto !important; max-height: 105mm !important; }`;
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
  @page { size: A4; margin: 12mm 12mm; }
  ${fitCss()}`;
}

function designedCss(accent, mode) {
  const dark = mode === 'dark';
  const tokens = dark ? `
    --ground:#0c0f15; --surface:#141922; --surface-2:#1b212c;
    --ink:#e7eaef; --ink-2:#a7b0bd; --ink-3:#79828f;
    --border:#242c38; --border-strong:#333d4c;
    --positive:#34c99a; --positive-soft:#103028;
    --negative:#e2685e; --negative-soft:#341c1a;
    --warning:#dca34a; --warning-soft:#33280f;
    --neutral:#79828f; --neutral-soft:#1b212c;
    --shadow: 0 1px 2px rgba(0,0,0,.30), 0 12px 32px -14px rgba(0,0,0,.72);
  ` : `
    --ground:#e9edf3; --surface:#ffffff; --surface-2:#e3e8f0;
    --ink:#141821; --ink-2:#43505f; --ink-3:#6b7482;
    --border:#d1d8e2; --border-strong:#b7c0cc;
    --positive:#0f7a5a; --positive-soft:#d9f2e8;
    --negative:#b83f36; --negative-soft:#f7e2df;
    --warning:#a76d12; --warning-soft:#f8eeda;
    --neutral:#6b7482; --neutral-soft:#e3e8f0;
    --shadow: 0 1px 2px rgba(20,24,33,.07), 0 10px 26px -14px rgba(20,24,33,.32);
  `;
  return `
  :root {
    --sans: "IBM Plex Sans", system-ui, -apple-system, sans-serif;
    --mono: "IBM Plex Mono", ui-monospace, Menlo, monospace;
    --display: "Familjen Grotesk", system-ui, sans-serif;
    color-scheme: ${dark ? 'dark' : 'light'};
    ${tokens}
    --accent:${accent.text}; --accent-soft:${accent.soft};
    --card-accent:${accent.text}; --card-band1:${accent.band1}; --card-band2:${accent.band2};
    --card-border:${accent.border}; --card-canvas:${accent.canvas}; --card-dot:${accent.dot};
  }
  * { box-sizing: border-box; }
  html, body { background: var(--ground); }
  body { font-family: var(--sans); font-size: 14px; line-height: 1.62; color: var(--ink); margin: 0; -webkit-font-smoothing: antialiased; }
  .page { max-width: 900px; margin: 0 auto; padding: 15mm 15mm 18mm; }
  h1, h2, h3, h4 { font-family: var(--display); letter-spacing: -.01em; text-wrap: balance; }
  h1 { font-size: 30px; margin: 8px 0 4px; page-break-after: avoid; }
  h2 { font-size: 22px; font-weight: 700; margin-top: 34px; padding-bottom: 6px; border-bottom: 1px solid var(--border-strong); page-break-after: avoid; }
  h3 { font-size: 16.5px; font-weight: 600; margin-top: 22px; page-break-after: avoid; }
  h4 { font-size: 14.5px; font-weight: 600; page-break-after: avoid; }
  p, li { orphans: 3; widows: 3; }
  a { color: var(--accent); text-decoration: none; }
  hr { border: none; border-top: 1px solid var(--border); margin: 28px 0; }
  code { font-family: var(--mono); font-size: .86em; background: var(--surface-2); color: var(--ink); padding: .12em .42em; border-radius: 5px; border: 1px solid var(--border); }
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

  /* Reference cards — a 2-column table becomes these in the designed theme */
  .cardgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px; margin: 16px 0; }
  .refcard { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; box-shadow: var(--shadow); page-break-inside: avoid; }
  .refcard-title { font-family: var(--mono); font-size: 12px; font-weight: 600; color: var(--accent); overflow-wrap: anywhere; margin-bottom: 6px; }
  .refcard-body { font-size: 12.5px; color: var(--ink-2); line-height: 1.5; }
  .refcard-body > div + div { margin-top: 4px; }
  .refcard-k { font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: var(--ink-3); margin-right: 6px; }

  /* Key/stat boxes — a small tinted metric grid */
  .keygrid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 14px 0; }
  .keybox { background: var(--role-soft, var(--surface-2)); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; page-break-inside: avoid; }
  .keybox .k { font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: .08em; font-weight: 700; color: var(--role, var(--ink-3)); }
  .keybox .v { font-size: 12.5px; color: var(--ink-2); margin-top: 4px; }
  .keybox.accent { --role: var(--accent); --role-soft: var(--accent-soft); }
  .keybox.positive { --role: var(--positive); --role-soft: var(--positive-soft); }
  .keybox.negative { --role: var(--negative); --role-soft: var(--negative-soft); }
  .keybox.warning { --role: var(--warning); --role-soft: var(--warning-soft); }

  /* Tint / role legend */
  .legend { display: flex; flex-wrap: wrap; gap: 12px; margin: 12px 0; }
  .legend .t { display: inline-flex; align-items: center; gap: 7px; font-family: var(--mono); font-size: 11px; color: var(--ink-2); }
  .legend .dot { width: 10px; height: 10px; border-radius: 3px; }

  /* Panels — side-by-side cards */
  .panelgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0; }
  .panel { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px 18px; box-shadow: var(--shadow); page-break-inside: avoid; }
  .panel > :first-child { margin-top: 0; }

  /* Comparison cards */
  .compare { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; box-shadow: var(--shadow); overflow: hidden; margin: 14px 0; page-break-inside: avoid; }
  .compare__head { display: flex; align-items: baseline; gap: 10px; padding: 12px 16px; background: var(--surface-2); border-bottom: 1px solid var(--border); }
  .compare__num { font-family: var(--mono); font-size: 12px; color: var(--ink-3); }
  .compare__head h3 { margin: 0; font-size: 15px; }
  .compare__cols { display: grid; grid-template-columns: 1fr 1fr; }
  .compare__col { padding: 12px 16px; }
  .compare__col + .compare__col { border-left: 1px solid var(--border); }
  .compare__label { display: flex; align-items: center; gap: 7px; font-family: var(--mono); font-size: 10.5px; text-transform: uppercase; letter-spacing: .08em; font-weight: 700; margin-bottom: 8px; color: var(--role, var(--ink-2)); }
  .compare__label .swatch { width: 9px; height: 9px; border-radius: 50%; background: var(--role, var(--ink-3)); }
  .compare__col.is-a { --role: var(--warning); }
  .compare__col.is-b { --role: var(--positive); }
  .compare__col ul { margin: 0; padding-left: 16px; }
  .compare__col li { font-size: 12px; color: var(--ink-2); margin: 4px 0; }
  .compare__target { padding: 10px 16px; border-top: 1px dashed var(--border-strong); background: var(--accent-soft); font-size: 12px; color: var(--ink-2); }
  .compare__target b { font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: var(--accent); margin-right: 6px; }

  /* Flow lanes */
  .flow { display: flex; flex-direction: column; gap: 10px; margin: 14px 0; }
  .lane .tag { display: inline-block; font-family: var(--mono); font-size: 9.5px; text-transform: uppercase; letter-spacing: .1em; font-weight: 700; padding: 2px 8px; border-radius: 6px; margin-bottom: 6px; background: var(--surface-2); color: var(--ink-2); }
  .lane.bad .tag { background: var(--negative-soft); color: var(--negative); }
  .lane.good .tag { background: var(--positive-soft); color: var(--positive); }
  .lane .steps { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
  .step { font-family: var(--mono); font-size: 11px; background: var(--surface); border: 1px solid var(--border); border-radius: 7px; padding: 4px 9px; color: var(--ink-2); }
  .step.bad { border-color: color-mix(in srgb, var(--negative) 40%, var(--border)); color: var(--negative); }
  .step.good { border-color: color-mix(in srgb, var(--positive) 45%, var(--border)); color: var(--positive); }
  .arr { color: var(--ink-3); }

  /* Phase cards */
  .phases { display: grid; gap: 12px; margin: 16px 0; }
  .phase { display: grid; grid-template-columns: 52px 1fr; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; box-shadow: var(--shadow); page-break-inside: avoid; }
  .phase .idx { display: flex; align-items: center; justify-content: center; font-family: var(--display); font-weight: 700; font-size: 22px; color: var(--accent); background: var(--accent-soft); }
  .phase .pbody { padding: 12px 16px; }
  .phase .pbody > :first-child { margin-top: 0; margin-bottom: 3px; font-size: 14.5px; }
  .phase .pbody p { margin: 0; font-size: 12.5px; color: var(--ink-2); }
  .phase.parallel .idx { color: var(--positive); background: var(--positive-soft); }
  .badge-par { font-family: var(--mono); font-size: 9px; text-transform: uppercase; letter-spacing: .1em; color: var(--positive); border: 1px solid color-mix(in srgb, var(--positive) 45%, var(--border)); padding: 1px 7px; border-radius: 999px; margin-left: 8px; }

  /* Custom lists — numbered questions (.qlist) and struck non-goals (.xlist) */
  .qlist { margin: 12px 0; padding: 0; list-style: none; counter-reset: q; }
  .qlist li { position: relative; padding: 8px 0 8px 30px; border-top: 1px solid var(--border); color: var(--ink-2); font-size: 12.5px; counter-increment: q; }
  .qlist li:first-child { border-top: none; }
  .qlist li::before { content: "Q" counter(q); position: absolute; left: 0; top: 8px; font-family: var(--mono); font-size: 10px; color: var(--accent); font-weight: 700; }
  .xlist { margin: 12px 0; padding: 0; list-style: none; }
  .xlist li { position: relative; padding: 8px 0 8px 22px; border-top: 1px solid var(--border); color: var(--ink-2); font-size: 12.5px; }
  .xlist li:first-child { border-top: none; }
  .xlist li::before { content: "\\00D7"; position: absolute; left: 3px; top: 7px; color: var(--negative); font-weight: 700; }

  /* Provenance footer */
  .docfooter { margin-top: 32px; padding-top: 16px; border-top: 1px solid var(--border); font-family: var(--mono); font-size: 11px; color: var(--ink-3); line-height: 1.9; }

  @page { size: A4; margin: 0; }
  ${fitCss()}`;
}

// ---- HTML assembly ---------------------------------------------------------

function buildHtml({ md, cards, accent, mode, mermaidTheme, docTitle, coverHtml, designed }) {
  const marked = readFileSync(join(VENDOR, 'marked.min.js'), 'utf8');
  const mermaid = readFileSync(join(VENDOR, 'mermaid.min.js'), 'utf8');
  const mdB64 = Buffer.from(md, 'utf8').toString('base64');
  const fonts = designed
    ? '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@600;700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap">'
    : '';
  const css = designed ? designedCss(accent, mode) : plainCss(accent);

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

    // A "cards" fenced block holds a Markdown table; render it as a grid of reference
    // cards (first column = title, remaining columns = body). Inline markdown in each cell
    // is rendered via marked.parseInline so code/bold/badges work.
    function splitCells(line) {
      var t = line.trim().replace(/^\\|/, '').replace(/\\|$/, '');
      return t.split(/(?<!\\\\)\\|/).map(function (c) { return c.replace(/\\\\\\|/g, '|').trim(); });
    }
    function renderCards(rawTable) {
      var rows = rawTable.split('\\n').filter(function (l) { return l.trim() !== ''; });
      var sepIdx = -1;
      for (var i = 0; i < rows.length; i++) { if (/\\|/.test(rows[i]) && /-/.test(rows[i]) && /^[\\s|:-]+$/.test(rows[i].trim())) { sepIdx = i; break; } }
      var header = sepIdx > 0 ? splitCells(rows[sepIdx - 1]) : null;
      var start = sepIdx >= 0 ? sepIdx + 1 : 0;
      var cards = [];
      for (var r = start; r < rows.length; r++) {
        var cells = splitCells(rows[r]);
        if (!cells.length || (cells.length === 1 && cells[0] === '')) continue;
        var body = [];
        for (var c = 1; c < cells.length; c++) {
          var val = marked.parseInline(cells[c] || '');
          if (cells.length > 2 && header && header[c]) { body.push('<div><span class="refcard-k">' + esc(header[c]) + '</span>' + val + '</div>'); }
          else { body.push('<div>' + val + '</div>'); }
        }
        cards.push('<div class="refcard"><div class="refcard-title">' + marked.parseInline(cells[0] || '') + '</div><div class="refcard-body">' + body.join('') + '</div></div>');
      }
      return '<div class="cardgrid">' + cards.join('') + '</div>';
    }

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
      if ((language || '').trim() === 'cards') { return renderCards(text); }
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
  if (args.mode !== 'light' && args.mode !== 'dark') throw new Error('Unknown --mode "' + args.mode + '". Options: light, dark');
  const designed = args.design === 'designed';
  const dark = designed && args.mode === 'dark';
  const accent = (dark ? ACCENTS_DARK : ACCENTS)[args.accent];
  if (!accent) throw new Error('Unknown --accent "' + args.accent + '". Options: ' + Object.keys(ACCENTS).join(', '));
  // Match the mermaid theme to dark mode unless the user set one explicitly.
  const mermaidTheme = args.theme !== 'default' ? args.theme : (dark ? 'dark' : 'default');

  const chrome = findChrome();
  if (!chrome) throw new Error('No Chrome/Chromium found. Set CHROME_PATH or PUPPETEER_EXECUTABLE_PATH to its executable.');

  await ensureVendor();

  const { data: front, body } = parseFrontmatter(readFileSync(input, 'utf8'));
  const { md, cards } = preprocess(cardifyTables(body, designed), { cards: args.cards, designed });
  const coverHtml = designed ? buildCoverHtml(front) : '';
  const docTitle = args.title || front.title || basename(input);
  const html = buildHtml({ md, cards, accent, mode: args.mode, mermaidTheme, docTitle, coverHtml, designed });

  const htmlPath = args.keepHtml ? output.replace(/\.pdf$/i, '') + '.html' : join(tmpdir(), 'md2pdf-' + process.pid + '-' + Date.now() + '.html');
  writeFileSync(htmlPath, html);
  try {
    await renderPdf(htmlPath, output, chrome);
    process.stdout.write('Wrote ' + output + '  (' + args.design + (designed ? '/' + args.mode : '') + ' theme, accent ' + args.accent + ', ' + cards.length + ' diagram card' + (cards.length === 1 ? '' : 's') + (coverHtml ? ', cover' : '') + ')\n');
  } finally {
    if (!args.keepHtml) { try { rmSync(htmlPath); } catch {} }
  }
}

main().catch((e) => { process.stderr.write('Error: ' + e.message + '\n'); process.exit(1); });
