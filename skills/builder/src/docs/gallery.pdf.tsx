// Component gallery — a manual-testing document that exercises EVERY @docsmith/builder component
// in one place, with each one labeled, so you can render it and eyeball how the whole library looks
// in both themes after a change. This is not a real doc; it's a visual test fixture.
//
// Render it with the bundled scripts (from the skill dir):
//   npm run gallery         # renders gallery-light.pdf + gallery-dark.pdf and opens them
//   npm run gallery:watch   # re-renders on every save to a component or this file
//
// Like any pdf.tsx it default-exports an async builder (theme) => <PdfDoc …>; the async assets
// (Shiki code, rasterized mermaid) are awaited up front because react-pdf renders synchronously.

import {
  PdfDoc,
  Cover,
  Section,
  Footer,
  P,
  B,
  Muted,
  Eyebrow,
  Badge,
  Table,
  Legend,
  KeyBox,
  CompareCard,
  SourceCard,
  PanelGrid,
  Panel,
  Phases,
  Flow,
  QList,
  NonGoals,
  CodeBlock,
  Mermaid,
  highlightCode,
  rasterizeMermaid,
  type PdfTheme,
} from '../pdf/index.js';

const SAMPLE_CODE = `export function greet(name: string): string {
  // A tiny sample so CodeBlock has real tokens to color.
  const greeting = \`Hello, \${name}!\`;
  return greeting;
}`;

const FLOWCHART = `flowchart LR
  A[Request] --> B{Cached?}
  B -- yes --> C[(Return cache)]
  B -- no --> D[Fetch] --> E[(Store)] --> C`;

const SEQUENCE = `sequenceDiagram
  participant U as User
  participant S as Service
  U->>S: request
  S-->>U: response`;

export default async (theme: PdfTheme) => {
  // Async pre-pass: everything that can't run inside the synchronous JSX tree.
  const code = await highlightCode(SAMPLE_CODE, 'ts', theme);
  const [flow, seq] = await Promise.all([
    rasterizeMermaid(FLOWCHART, theme),
    rasterizeMermaid(SEQUENCE, theme),
  ]);

  return (
    <PdfDoc theme={theme} title="Component Gallery">
      {/* Structure: Cover */}
      <Cover
        eyebrow="@docsmith/builder · gallery"
        title="Component Gallery"
        lede="Every component in the library, rendered once so you can eyeball the whole set in both themes."
        chips={['light + dark', 'manual test', 'not a real doc']}
      />

      {/* Prose: P, B, Muted, Eyebrow */}
      <Section eyebrow="Prose" title="Paragraphs & inline" deck="P, B, Muted, Eyebrow.">
        <Eyebrow>Standalone eyebrow</Eyebrow>
        <P>
          A body paragraph set with <B>bold emphasis</B> where it earns it and a{' '}
          <Muted>muted aside</Muted> for secondary notes. This is the default for running text.
        </P>
      </Section>

      {/* Inline & tables: Badge (all roles), Table, Legend */}
      <Section eyebrow="Inline & tables" title="Badges, tables, legend" deck="Badge (every role), Table, Legend.">
        <P>
          Badges: <Badge>neutral</Badge> <Badge role="accent">accent</Badge>{' '}
          <Badge role="positive">positive</Badge> <Badge role="negative">negative</Badge>{' '}
          <Badge role="warning">warning</Badge>
        </P>
        <Table
          head={['Flag', 'Default', 'Description']}
          rows={[
            ['--sample', '1000', 'Rows read to infer types'],
            ['--compression', 'snappy', 'Codec: snappy, zstd, gzip'],
            ['--delimiter', ',', 'Field delimiter'],
          ]}
        />
        <Legend
          items={[
            { role: 'accent', label: 'note / info' },
            { role: 'positive', label: 'good / tip' },
            { role: 'warning', label: 'caution' },
            { role: 'negative', label: 'danger' },
            { role: 'neutral', label: 'muted' },
          ]}
        />
      </Section>

      {/* Cards & panels: KeyBox (all roles), CompareCard, SourceCard, PanelGrid + Panel */}
      <Section eyebrow="Callouts" title="KeyBox — every role" deck="The admonition primitive.">
        <KeyBox role="accent" title="Note">An informational note in the accent role.</KeyBox>
        <KeyBox role="positive" title="Tip">A tip in the positive role.</KeyBox>
        <KeyBox role="warning" title="Caution">A caution in the warning role.</KeyBox>
        <KeyBox role="negative" title="Danger">A dead-end / danger in the negative role.</KeyBox>
      </Section>

      <Section eyebrow="Cards & panels" title="Compare, source, panels" deck="CompareCard, SourceCard, PanelGrid + Panel.">
        <CompareCard
          title="Deployed vs live"
          a={{ role: 'warning', label: 'Deployed', items: ['Code shipped dark', 'Behind a flag'] }}
          b={{ role: 'positive', label: 'Live', items: ['Flag enabled', 'Serving traffic'] }}
          target="Shipping and enabling are separate decisions."
        />
        <SourceCard title="src/pdf/render.ts">
          <P>The run-dir wrapper: renders a pdf.tsx to both themes.</P>
        </SourceCard>
        <PanelGrid>
          <Panel title="Pictures">Peer explanation one, kept short.</Panel>
          <Panel title="Prices">Peer explanation two, kept short.</Panel>
          <Panel title="Availability">Peer explanation three, kept short.</Panel>
        </PanelGrid>
      </Section>

      {/* Sequencing: Phases (with a parallel step), Flow (good + bad lanes) */}
      <Section eyebrow="Sequencing" title="Phases & flow" deck="Phases (incl. a parallel step) and Flow lanes.">
        <Phases
          items={[
            { idx: '1', title: 'Shadow', body: 'Mirror every payout in test mode and reconcile nightly.' },
            { idx: '2', title: 'Canary', body: 'Route 5% of traffic for real; hold a go/no-go.' },
            { idx: '3', title: 'Ramp + Watch', body: 'Expand to 100% while monitoring in parallel.', parallel: true },
          ]}
        />
        <Flow
          lanes={[
            { tag: 'Happy path', tone: 'good', steps: [{ text: 'request' }, { text: 'validate' }, { text: '200 OK', tone: 'good' }] },
            { tag: 'Failure', tone: 'bad', steps: [{ text: 'request' }, { text: 'timeout', tone: 'bad' }, { text: 'retry' }] },
          ]}
        />
      </Section>

      {/* Lists: QList, NonGoals */}
      <Section eyebrow="Lists" title="Ordered & anti-goals" deck="QList and NonGoals.">
        <QList items={['Add the field to the event schema.', 'Populate it at the producer.', 'Add a consumer test.']} />
        <NonGoals items={['A schema registry', 'Streaming ingestion', 'Nested/repeated fields']} />
      </Section>

      {/* Code & diagrams (async): CodeBlock, Mermaid (flowchart + sequence) */}
      <Section eyebrow="Code & diagrams" title="Code and mermaid" deck="CodeBlock, and Mermaid as real vector diagrams.">
        <CodeBlock code={code} />
        <Mermaid diagram={flow} title="Flowchart" caption="A request path, cached or fetched." />
        <Mermaid diagram={seq} title="Sequence" caption="A minimal request/response exchange." />
      </Section>

      {/* Structure: Footer — shown here only to exercise the component (document provenance, never tool branding). */}
      <Footer lines={['Component gallery — manual test fixture', 'Provenance lines go here, not tool branding.']} />
    </PdfDoc>
  );
};
