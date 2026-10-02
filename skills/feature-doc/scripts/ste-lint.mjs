#!/usr/bin/env node
// ste-lint — check a filled feature doc against the measurable ASD-STE100 writing rules.
// -----------------------------------------------------------------------------------------------
//   node ste-lint.mjs <file.md | file.pdf.tsx> [...more files]
//
// Lints PROSE only. Code fences, inline code, comments, headings, mermaid/code template literals,
// table headers, and label-like props (title, eyebrow, label, …) are exempt.
//
//   error  sentence-length   instruction > 20 words, description > 25 words
//   error  paragraph-length  paragraph > 6 sentences
//   warn   passive-voice     pattern match — a person decides
//   warn   ing-form          pattern match — a person decides (technical names are allowed)
//
// Exit 0 = no errors (warnings allowed), 1 = errors, 2 = usage / setup problem.
// .md needs nothing. .tsx needs TypeScript, which `npm install` in skills/docsmith provides.
// -----------------------------------------------------------------------------------------------

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const MAX_INSTRUCTION = 20;
const MAX_DESCRIPTION = 25;
const MAX_SENTENCES = 6;

// A sentence that starts with one of these verbs is treated as an instruction (20-word limit).
const IMPERATIVES = new Set(
  ('add apply call change check clear close configure connect copy create delete deploy disable do ' +
    'edit enable enter export find give import install keep let make move open put read record ' +
    'refer remove replace restart run see select send set start stop tell turn update use verify ' +
    'wait write').split(' '),
);
const LEADS = new Set(['then', 'first', 'next', 'now', 'finally']);
const ABBREVIATIONS = new Set(['e.g', 'i.e', 'vs', 'cf', 'approx', 'etc']);

const PASSIVE = new RegExp(
  '\\b(?:am|is|are|was|were|be|been|being)\\s+(?:not\\s+)?(?:\\w+ly\\s+)?' +
    '(\\w+(?:ed|en)|built|done|made|sent|set|kept|held|known|shown|put|read|written|thrown|found|' +
    'given|taken|seen|run|lost|left|paid|told|split|stored|cut|bound|caught|chosen|drawn|fed|got|' +
    'hidden|led|meant|said|spent|taught|thought|understood)\\b',
  'gi',
);
const NOT_PARTICIPLES = new Set(['often', 'even', 'open', 'then', 'when', 'token', 'between', 'seven', 'eleven', 'ten', 'sudden']);
const ING_OK = new Set(
  ('thing things string strings nothing something anything everything during bring spring ceiling ' +
    'sibling siblings morning evening swing sting wing wings king ping ring sing cling fling sling ' +
    'warning warnings heading headings padding meaning meanings').split(' '),
);

const WORD = /[A-Za-z0-9]+(?:['’\-./][A-Za-z0-9]+)*/g;

// Prose components whose title/label props are headings, plus props that never carry prose.
const EXEMPT_KEYS = new Set(
  ('eyebrow title id link label value lang language role idx head tags className tw theme key code ' +
    'src href kind page').split(' '),
);

// ---- Segments ---------------------------------------------------------------------------------
// A segment is one paragraph: `text` plus `lineAt[i]`, the 1-based source line of text[i].

function segment() {
  return { text: '', lineAt: [] };
}
function push(seg, text, line) {
  for (const ch of text) {
    seg.text += ch;
    seg.lineAt.push(typeof line === 'function' ? line(seg.text.length - 1) : line);
  }
}

// ---- Markdown ---------------------------------------------------------------------------------

const FENCE = /^\s*(```|~~~)/;
const HEADING = /^\s{0,3}#{1,6}\s/;
const RULE = /^\s{0,3}([-*_])(\s*\1){2,}\s*$/;
const LIST_ITEM = /^\s*(?:[-*+]|\d+[.)])\s+/;
const TABLE_ROW = /^\s*\|.*\|\s*$/;
const TABLE_SEP = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/;
const HTML_TAG = /<\/?(?:br|b|i|em|strong|code|sub|sup|kbd|span|div|a|img|p|details|summary)\b[^>]*>/gi;

function inlineMd(line) {
  return line
    .replace(/`[^`]*`/g, 'C')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(HTML_TAG, '')
    .replace(/\*\*|__/g, '');
}

function markdownSegments(source) {
  const lines = source.split(/\r?\n/);
  const segs = [];
  let cur = null;
  let curIsItem = false;
  let fence = null;
  let inComment = false;
  const close = () => {
    if (cur) segs.push(cur);
    cur = null;
    curIsItem = false;
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const n = i + 1;

    if (inComment) {
      const end = line.indexOf('-->');
      if (end === -1) continue;
      inComment = false;
      line = line.slice(end + 3);
    }
    line = line.replace(/<!--[\s\S]*?-->/g, '');
    const open = line.indexOf('<!--');
    if (open !== -1) {
      inComment = true;
      line = line.slice(0, open);
    }

    const f = line.match(FENCE);
    if (fence) {
      if (f && f[1] === fence) fence = null;
      continue;
    }
    if (f) {
      close();
      fence = f[1];
      continue;
    }

    if (!line.trim() || HEADING.test(line) || RULE.test(line) || TABLE_SEP.test(line)) {
      close();
      continue;
    }

    if (TABLE_ROW.test(line)) {
      close();
      if (TABLE_SEP.test(lines[i + 1] ?? '')) continue; // header row: labels, not prose
      for (const cell of line.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/)) {
        const seg = segment();
        push(seg, inlineMd(cell.trim()), n);
        segs.push(seg);
      }
      continue;
    }

    const text = inlineMd(line.replace(/^\s*>\s?/, ''));
    if (LIST_ITEM.test(text)) {
      close();
      cur = segment();
      curIsItem = true;
      push(cur, text.replace(LIST_ITEM, ''), n);
      continue;
    }
    if (!cur) cur = segment();
    else push(cur, '\n', n);
    push(cur, text.trim(), n);
  }
  close();
  return segs;
}

// ---- TSX --------------------------------------------------------------------------------------

let ts;
function loadTypeScript() {
  if (ts) return ts;
  const attempts = [import.meta.url, new URL('../../docsmith/package.json', import.meta.url)];
  for (const from of attempts) {
    try {
      ts = createRequire(from)('typescript');
      return ts;
    } catch {}
  }
  throw new Error('ste-lint: .tsx files need TypeScript. Run `npm install` in skills/docsmith first.');
}

function tsxSegments(source, fileName = 'doc.tsx') {
  const t = loadTypeScript();
  const sf = t.createSourceFile(fileName, source, t.ScriptTarget.Latest, true, t.ScriptKind.TSX);
  const lineOf = (pos) => sf.getLineAndCharacterOfPosition(pos).line + 1;
  const segs = [];

  const hasText = (el) => el.children.some((c) => t.isJsxText(c) && /[A-Za-z]/.test(c.getText(sf)));

  // Flatten an element's children into one paragraph; inline elements (<B>, <Badge>) keep their text.
  function flatten(children, seg) {
    for (const c of children) {
      if (t.isJsxText(c)) {
        const base = seg.text.length;
        push(seg, source.slice(c.pos, c.end), (i) => lineOf(c.pos + (i - base)));
      } else if (t.isJsxElement(c)) {
        flatten(c.children, seg);
      } else if (t.isJsxExpression(c) && c.expression) {
        if (t.isStringLiteral(c.expression)) push(seg, c.expression.text, lineOf(c.expression.getStart(sf)));
        else push(seg, 'X', lineOf(c.expression.getStart(sf)));
      } else {
        push(seg, ' ', lineOf(c.getStart(sf)));
      }
    }
  }

  function isExempt(node) {
    for (let p = node.parent; p; p = p.parent) {
      if (t.isPropertyAssignment(p) || t.isJsxAttribute(p)) {
        return EXEMPT_KEYS.has(p.name.getText(sf));
      }
      if (t.isJsxElement(p) || t.isJsxSelfClosingElement(p) || t.isVariableDeclaration(p) || t.isCallExpression(p)) {
        return false;
      }
    }
    return false;
  }

  function visit(node) {
    if (t.isImportDeclaration(node) || t.isExportDeclaration(node) || t.isTaggedTemplateExpression(node) || t.isLiteralTypeNode(node)) {
      return;
    }
    if (t.isJsxElement(node) && hasText(node)) {
      t.forEachChild(node.openingElement, visit);
      const seg = segment();
      flatten(node.children, seg);
      segs.push(seg);
      return;
    }
    if ((t.isStringLiteral(node) || t.isNoSubstitutionTemplateLiteral(node)) && /\s/.test(node.text) && /[A-Za-z]/.test(node.text) && !isExempt(node)) {
      const seg = segment();
      push(seg, node.text, lineOf(node.getStart(sf)));
      segs.push(seg);
      return;
    }
    t.forEachChild(node, visit);
  }
  visit(sf);
  return segs;
}

// ---- Rules ------------------------------------------------------------------------------------

function sentences(seg) {
  const out = [];
  const re = /[.!?]+["')\]]*(?=\s|$)/g;
  let start = 0;
  let m;
  while ((m = re.exec(seg.text))) {
    const before = seg.text.slice(start, m.index).match(/([A-Za-z.]+)$/);
    if (before && ABBREVIATIONS.has(before[1].toLowerCase())) {
      const next = seg.text.slice(re.lastIndex).match(/^\s*(\S)/);
      if (!next || !/[A-Z0-9"'`(<]/.test(next[1])) continue;
    }
    out.push({ start, end: re.lastIndex });
    start = re.lastIndex;
  }
  if (start < seg.text.length) out.push({ start, end: seg.text.length });
  return out
    .map(({ start, end }) => {
      const raw = seg.text.slice(start, end);
      const lead = raw.length - raw.trimStart().length;
      return { text: raw.trim(), offset: start + lead };
    })
    .filter((s) => (s.text.match(WORD) || []).length > 0);
}

function preview(text) {
  const w = text.split(/\s+/);
  return w.length > 8 ? `${w.slice(0, 8).join(' ')}…` : text;
}

function check(seg) {
  const findings = [];
  const line = (offset) => seg.lineAt[Math.min(offset, seg.lineAt.length - 1)];
  const list = sentences(seg);

  if (list.length > MAX_SENTENCES) {
    findings.push({
      line: line(list[0].offset),
      level: 'error',
      rule: 'paragraph-length',
      message: `${list.length} sentences (max ${MAX_SENTENCES}): "${preview(list[0].text)}"`,
    });
  }

  for (const s of list) {
    const words = s.text.match(WORD) || [];
    let first = words[0].toLowerCase();
    if (LEADS.has(first) && words[1]) first = words[1].toLowerCase();
    const instruction = /^[A-Z]/.test(s.text) && IMPERATIVES.has(first);
    const max = instruction ? MAX_INSTRUCTION : MAX_DESCRIPTION;
    if (words.length > max) {
      findings.push({
        line: line(s.offset),
        level: 'error',
        rule: 'sentence-length',
        message: `${words.length} words (max ${max} for ${instruction ? 'an instruction' : 'a description'}): "${preview(s.text)}"`,
      });
    }

    for (const m of s.text.matchAll(PASSIVE)) {
      if (NOT_PARTICIPLES.has(m[1].toLowerCase())) continue;
      findings.push({
        line: line(s.offset + m.index),
        level: 'warn',
        rule: 'passive-voice',
        message: `"${m[0]}" — name who or what does the action`,
      });
    }

    for (const m of s.text.matchAll(/\b[A-Za-z]+ing\b/g)) {
      const w = m[0];
      if (w.length < 5 || ING_OK.has(w.toLowerCase())) continue;
      if (m.index > 0 && /^[A-Z]/.test(w)) continue; // a proper name mid-sentence
      findings.push({
        line: line(s.offset + m.index),
        level: 'warn',
        rule: 'ing-form',
        message: `"${w}" — use a simple tense unless it is a technical name`,
      });
    }
  }
  return findings;
}

/** Lint one source string. kind: 'md' | 'tsx'. Returns findings sorted by line. */
export function lintSource(source, kind, fileName) {
  const segs = kind === 'md' ? markdownSegments(source) : tsxSegments(source, fileName);
  return segs.flatMap(check).sort((a, b) => a.line - b.line);
}

// ---- CLI --------------------------------------------------------------------------------------

function kindOf(file) {
  if (/\.(md|markdown)$/i.test(file)) return 'md';
  if (/\.(tsx|jsx|ts)$/i.test(file)) return 'tsx';
  return null;
}

function main(argv) {
  if (!argv.length || argv.includes('--help')) {
    console.log('usage: node ste-lint.mjs <file.md | file.pdf.tsx> [...]');
    return argv.length ? 0 : 2;
  }
  let errorCount = 0;
  let warnCount = 0;
  for (const file of argv) {
    const kind = kindOf(file);
    if (!kind) {
      console.error(`ste-lint: unsupported file type: ${file}`);
      return 2;
    }
    let findings;
    try {
      findings = lintSource(readFileSync(file, 'utf8'), kind, file);
    } catch (e) {
      console.error(e.message);
      return 2;
    }
    for (const f of findings) {
      console.log(`${file}:${f.line}  ${f.level.padEnd(5)}  ${f.rule}  ${f.message}`);
      if (f.level === 'error') errorCount++;
      else warnCount++;
    }
  }
  console.log(`${errorCount} error(s), ${warnCount} warning(s)`);
  return errorCount ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(process.argv.slice(2)));
}
