// Feature / Architecture Doc — SKELETON
// -----------------------------------------------------------------------------------------------
// A starting pdf.tsx for a designed feature/architecture document, authored with the
// docsmith:docsmith skill. Copy this file to the render run dir as  <RUNDIR>/pdf.tsx , fill in the
// DATA section + replace the guidance prose, then render (run from the skill dir so tsx + the
// package resolve):
//
//   cd "${CLAUDE_PLUGIN_ROOT}/skills/docsmith" \
//     && node --import tsx src/pdf/render.ts "<RUNDIR>" --theme <light|dark>
//
// where <RUNDIR> is a per-render working directory at the PROJECT ROOT, dated + slugged:
//   $PROJECT/.docsmith/<YYYY-MM-DD>-<slug>/       (e.g. .docsmith/2026-09-22-billing-api/)
// One-time, install the builder deps:  cd "${CLAUDE_PLUGIN_ROOT}/skills/docsmith" && npm install
//
// Fill discipline + how to map the feature from source: see feature-doc/SKILL.md steps 1-2
// (read the real code; describe what it does — don't invent; every diagram models the real system).
// THEME — render light by default; offer the reader a dark copy and render --theme dark only if
//   they want one.
//
// This file COMPILES AND RENDERS AS-IS (with placeholder copy) so you can preview the structure
// before filling it. Template mechanics:
//   • The ToC lives in `frontMatter` (an UNNUMBERED page). Page numbers start at 1 on the first body
//     section; fill the ToC's `page` values on a SECOND pass (render once, read where each lands).
//   • Replace every `<...>` angle placeholder and TODO line, or delete the line. Drop any OPTIONAL
//     section the feature doesn't need — a shorter true doc beats a padded one. When you drop a
//     section, delete its matching row from the TOC array too, or the ToC points at a missing section.
//   • Render the chosen theme and LOOK at the PDF before claiming done (docsmith:docsmith step 4).
// -----------------------------------------------------------------------------------------------

import {
  PdfDoc,
  CoverPage,
  Toc,
  Section,
  Subhead,
  P,
  B,
  Badge,
  Table,
  CompareCard,
  SourceCard,
  PanelGrid,
  Panel,
  KeyBox,
  Phases,
  QList,
  CodeBlock,
  Mermaid,
  highlightCode,
  rasterizeMermaid,
  type PdfTheme,
} from '@docsmith/docsmith';

const R = String.raw; // preserves backslashes and $ in PHP/SQL/YAML. NO backticks inside R`...`.

// ===============================================================================================
// DATA — fill these in. The WIRING section below renders them; leave it alone for a standard doc.
// ===============================================================================================

// --- Cover (full-bleed CoverPage — its own dedicated first page) -------------------------------
const COVER = {
  eyebrow: '<Team / area> · <system>',
  title: '<Feature Name>',
  subtitle: '<One or two sentences a newcomer can read: what this feature is and the problem it solves.>',
  tags: ['<stack>', '<key trait>', '<scope>', '<pattern>'],
  meta: [
    { label: 'Platform', value: '<runtime / framework>' },
    { label: 'Module', value: '<bundle / package / dir>' },
    { label: 'Author', value: '<name>' },
    { label: 'Date', value: '<YYYY-MM-DD>' },
  ],
};

// --- Table of contents ------------------------------------------------------------------------
// One row per body section (level:1 for a subsection). `page` is BODY-relative (1 = first body
// page). react-pdf resolves a page only after layout, so fill these on a 2nd pass: render once
// (numbers show '—'), read where each section lands, enter it here, re-render.
// `link` jumps to the Section with the matching `id` (clickable ToC). `page` is the printed number.
const TOC: { title: string; page?: number | string; level?: 0 | 1; link?: string }[] = [
  { title: 'Plain-language overview', page: '—', link: 'overview' },
  { title: 'Architecture at a glance', page: '—', link: 'architecture' },
  { title: 'Data model', page: '—', link: 'data-model' },
  { title: 'Process flow', page: '—', link: 'process-flow' },
  { title: 'Interfaces & payloads', page: '—', link: 'interfaces' },
  { title: 'Components & responsibilities', page: '—', link: 'components' },
  { title: 'Edge cases & failure modes', page: '—', link: 'edge-cases' },
  { title: 'Limits & configuration', page: '—', link: 'limits' },
  { title: 'Testing', page: '—', link: 'testing' },
];

// --- Diagrams (mermaid source; rendered to real vector images) --------------------------------
// Replace each with a diagram of the real system. Keep node labels plain; quote any label that
// contains punctuation, e.g.  Q1{"Load >= 240?"} .
const CHART_ARCH = R`flowchart LR
    Client[Caller] --> Entry[Entry point]
    Entry --> Core[Core service]
    Core --> Store[(Data store)]
    Core --> Ext[External dependency]`;

// OPTIONAL — an entity-relationship model. Set ER_SOURCE = null to omit the Data-model section.
const ER_SOURCE: string | null = R`erDiagram
    OWNER ||--o{ CHILD : "owns"
    OWNER {
        int id PK
        string name
    }
    CHILD {
        int id PK
        int owner_id FK "not null"
        string kind
    }`;

// A request / process pipeline.
const CHART_FLOW = R`flowchart TD
    In[Trigger] --> Step1[Stage 1]
    Step1 --> Step2[Stage 2]
    Step2 --> Out[Result]`;

// --- Code / payload samples -------------------------------------------------------------------
// Each entry: the source, and the Shiki grammar to highlight it with.
const SAMPLES: Record<string, { code: string; lang: string }> = {
  payloadOut: {
    lang: 'json',
    code: R`{
  "key": "value",
  "nested": { "field": "value" }
}`,
  },
  payloadIn: {
    lang: 'json',
    code: R`{
  "key": "value"
}`,
  },
  tests: {
    lang: 'bash',
    code: R`# TODO: how to run this feature's tests
<test command>`,
  },
};

// ===============================================================================================
// WIRING — no edits needed below for a standard doc. Delete OPTIONAL sections you don't use.
// ===============================================================================================

export default async (theme: PdfTheme) => {
  // Pre-compute every async asset up front (react-pdf renders synchronously).
  const [arch, flow, er] = await Promise.all([
    rasterizeMermaid(CHART_ARCH, theme),
    rasterizeMermaid(CHART_FLOW, theme),
    ER_SOURCE ? rasterizeMermaid(ER_SOURCE, theme) : Promise.resolve(null),
  ]);
  const sampleIds = Object.keys(SAMPLES);
  const hl = await Promise.all(sampleIds.map((id) => highlightCode(SAMPLES[id].code, SAMPLES[id].lang, theme)));
  const code: Record<string, (typeof hl)[number]> = {};
  sampleIds.forEach((id, i) => { code[id] = hl[i]; });

  return (
    <PdfDoc
      theme={theme}
      title={COVER.title}
      cover={
        <CoverPage
          eyebrow={COVER.eyebrow}
          title={COVER.title}
          subtitle={COVER.subtitle}
          tags={COVER.tags}
          meta={COVER.meta}
        />
      }
      frontMatter={
        // The ToC — its own UNNUMBERED page. `page` values are body-relative (filled on pass 2).
        <Section eyebrow="Contents" title="What's inside" deck="Each part of this document, in order.">
          <Toc items={TOC} breakAfter={false} />
        </Section>
      }
    >
      {/* ---- Plain-language overview: what it is, for a non-specialist. ------------------------ */}
      <Section
        eyebrow="Overview"
        title="Plain-language overview"
        id="overview"
        deck="TODO — one line: the mental model a newcomer should leave with."
      >
        <P>
          TODO — two or three sentences describing what the feature does and why it exists, in plain
          language. No jargon the reader hasn't met yet. Use <B>bold</B> for a term you then reuse.
        </P>
        <PanelGrid>
          <Panel title="Core concept A">
            TODO — the first idea the rest of the doc builds on.
          </Panel>
          <Panel title="Core concept B">
            TODO — the second idea. Together these two frame everything below.
          </Panel>
        </PanelGrid>
      </Section>

      {/* ---- Architecture at a glance: the shape of the system + a diagram. -------------------- */}
      <Section
        eyebrow="Architecture"
        title="Architecture at a glance"
        id="architecture"
        deck="TODO — how the pieces fit together."
      >
        <P>
          TODO — narrate the diagram: the entry point, the core, what it depends on, and where the
          boundaries are. Use <B>bold</B> for the class/module names a maintainer will grep for.
        </P>
        <Mermaid diagram={arch} title="Component map" caption="TODO — what the diagram shows." />
      </Section>

      {/* ---- OPTIONAL Data model: drop this whole block if ER_SOURCE is null. ------------------ */}
      {er && (
        <Section
          eyebrow="Technical reference"
          title="Data model"
        id="data-model"
          deck="TODO — the entities and how they relate."
        >
          <P>
            TODO — call out the aggregate root, the ownership edges, and any invariant a reader must
            know (unique-per-X keys, denormalized FKs, nullable columns).
          </P>
          <Mermaid diagram={er} title="Entity graph" caption="TODO — what the diagram shows." />
        </Section>
      )}

      {/* ---- Process flow: the ordered stages, then a pipeline diagram. ------------------------ */}
      <Section
        eyebrow="Request flow"
        title="Process flow"
        id="process-flow"
        deck="TODO — what happens from trigger to result."
      >
        <Phases
          items={[
            { idx: '1', title: 'Stage 1', body: 'TODO — what this stage does and hands to the next.' },
            { idx: '2', title: 'Stage 2', body: 'TODO — what this stage does.' },
          ]}
        />
        <Mermaid diagram={flow} title="Pipeline" caption="TODO — what the diagram shows." />
      </Section>

      {/* ---- Interfaces & payloads: the wire contract, with a role table. ---------------------- */}
      <Section
        eyebrow="Payloads"
        title="Interfaces & payloads"
        id="interfaces"
        deck="TODO — the shape of what goes in and comes out."
      >
        <P>
          TODO — explain the contract: what each endpoint/interface carries and any field whose role
          isn't obvious from its name.
        </P>
        <Subhead title="Outbound / definition" />
        <CodeBlock code={code.payloadOut} />
        <Subhead title="Inbound / request" />
        <CodeBlock code={code.payloadIn} />
        <Table
          head={['Field / key', 'What it carries', 'How it is used']}
          rows={[
            ['<key>', '<meaning>', '<consumer behavior>'],
            ['<key>', '<meaning>', '<consumer behavior>'],
          ]}
        />
        <KeyBox role="warning" title="A behavior that isn't obvious">
          TODO — e.g. what happens on a missing/invalid value: does it fail closed, default, or widen
          results? Delete this box if there's no such gotcha.
        </KeyBox>
      </Section>

      {/* ---- Components & responsibilities: the class/module grid. ----------------------------- */}
      <Section
        eyebrow="Backend architecture"
        title="Components & responsibilities"
        id="components"
        deck="TODO — the classes/modules that do the work, one line each."
      >
        <Subhead title="Cluster 1" deck="TODO — what this group is responsible for." />
        <Table
          head={['Class / module', 'Responsibility']}
          rows={[
            ['<Name>', '<what it owns; the one boundary it hides>'],
            ['<Name>', '<what it owns>'],
          ]}
        />
        {/* OPTIONAL: highlight one pivotal class on its own card; delete if none warrants it. */}
        <SourceCard title={'<Namespace\\PivotalClass>'}>
          TODO — why this one class matters: the seam it defines, the twin it mirrors, the rule it
          enforces.
        </SourceCard>
      </Section>

      {/* ---- Edge cases & failure modes: the callouts a maintainer must act on. ---------------- */}
      <Section
        eyebrow="Observability"
        title="Edge cases & failure modes"
        id="edge-cases"
        deck="TODO — what goes wrong, and how the system responds."
      >
        <KeyBox role="negative" title="Failure — e.g. zero results">
          TODO — the condition, what it means, and the signal (log/metric) it emits.
        </KeyBox>
        <KeyBox role="warning" title="Degraded — e.g. truncation">
          TODO — the condition and the action an owner should take.
        </KeyBox>
      </Section>

      {/* ---- OPTIONAL Limits & configuration: fixed numbers, caps, tunables. ------------------- */}
      <Section
        eyebrow="Limits"
        title="Limits & configuration"
        id="limits"
        deck="TODO — the hard numbers and where they live."
      >
        <P>
          TODO — state the caps and defaults as <Badge role="accent">values</Badge> and say which are
          configurable vs fixed. Delete this section if the feature has none worth noting.
        </P>
        <CompareCard
          title="Two modes / scopes that behave differently"
          a={{ role: 'positive', label: 'Mode A', items: ['<trait>', '<trait>'] }}
          b={{ role: 'warning', label: 'Mode B', items: ['<trait>', '<trait>'] }}
          target="TODO — the one-line takeaway distinguishing them."
        />
      </Section>

      {/* ---- Testing + optional operational notes. -------------------------------------------- */}
      <Section
        eyebrow="Development & testing"
        title="Testing"
        id="testing"
        deck="TODO — how to exercise this feature."
      >
        <CodeBlock code={code.tests} />
        {/* OPTIONAL deployment/operational notes; delete the Subhead + QList if not needed. */}
        <Subhead title="Operational notes" rule />
        <QList
          items={[
            '<A step that must run on deploy, and why.>',
            '<A one-off / install-only step, if any.>',
          ]}
        />
      </Section>
    </PdfDoc>
  );
};
