// Tests for scripts/ste-lint.mjs. Run: node --test skills/feature-doc/test/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { lintSource } from '../scripts/ste-lint.mjs';

const SCRIPT = fileURLToPath(new URL('../scripts/ste-lint.mjs', import.meta.url));
const TEMPLATES = fileURLToPath(new URL('../references/templates/', import.meta.url));

const words = (n, w = 'word') => Array.from({ length: n }, () => w).join(' ');
const errors = (f) => f.filter((x) => x.level === 'error');
const warns = (f) => f.filter((x) => x.level === 'warn');
const rules = (f) => f.map((x) => x.rule);

// ---- Markdown ---------------------------------------------------------------------------------

test('md: a short active sentence passes', () => {
  assert.deepEqual(lintSource('The service sends the invoice to the queue.\n', 'md'), []);
});

test('md: a descriptive sentence over 25 words is an error at its line', () => {
  const f = lintSource(`# Title\n\nShort one.\n\nThe ${words(26)}.\n`, 'md');
  assert.deepEqual(rules(errors(f)), ['sentence-length']);
  assert.equal(errors(f)[0].line, 5);
});

test('md: an instruction sentence over 20 words is an error; a 22-word description is not', () => {
  const instr = lintSource(`Run ${words(21)}.\n`, 'md');
  assert.deepEqual(rules(errors(instr)), ['sentence-length']);
  assert.match(errors(instr)[0].message, /max 20/);
  assert.deepEqual(errors(lintSource(`The ${words(21)}.\n`, 'md')), []);
});

test('md: a paragraph with more than 6 sentences is an error', () => {
  const para = Array.from({ length: 7 }, () => 'The queue holds the job.').join(' ');
  assert.deepEqual(rules(errors(lintSource(`${para}\n`, 'md'))), ['paragraph-length']);
});

test('md: each list item and table cell is its own paragraph', () => {
  const items = Array.from({ length: 7 }, () => '- The queue holds the job.').join('\n');
  assert.deepEqual(errors(lintSource(`${items}\n`, 'md')), []);
  const row = `| a | b |\n|---|---|\n| The ${words(26)}. | ok |\n`;
  assert.deepEqual(rules(errors(lintSource(row, 'md'))), ['sentence-length']);
});

test('md: code fences, inline code, comments, headings and table headers are exempt', () => {
  const src = [
    '<!--',
    `The ${words(30)}.`,
    '-->',
    `# Running ${words(30)}`,
    '',
    '```bash',
    `echo ${words(30)}`,
    '```',
    '',
    `| Running ${words(30)} | b |`,
    '|---|---|',
    '| x | y |',
    '',
    'Call `processingQueueHandler` to start the job.',
  ].join('\n');
  assert.deepEqual(lintSource(src, 'md'), []);
});

test('md: abbreviations such as e.g. do not split a sentence', () => {
  const f = lintSource(`The job fails, e.g. on a timeout, and ${words(20)}.\n`, 'md');
  assert.deepEqual(rules(errors(f)), ['sentence-length']);
});

test('md: passive voice and -ing forms are warnings only', () => {
  const f = lintSource('The invoice is sent by the worker. The worker is retrying the job.\n', 'md');
  assert.deepEqual(errors(f), []);
  assert.deepEqual(rules(warns(f)).sort(), ['ing-form', 'passive-voice']);
});

test('md: common words that end in -ing are not flagged', () => {
  assert.deepEqual(lintSource('The string holds nothing during the first run.\n', 'md'), []);
});

// ---- TSX --------------------------------------------------------------------------------------

test('tsx: JSX text with inline elements is one paragraph, reported at its source line', () => {
  const src = [
    'const x = (',
    '  <Section title="Processing everything that is being handled here today">',
    '    <P>',
    `      The <B>Router</B> ${words(26)}.`,
    '    </P>',
    '  </Section>',
    ');',
  ].join('\n');
  const f = lintSource(src, 'tsx');
  assert.deepEqual(rules(errors(f)), ['sentence-length']);
  assert.equal(errors(f)[0].line, 4);
});

test('tsx: prose props and object strings are linted; label-like keys are exempt', () => {
  const src = [
    `const A = { eyebrow: 'Running ${words(30)}', subtitle: 'The ${words(26)}.' };`,
    `const T = <Table head={['Running ${words(30)}']} rows={[['The ${words(26)}.']]} />;`,
    `const D = <Section deck="The ${words(26)}." id="x" />;`,
  ].join('\n');
  const f = lintSource(src, 'tsx');
  assert.deepEqual(errors(f).map((x) => x.line), [1, 2, 3]);
});

test('tsx: comments and tagged template literals (code, mermaid) are exempt', () => {
  const src = [
    `// The ${words(30)}.`,
    `const C = R\`The ${words(30)}.\`;`,
    `const J = <P>{/* The ${words(30)}. */}The job runs.</P>;`,
  ].join('\n');
  assert.deepEqual(lintSource(src, 'tsx'), []);
});

// ---- CLI --------------------------------------------------------------------------------------

test('cli: exits 1 on errors and prints file:line findings', () => {
  const file = fileURLToPath(new URL('./fixtures/long-sentence.md', import.meta.url));
  let out = '';
  let code = 0;
  try {
    execFileSync(process.execPath, [SCRIPT, file], { encoding: 'utf8' });
  } catch (e) {
    code = e.status;
    out = e.stdout;
  }
  assert.equal(code, 1);
  assert.match(out, /long-sentence\.md:3\s+error\s+sentence-length/);
});

test('cli: the shipped templates have no errors', () => {
  for (const t of ['markdown/feature-doc.md', 'pdf/feature-doc.pdf.tsx']) {
    execFileSync(process.execPath, [SCRIPT, TEMPLATES + t], { encoding: 'utf8' });
  }
});
