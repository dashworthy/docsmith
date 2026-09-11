// Demo document — exercises the pipeline end to end. Default-exports the root element the
// generator renders; `title` becomes the HTML <title>. Grows as components land in later tasks.

import { Doc } from '../components/Doc.js';
import { Cover } from '../components/Cover.js';
import { Section } from '../components/Section.js';
import { Footer } from '../components/Footer.js';
import { Callout } from '../components/Callout.js';
import { Badge } from '../components/Badge.js';
import { Table } from '../components/Table.js';
import { Legend } from '../components/Legend.js';
import { CompareCard } from '../components/CompareCard.js';
import { SourceCard } from '../components/SourceCard.js';
import { PanelGrid, Panel } from '../components/PanelGrid.js';
import { KeyBox } from '../components/KeyBox.js';
import { Phases } from '../components/Phases.js';
import { Flow } from '../components/Flow.js';
import { QList } from '../components/QList.js';
import { NonGoals } from '../components/NonGoals.js';
import { CodeBlock } from '../components/CodeBlock.js';
import { Mermaid } from '../components/Mermaid.js';

export const title = 'Harvest × Bloom Parity';

export default (
  <Doc>
    <Cover
      eyebrow="Design system · 2026-09-10"
      title="Harvest × Bloom Parity"
      lede="A demonstration document rendered by the React builder to standalone HTML and to PDF, in both light and dark themes."
      chips={['Theme · designed', 'React 18', 'native Tailwind']}
    />

    <Section
      eyebrow="Category by category"
      title="The pipeline spine"
      deck="This first increment proves the end-to-end path: hand-written JSX becomes an HTML source of truth, and a headless-Chrome print turns that into a PDF."
    >
      <p>
        Everything on the page is colored only through the typed token module, so a single palette
        swap re-themes the whole document. The eyebrow above sits in the accent role; this body copy
        is the base ink on the page ground.
      </p>
      <p>
        Later increments hang the rest of the component library — callouts, badges, tables, compare
        cards, panels, phases, flow lanes, code blocks, and diagrams — off this same spine.
      </p>
    </Section>

    <Section
      eyebrow="Inline elements"
      title="Callouts & badges"
      deck="Admonition callouts carry a role tint; badges are inline status pills."
    >
      <p>
        Status pills: <Badge>Neutral</Badge> <Badge role="accent">Accent</Badge>{' '}
        <Badge role="positive">Stable</Badge> <Badge role="warning">Beta</Badge>{' '}
        <Badge role="negative">Deprecated</Badge>.
      </p>
      <Callout role="note">A note in the accent role.</Callout>
      <Callout role="tip">A tip in the positive role.</Callout>
      <Callout role="warning">A warning in the amber role.</Callout>
      <Callout role="caution">A caution in the negative role.</Callout>
    </Section>

    <Section
      eyebrow="Tabular data"
      title="Tables & legend"
      deck="An accent-header table and a tint legend."
    >
      <Table
        head={['Component', 'Role']}
        rows={[
          ['Table', 'accent-header data table'],
          ['Legend', 'role tint key'],
          ['Callout', 'admonition card'],
        ]}
      />
      <Legend
        items={[
          { role: 'accent', label: 'accent' },
          { role: 'positive', label: 'positive' },
          { role: 'negative', label: 'negative' },
          { role: 'warning', label: 'warning' },
          { role: 'neutral', label: 'neutral' },
        ]}
      />
    </Section>

    <Section
      eyebrow="Category by category"
      title="Comparison & sources"
      deck="Comparison cards read today against target; source cards name a class or API."
    >
      <CompareCard
        num="01"
        title="Questions & permissions"
        a={{
          role: 'negative',
          label: 'Today',
          items: ['Vanishes after answering.', 'Answers flattened to a string.'],
        }}
        b={{
          role: 'positive',
          label: 'Target',
          items: ['Inline card with previews.', 'Structured, persisted answers.'],
        }}
        target="Inline card, previews, structured answers, full scopes."
      />
      <SourceCard title={'Docsmith\\Render\\MarkdownDocumentRenderer'}>
        The only class allowed to drive the headless browser — parses the Markdown, runs the
        diagrams, prints the PDF.
      </SourceCard>
    </Section>

    <Section
      eyebrow="At a glance"
      title="Panels & key boxes"
      deck="Panels group short notes; key boxes flag a labeled fact."
    >
      <PanelGrid>
        <Panel title="Data flow">Parser → correlate by id → store → render.</Panel>
        <Panel title="Library picks">marked, mermaid, puppeteer-core.</Panel>
      </PanelGrid>
      <KeyBox role="negative" k="Gap 1 — no results" v="Tool output is absent end to end." />
      <KeyBox role="positive" k="Fix — result capture" v="Captured and rendered in the tool row." />
    </Section>

    <Section
      eyebrow="Sequencing"
      title="Phases & flow"
      deck="Phases order the work; flow lanes read today against target."
    >
      <Phases
        items={[
          { idx: '0', title: 'Foundations', body: 'Result capture end to end; unified row + router.' },
          { idx: '1', title: 'Tool-row system', body: 'Pure presenter, collapsed rows, result view.' },
          { idx: '7', title: 'Discovery', body: 'Independent of the render work; can start immediately.', parallel: true },
        ]}
      />
      <Flow
        lanes={[
          {
            tag: 'today',
            tone: 'bad',
            steps: [{ text: 'parser' }, { text: 'drops results', tone: 'bad' }, { text: 'raw JSON', tone: 'bad' }],
          },
          {
            tag: 'target',
            tone: 'good',
            steps: [{ text: 'parser + result', tone: 'good' }, { text: 'router' }, { text: 'presenter', tone: 'good' }],
          },
        ]}
      />
    </Section>

    <Section
      eyebrow="Boundaries"
      title="Open questions & non-goals"
      deck="Questions to resolve, and what this work explicitly is not."
    >
      <QList
        items={[
          'DB migration vs rebuild for the new column?',
          'Truncation policy for large tool output?',
        ]}
      />
      <NonGoals
        items={[
          'Other-agent support — out of scope this run.',
          'Non-chat panes — not part of this work.',
        ]}
      />
    </Section>

    <Section
      eyebrow="Code"
      title="Syntax highlighting"
      deck="Code blocks are highlighted at generation time with Shiki — static, no runtime JS."
    >
      <CodeBlock
        lang="ts"
        code={`export function generate(opts: GenerateOptions): Promise<void> {
  const root = (await import(opts.docModule)).default;
  const bodyHtml = renderToStaticMarkup(root);
  // passes.reduce(...) → assembleHtml → write .html | print .pdf
  return write(bodyHtml, opts);
}`}
      />
    </Section>

    <Section
      eyebrow="Diagrams"
      title="Pre-rendered mermaid"
      deck="Diagrams render to inline SVG at generation time, recolored by shape."
    >
      <Mermaid
        title="Render pipeline"
        caption="Markdown-shaped content becomes a designed page, then Chrome prints it."
        chart={`flowchart LR
  A[JSX doc] --> B{Format?}
  B -->|html| C[Static HTML]
  B -->|pdf| D[(PDF)]
  C --> E((done))
  D --> E`}
      />
    </Section>

    <Footer
      lines={[
        'Generated by @docsmith/builder from src/docs/demo.tsx',
        'pipeline · JSX → HTML (renderToStaticMarkup) → PDF (headless Chrome)',
        'reference · github.com/dashworthy/docsmith',
      ]}
    />
  </Doc>
);
