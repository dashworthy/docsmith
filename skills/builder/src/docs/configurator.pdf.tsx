// Wastequip Product Configurator README, authored for the react-pdf path. The builder is async: it
// rasterizes the four mermaid diagrams and tokenizes the code block up front (react-pdf renders
// synchronously), then composes the primitive tree. Content tracks
// src/Wastequip/Bundle/ProductConfiguratorBundle/README.md, same as the HTML doc.

import {
  PdfDoc,
  Cover,
  Section,
  P,
  B,
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
} from '../pdf/index.js';

const CHART_FLOW = `flowchart TD
    Start([User Starts Builder]) --> S1[Stage 1: Choose Your System]
    S1 --> Q1{"Frame Material?"}
    Q1 -- "Steel" --> S2[Add-on Stage: Heavy-Duty Hardware]
    Q1 -- "Aluminum" --> Q2
    S2 --> Q2{"Load Length ≥ 240 in?"}
    Q2 -- "Yes" --> S3[Add-on Stage: Extended-Reach Rigging]
    Q2 -- "No" --> S4[Stage: Select a Compatible Tarp]
    S3 --> S4
    S4 --> End([Show Matching Products])`;

const CHART_SEARCH = `flowchart LR
    User[User Selections] --> Merge[Merge Process]
    Hidden[Hidden Rules/Defaults] --> Merge
    Merge --> Search[Search Engine]
    Search --> Page[Take current page - 12]
    Page --> Enrich[Add image, price, unit]
    Enrich --> Display[Product List]`;

const CHART_ER = `erDiagram
    ORGANIZATION  ||--o{ CONFIGURATOR            : "owns"
    CONFIGURATOR  ||--o{ STAGE                   : "contains"
    CONFIGURATOR  ||--o{ STEP                    : "denormalized FK"
    STAGE         ||--o{ STEP                    : "contains"
    STAGE         ||--o{ STAGE_CONDITION         : "gated by"
    STAGE         ||--o{ STAGE_DISPLAY_ATTRIBUTE : "result columns"
    STEP          ||--o{ STEP_OPTION             : "choices"
    STEP          ||--o| STEP_SLIDER             : "range config"
    STEP          ||--o{ STEP_CONDITION          : "gated by"
    STEP_OPTION   }o--o| FILE                    : "option image"
    CONFIGURATOR {
        int id PK
        int organization_id FK "not null"
        string slug UK "unique per org"
        bool enabled "default true"
    }
    STAGE {
        int id PK
        int configurator_id FK "not null"
        bool presents_products "default true"
        string condition_logic "always | all | any"
        int max_products "nullable"
    }
    STEP {
        int id PK
        int stage_id FK "not null"
        string step_key UK "unique per configurator"
        string source_type "category | attribute"
        string retention_scope "global | stage"
        string field_type "image_radio | slider"
        bool hidden "default false"
    }
    STAGE_CONDITION {
        int id PK
        string source_step_key
        string operator "eq|neq|gt|lt|in"
        text value
    }
    STEP_CONDITION {
        int id PK
        string source_step_key
        string operator "eq|neq|gt|lt|in"
        text value
    }
    STEP_OPTION {
        int id PK
        int image_id FK "extend image"
        string option_value
        int position "default 0"
    }
    STEP_SLIDER {
        int step_id PK "1:1"
        float min_value
        float max_value
        string operator "lt|lte|gt|gte|eq"
    }
    STAGE_DISPLAY_ATTRIBUTE {
        int id PK
        string attribute_field_name UK "unique per stage"
    }`;

const CHART_REQUEST = `flowchart TD
    Browser[Backbone app] -->|POST stage + selections| PC[ConfiguratorProductsController]
    PC --> Guard[ConfiguratorValidator gate]
    PC --> Finder[WebsiteSearchProductFinder]
    Finder --> Applier[SelectionFilterApplier]
    Applier --> Resolver[StepSelectionResolver]
    Applier --> Sink[OroQueryFilterSink]
    Finder --> Search[(Website Search / Elasticsearch)]
    Finder --> Enrich["Enrich current page: image + price + unit"]
    Finder --> Diag[ResultDiagnosticsLogger]
    Finder -->|FinderResult JSON| Browser`;

const CODE_TESTS = `# Unit tests
ddev exec ./bin/phpunit src/Wastequip/Bundle/ProductConfiguratorBundle/Tests/Unit/

# Functional tests
ddev exec ./bin/phpunit --testsuite wq-functional --filter Configurator`;

export default async (theme: PdfTheme) => {
  const [flow, search, er, request] = await Promise.all([
    rasterizeMermaid(CHART_FLOW, theme),
    rasterizeMermaid(CHART_SEARCH, theme),
    rasterizeMermaid(CHART_ER, theme),
    rasterizeMermaid(CHART_REQUEST, theme),
  ]);
  const tests = await highlightCode(CODE_TESTS, 'bash', theme);

  return (
    <PdfDoc theme={theme} title="Wastequip Product Configurator">
      <Cover
        eyebrow="Wastequip · OroCommerce bundle"
        title="Product Configurator"
        lede="A storefront guided product builder: customers answer a series of questions that narrow the catalog until the right product surfaces — instead of browsing a giant list."
        chips={['Backbone.js storefront', 'Website Search', 'Org-scoped', 'Conditional logic']}
      />

      <Section
        eyebrow="Lay person's guide"
        title="A digital sales assistant"
        deck="Instead of browsing a giant catalog, the customer is guided through a conversation: use case, then size, then material."
      >
        <P>
          The builder narrows options as the shopper answers, until the perfect match is found. Two ideas
          organize everything below: the screens the shopper moves through, and the questions on each screen.
        </P>
        <PanelGrid>
          <Panel title="Stages (screens)">
            Each stage is a “chapter” in the process. Some stages are simple questions; others show the
            products that match the answers given so far.
          </Panel>
          <Panel title="Steps (questions)">
            Inside each stage are steps — the actual questions. A step might ask the shopper to pick an image
            tile (“Choose a Tarp Type”) or move a slider (“Set the Width”).
          </Panel>
        </PanelGrid>
      </Section>

      <Section
        eyebrow="Smart logic"
        title="Conditionality & scope"
        deck="The builder isn't a linear list — it's conditional. Both stages and individual steps can be hidden or shown based on previous answers."
      >
        <P>
          Example, from the seeded “Roll-Off Tarp System Builder”: Stage 1 “Choose Your System” asks for a
          product line, a Frame Material (Aluminum or Steel), and a Load Length.
        </P>
        <KeyBox role="accent" title="Note">
          The “Heavy-Duty Hardware” stage only appears for a <B>Steel</B> frame; the “Extended-Reach Rigging”
          stage only appears when the Load Length is <B>240 in. or longer</B>. Pick an Aluminum frame with a
          short load and both add-on stages are skipped entirely.
        </KeyBox>
        <P>
          <B>Memory (retention scope).</B> Each step has a retention scope that decides how long its answer
          keeps narrowing the products.
        </P>
        <CompareCard
          title="How long an answer keeps filtering"
          a={{
            role: 'positive',
            label: 'Global scope',
            items: [
              'Stays active for the whole process.',
              'Keeps filtering on every later stage, not just where it was asked.',
              'Can also trigger a stage several screens later.',
            ],
          }}
          b={{
            role: 'warning',
            label: 'Stage scope',
            items: [
              'Only narrows products on the screen where it was asked.',
              'Stops filtering once the shopper moves to the next stage.',
              'Can still drive show/hide logic within that same stage.',
            ],
          }}
          target="A “global” pick like Frame Material keeps trimming the catalog everywhere; a “stage” pick is forgotten as a filter the moment you leave that screen."
        />
        <Mermaid
          diagram={flow}
          title="Conditional stage flow"
          caption="Add-on stages appear only when earlier answers call for them."
        />
      </Section>

      <Section
        eyebrow="Matching"
        title="How products are found"
        deck="Finding a product combines what the shopper chooses with what the system requires."
      >
        <P>
          <B>User facets (dynamic)</B> are the answers the shopper provides (“Red Color”, “10 ft Width”).{' '}
          <B>Static facets (hidden)</B> are always-on rules the shopper never sees — a configurator might be
          locked to one Product Line even though no question asks about it. The system merges the two into a
          single search request, and the matches come back as the result list.
        </P>
        <P>
          Each product on the <B>current page</B> is then “dressed up” for display — a picture, a price, and a
          unit so it can be added to the cart. To stay fast, the list is paged <B>12 at a time</B>, and only
          that page's products are enriched.
        </P>
        <PanelGrid>
          <Panel title="Pictures">
            Three sources in order — the product's own listing image, then the Salsify (supplier feed) image,
            then a generic placeholder — so every product shows something.
          </Panel>
          <Panel title="Prices">
            Prices depend on who is shopping (customer + website), so they're looked up fresh for the logged-in
            shopper and formatted for display.
          </Panel>
        </PanelGrid>
        <KeyBox role="accent" title="Important">
          A listing image only counts as the product's “own” picture when the image file actually exists in
          storage. If the database has the image record but not the file behind it (common when a DB is imported
          without its media), the product falls through to Salsify rather than getting stuck on the placeholder.
        </KeyBox>
        <Mermaid
          diagram={search}
          title="Search & enrichment"
          caption="Selections and hidden rules merge into one search; only the current page is enriched."
        />
      </Section>

      <Section
        eyebrow="Observability"
        title="Handling unexpected behavior"
        deck="Because the logic can be complex, the system monitors itself and logs the two outcomes an owner must act on."
      >
        <KeyBox role="negative" title="Dead end — zero results">
          A set of choices that matches 0 products is logged: the rules are too strict; shoppers can't find
          anything with this combination.
        </KeyBox>
        <KeyBox role="warning" title="Too many — truncation">
          When a search exceeds the display cap, a warning is logged: this stage is too broad; it may need more
          steps to narrow it down.
        </KeyBox>
      </Section>

      <Section
        eyebrow="Technical reference"
        title="Data model"
        deck="The configurator is an aggregate root: a Configurator owns its stages, which own steps, conditions, and display attributes."
      >
        <P>
          Each Step also carries a denormalized configurator_id so step keys can be enforced unique per
          configurator. Stage conditions and step conditions live in two separate tables, each with its own
          owner FK; a schema-level lockstep guard (ConditionSchemaTest) keeps the two column sets identical. A
          Configurator is organization-scoped: its slug is unique per organization, not globally.
        </P>
        <Mermaid
          diagram={er}
          title="Entity graph"
          caption="Configurator aggregate — stages, steps, conditions, options, and display attributes."
        />
      </Section>

      <Section
        eyebrow="Request flow"
        title="Two storefront endpoints"
        deck="Page load hands the whole definition to the Backbone app; every selection change fetches a fresh, narrowed page of products."
      >
        <Phases
          items={[
            {
              idx: '1',
              title: 'Page load',
              body: 'ConfiguratorController loads the enabled Configurator by slug (scoped to the storefront\'s organization), serializes the whole definition to JSON, and hands it to the Oro layout that bootstraps the Backbone app.',
            },
            {
              idx: '2',
              title: 'Product fetch',
              body: 'On every debounced selection change, the front-end POSTs the current stage + accumulated selections to ConfiguratorProductsController, which returns the narrowed, paged, enriched product list as JSON.',
            },
          ]}
        />
        <Mermaid
          diagram={request}
          title="Product fetch pipeline"
          caption="A POST is gated, matched, filtered, searched, enriched, and diagnosed before the JSON returns."
        />
      </Section>

      <Section
        eyebrow="Backend architecture"
        title="Search & matching"
        deck="An engine-agnostic seam keeps the search engine swappable; one class is the only place allowed to touch it."
      >
        <Table
          head={['Class', 'Responsibility']}
          rows={[
            ['ConfiguratorProductFinderInterface', 'Engine-agnostic seam consumers depend on. Lets the search engine be swapped without touching callers. Returns a FinderResult.'],
            ['WebsiteSearchProductFinder', 'The only class allowed to touch the search engine (engine isolation). Matches products, applies the per-stage cap, pages the result, and enriches the current page.'],
            ['SelectionFilterApplier', 'Turns a stage\'s selections + hidden defaults into search filters — the stage\'s own steps plus every global-retention step authored elsewhere. Hardens client-supplied facts against tampering.'],
            ['StepSelectionResolver', 'Single home for “is this step active, and what is its effective value?” A hidden step uses its server-stored default, so a masked constraint can\'t be unlocked by a tampered request.'],
            ['OroQueryFilterSink', 'Three filter primitives: whereCategoryIn → category_id (IN); whereAttributeEquals → text.<attr> (EQ); whereAttributeComparison → decimal.<attr> with lt | lte | gt | gte | eq.'],
            ['FinderResult', 'One page of results + pagination context (products, totalCount capped, page, totalPages, truncated). Page size is the finder\'s private concern.'],
          ]}
        />
      </Section>

      <Section
        eyebrow="Backend architecture"
        title="Enrichment"
        deck="Page-scoped — runs only over the 12 ids on the current page, each provider batched."
      >
        <Table
          head={['Class', 'Responsibility']}
          rows={[
            ['ProductImageUrlProvider', 'Three-tier image chain: local listing image → Salsify CDN image → placeholder.'],
            ['ListingImageUrlProvider', 'The local listing image, one batched query. Emits a URL only when the binary exists (FileManager::hasFile); a record whose file is absent is omitted so the chain falls through to Salsify.'],
            ['SalsifyImageUrlProvider', 'Salsify CDN image for products with no local image. Called only for ids that missed locally.'],
            ['FrontendConfiguratorPriceProvider', 'Resolves customer/website-scoped, formatted prices behind a boundary, so the finder never touches price-format details.'],
            ['PrimaryUnitCodeProvider', 'Each product\'s primary unit code (needed by the add-to-cart form), one batched query.'],
          ]}
        />
        <KeyBox role="positive" title="Tip">
          Enrichment cost scales with the 12-item display size, not with the match count: images, prices, and
          unit codes are looked up only for the current page's ids.
        </KeyBox>
      </Section>

      <Section
        eyebrow="Backend architecture"
        title="Conditional logic"
        deck="One evaluator decides visibility for both stages and steps; a JS mirror hides the same things client-side."
      >
        <SourceCard title={'Condition\\ConditionEvaluator'}>
          Decides whether a stage/step is visible, combining conditions under a logic mode — always (shown
          regardless), all (every condition passes), any (at least one passes). Each condition applies one
          operator: eq / neq (loose equality), gt / gte / lt / lte (numeric), in / not_in (membership). Safe
          defaults on both sides: no conditions → visible; a missing fact or unknown operator → that condition
          fails. The JS condition-evaluator library mirrors it by value.
        </SourceCard>
      </Section>

      <Section
        eyebrow="Limits"
        title="Pagination & caps"
        deck="Page size and every cap live inside the finder; the client renders a pager purely from the result totals."
      >
        <KeyBox role="accent" title="Page size — 12">
          Fixed at PAGE_SIZE, entirely inside the finder. The client renders a pager from FinderResult's totals.
        </KeyBox>
        <KeyBox role="accent" title="Per-stage cap — 1000">
          Each stage's match set is capped at its configured max_products, or DEFAULT_MAX_PRODUCTS when none is
          set. totalCount is the capped count; truncated says whether the true count exceeded it.
        </KeyBox>
        <KeyBox role="accent" title="Result window — 10000">
          Requests are clamped to Elasticsearch's MAX_RESULT_WINDOW: from + size can never exceed it, so a deep
          page is pulled back to the last valid window rather than erroring.
        </KeyBox>
      </Section>

      <Section
        eyebrow="Multi-tenancy"
        title="Organization isolation"
        deck="Configurators are org-scoped: one belongs to a single organization (website) and is visible only within it."
      >
        <P>
          Storefront lookups are scoped to the current website's organization, and because slugs are unique only
          per organization, that scoping is what makes the lookup unambiguous — a configurator owned by one
          org's storefront cannot be reached, or probed via the products endpoint, from another's.
        </P>
      </Section>

      <Section
        eyebrow="Development & testing"
        title="Running tests"
        deck="Unit tests run directly against the bundle; functional tests run through the wq-functional suite."
      >
        <CodeBlock code={tests} />
      </Section>

      <Section
        eyebrow="Deployment"
        title="Deployment notes"
        deck="Two steps keep entity-config and schema in sync on deploy."
      >
        <QList
          items={[
            'Regen config — run oro:platform:update on deploy to update entity-config and extend relations.',
            'Schema — for new installs, use ddev oromigrateinstall.',
          ]}
        />
      </Section>
    </PdfDoc>
  );
};
