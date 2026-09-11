// Wastequip Product Configurator Bundle README, re-authored as a builder doc so it renders to
// standalone HTML (light + dark) through the same pipeline as every other document. Content tracks
// src/Wastequip/Bundle/ProductConfiguratorBundle/README.md in the orocommerce repo.

import {
  Doc,
  Cover,
  Section,
  Footer,
  Callout,
  Badge,
  Table,
  CompareCard,
  SourceCard,
  PanelGrid,
  Panel,
  KeyBox,
  Phases,
  Flow,
  QList,
  CodeBlock,
  Mermaid,
} from '../index.js';

export const title = 'Wastequip Product Configurator';

export default (
  <Doc>
    <Cover
      eyebrow="Wastequip · OroCommerce bundle"
      title="Product Configurator"
      lede="A storefront guided product builder: customers answer a series of questions that narrow the catalog until the right product surfaces — instead of browsing a giant list."
      chips={['Backbone.js storefront', 'Website Search', 'Org-scoped', 'Conditional logic']}
    />

    {/* ───────────────────────── 🌟 High-Level Overview ───────────────────────── */}

    <Section
      eyebrow="🌟 Lay person's guide"
      title="A digital sales assistant"
      deck="Instead of browsing a giant catalog, the customer is guided through a conversation: “What is your use case?” → “What size do you need?” → “Which material do you prefer?”"
    >
      <p>
        The builder narrows options as the shopper answers, until the perfect match is found. Two
        ideas organize everything below: the screens the shopper moves through, and the questions on
        each screen.
      </p>
      <PanelGrid>
        <Panel title="Stages (screens)">
          Each stage is a “chapter” in the process. Some stages are simple questions; others show the
          products that match the answers given so far.
        </Panel>
        <Panel title="Steps (questions)">
          Inside each stage are steps — the actual questions. A step might ask the shopper to pick an
          image tile (“Choose a Tarp Type”) or move a slider (“Set the Width”).
        </Panel>
      </PanelGrid>
    </Section>

    <Section
      eyebrow="Smart logic"
      title="Conditionality & scope"
      deck="The builder isn't a linear list — it's conditional. Both stages and individual steps can be hidden or shown based on previous answers."
    >
      <p>
        Example, from the seeded “Roll-Off Tarp System Builder”: Stage 1 “Choose Your System” asks
        for a product line, a Frame Material (Aluminum or Steel), and a Load Length.
      </p>
      <Callout role="note">
        The “Heavy-Duty Hardware” stage only appears for a <b>Steel</b> frame; the “Extended-Reach
        Rigging” stage only appears when the Load Length is <b>240 in. or longer</b>. Pick an Aluminum
        frame with a short load and both add-on stages are skipped entirely.
      </Callout>
      <p>
        <b>Memory (retention scope).</b> Each step has a retention scope that decides how long its
        answer keeps narrowing the products.
      </p>
      <CompareCard
        num="scope"
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
        title="Conditional stage flow"
        caption="Add-on stages appear only when earlier answers call for them."
        chart={`flowchart TD
    Start([User Starts Builder]) --> S1[Stage 1: Choose Your System]
    S1 --> Q1{"Frame Material?"}
    Q1 -- "Steel" --> S2[Add-on Stage: Heavy-Duty Hardware]
    Q1 -- "Aluminum" --> Q2
    S2 --> Q2{"Load Length ≥ 240 in?"}
    Q2 -- "Yes" --> S3[Add-on Stage: Extended-Reach Rigging]
    Q2 -- "No" --> S4[Stage: Select a Compatible Tarp]
    S3 --> S4
    S4 --> End([Show Matching Products])`}
      />
    </Section>

    <Section
      eyebrow="Matching"
      title="How products are found"
      deck="Finding a product combines what the shopper chooses with what the system requires."
    >
      <p>
        <b>User facets (dynamic)</b> are the answers the shopper provides (“Red Color”, “10 ft Width”).{' '}
        <b>Static facets (hidden)</b> are always-on rules the shopper never sees — a configurator might
        be locked to one Product Line even though no question asks about it. The system merges the two
        into a single search request, and the matches come back as the result list.
      </p>
      <p>
        Each product on the <b>current page</b> is then “dressed up” for display — a picture, a price,
        and a unit so it can be added to the cart. To stay fast, the list is paged{' '}
        <Badge role="accent">12 at a time</Badge>, and only that page's products are enriched, not the
        thousands that might match.
      </p>
      <PanelGrid>
        <Panel title="Pictures">
          Three sources in order — the product's own listing image, then the Salsify (supplier feed)
          image, then a generic placeholder — so every product shows something.
        </Panel>
        <Panel title="Prices">
          Prices depend on who is shopping (customer + website), so they're looked up fresh for the
          logged-in shopper and formatted for display.
        </Panel>
      </PanelGrid>
      <Callout role="important">
        A listing image only counts as the product's “own” picture when the image file actually exists
        in storage. If the database has the image record but not the file behind it (common when a DB
        is imported without its media), the product falls through to Salsify rather than getting stuck
        on the placeholder.
      </Callout>
      <Mermaid
        title="Search & enrichment"
        caption="Selections and hidden rules merge into one search; only the current page is enriched."
        chart={`flowchart LR
    User[User Selections] --> Merge[Merge Process]
    Hidden[Hidden Rules/Defaults] --> Merge
    Merge --> Search[Search Engine]
    Search --> Page[Take current page - 12]
    Page --> Enrich[Add image, price, unit]
    Enrich --> Display[Product List]`}
      />
    </Section>

    <Section
      eyebrow="Observability"
      title="Handling unexpected behavior"
      deck="Because the logic can be complex, the system monitors itself and logs the two outcomes an owner must act on."
    >
      <KeyBox
        role="negative"
        k="Dead end — zero results"
        v="A set of choices that matches 0 products is logged: the rules are too strict; shoppers can't find anything with this combination."
      />
      <KeyBox
        role="warning"
        k="Too many — truncation"
        v="When a search exceeds the display cap, a warning is logged: this stage is too broad; it may need more steps to narrow it down."
      />
    </Section>

    {/* ───────────────────────── 🛠 Technical Reference ───────────────────────── */}

    <Section
      eyebrow="🛠 Technical reference"
      title="Data model"
      deck="The configurator is an aggregate root: a Configurator owns its stages, which own steps, conditions, and display attributes."
    >
      <p>
        Each Step also carries a denormalized configurator_id so step keys can be enforced unique per
        configurator. Stage conditions and step conditions live in two separate tables
        (oro_wqpc_stage_condition and oro_wqpc_step_condition), each with its own owner FK. The two
        carry the same four data columns (source_step_key, operator, value, position); the
        StageCondition and StepCondition entities share no base class, so a schema-level lockstep guard
        (ConditionSchemaTest) keeps the two column sets identical. A Configurator is
        organization-scoped: its slug is unique per organization, not globally.
      </p>
      <Mermaid
        title="Entity graph"
        caption="Configurator aggregate — stages, steps, conditions, options, and display attributes."
        chart={`erDiagram
    ORGANIZATION  ||--o{ CONFIGURATOR            : "owns (org-scoped)"
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
        string source_step_key "not null"
        string operator "eq|neq|gt|gte|lt|lte|in|not_in"
        text value "not null"
    }
    STEP_CONDITION {
        int id PK
        string source_step_key "not null"
        string operator "eq|neq|gt|gte|lt|lte|in|not_in"
        text value "not null"
    }
    STEP_OPTION {
        int id PK
        int image_id FK "nullable extend image"
        string option_value "not null"
        int position "default 0"
    }
    STEP_SLIDER {
        int step_id PK "shared identity 1:1"
        float min_value "not null"
        float max_value "not null"
        string operator "lt|lte|gt|gte|eq"
    }
    STAGE_DISPLAY_ATTRIBUTE {
        int id PK
        string attribute_field_name UK "unique per stage"
    }`}
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
            body: 'ConfiguratorController loads the enabled Configurator by slug (scoped to the storefront\'s organization), serializes the whole definition to JSON via ConfiguratorDefinitionSerializer, and hands it to the Oro layout that bootstraps the Backbone app.',
          },
          {
            idx: '2',
            title: 'Product fetch',
            body: 'On every debounced selection change, the front-end POSTs the current stage + accumulated selections to ConfiguratorProductsController, which returns the narrowed, paged, enriched product list as JSON.',
          },
        ]}
      />
      <Mermaid
        title="Product fetch pipeline"
        caption="A POST is gated, matched, filtered, searched, enriched, and diagnosed before the JSON returns."
        chart={`flowchart TD
    Browser[Backbone app] -->|POST stage + selections| PC[ConfiguratorProductsController]
    PC --> Guard[ConfiguratorValidator gate]
    PC --> Finder[WebsiteSearchProductFinder]
    Finder --> Applier[SelectionFilterApplier]
    Applier --> Resolver[StepSelectionResolver]
    Applier --> Sink[OroQueryFilterSink]
    Finder --> Search[(Website Search / Elasticsearch)]
    Finder --> Enrich["Enrich current page: image + price + unit"]
    Finder --> Diag[ResultDiagnosticsLogger]
    Finder -->|FinderResult JSON| Browser`}
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
          ['WebsiteSearchProductFinder', 'The only class allowed to touch WebsiteSearchBundle / the search engine (engine isolation). Matches products, applies the per-stage cap, pages the result, and enriches the current page.'],
          ['SelectionFilterApplier', 'Turns a stage\'s selections + hidden defaults into search filters — the stage\'s own steps plus every global-retention step authored in any other stage. Hardens client-supplied condition facts against tampering before gating.'],
          ['StepSelectionResolver → StepResolution', 'Single home for “is this step active, and what is its effective value?” Both the finder and the filter applier consume the same StepResolution, so the gate and effective-value rule can\'t drift. A hidden step uses its server-stored default, so a masked constraint can\'t be unlocked by a tampered request.'],
          ['FilterSink / OroQueryFilterSink', 'Filter-sink seam and its Oro implementation. Three primitives: whereCategoryIn → integer.category_id (IN); whereAttributeEquals → text.<attr> (EQ); whereAttributeComparison → decimal.<attr> with lt | lte | gt | gte | eq.'],
          ['FinderResult', 'One page of results + pagination context (products, totalCount capped, page, totalPages, truncated). Page size is the finder\'s private concern and never enters this DTO.'],
          ['ProductResult', 'A single enriched result row: sku, name, image URL, formatted price, unit code, displayed attributes.'],
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
          ['ListingImageUrlProvider', 'The local listing image at the storefront product_small filter, one batched query. Emits a URL only when the binary exists (FileManager::hasFile); a record whose file is absent is omitted so the chain falls through to Salsify.'],
          ['SalsifyImageUrlProvider', 'Salsify CDN image (salsify_data → image_1_jpg) for products with no local image. Called only for ids that missed locally.'],
          ['DefaultImageUrlProvider', 'Last-resort site placeholder graphic at the same product_small size.'],
          ['FrontendConfiguratorPriceProvider', 'Resolves customer/website-scoped, formatted prices behind a boundary, so the finder never touches a layout data provider or price-format details.'],
          ['PrimaryUnitCodeProvider', 'Each product\'s primary unit code (needed by the add-to-cart form), one batched query.'],
          ['ProductAttributeValueProvider', 'Turns raw product data (enum ids, booleans) into the human-readable strings shown in the results grid and build-summary cards.'],
        ]}
      />
      <Callout role="tip">
        Enrichment cost scales with the 12-item display size, not with the match count: images, prices,
        and unit codes are looked up only for the current page's ids.
      </Callout>
    </Section>

    <Section
      eyebrow="Backend architecture"
      title="Conditional logic"
      deck="One evaluator decides visibility for both stages and steps; a JS mirror hides the same things client-side."
    >
      <SourceCard title="Condition\\ConditionEvaluator">
        Decides whether a stage/step is visible. Consumes ConditionData value objects (stage and step
        conditions treated identically), combined under a ConditionLogic mode — always (shown
        regardless), all (every condition passes), any (at least one passes). Each condition applies one
        operator: eq / neq (loose equality, numeric strings compared as numbers), gt / gte / lt / lte
        (numeric — both operands must be numeric, else the condition fails), in / not_in (membership in
        a comma-separated set). Safe defaults on both sides: no conditions → visible; a missing/empty
        fact or unknown operator → that condition fails. The JS condition-evaluator library mirrors it
        by value.
      </SourceCard>
    </Section>

    <Section
      eyebrow="Backend architecture"
      title="Serialization, validation & tooling"
      deck="The definition is serialized for the front-end; one validator's rules are reused everywhere they're needed."
    >
      <Table
        head={['Class', 'Responsibility']}
        rows={[
          ['ConfiguratorDefinitionSerializer', 'Converts the DB entity graph into the JSON definition the Backbone front-end consumes.'],
          ['ConfiguratorValidator', 'Central structural-integrity rules over the entity graph. Each problem is tagged error (violation on existing data → blocks save) or completeness (required sub-structure not yet added → informational). Reused by the admin constraint, the console command, and the storefront guard.'],
          ['ValidateConfiguratorCommand', 'wq:configurator:validate — audits one configurator by slug or all of them (e.g. after a catalog/attribute change); exits non-zero if any are invalid.'],
          ['ProductAttributeProvider', 'Supplies filterable attributes for the admin picker, derives defaults to pre-fill the builder form, and lists attributes eligible for stage display.'],
          ['ResultDiagnosticsLogger', 'Logs (at ERROR) the two outcomes an owner must act on: match set exceeded the effective cap (silent truncation), and a stage returning zero products. fullySelected distinguishes “matches nothing” from “matches nothing at all.”'],
        ]}
      />
    </Section>

    <Section
      eyebrow="Limits"
      title="Pagination & caps"
      deck="Page size and every cap live inside the finder; the client renders a pager purely from the result totals."
    >
      <KeyBox role="accent" k="Page size — 12" v="Fixed at PAGE_SIZE, entirely inside the finder. The client renders a pager from FinderResult's totals." />
      <KeyBox role="accent" k="Per-stage cap — 1000" v="Each stage's match set is capped at its configured max_products, or DEFAULT_MAX_PRODUCTS when none is set. totalCount is the capped count; truncated says whether the true count exceeded it." />
      <KeyBox role="accent" k="Result window — 10000" v="Requests are clamped to Elasticsearch's MAX_RESULT_WINDOW: from + size can never exceed it, so a deep page is pulled back to the last valid window rather than erroring." />
    </Section>

    <Section
      eyebrow="Multi-tenancy"
      title="Organization isolation"
      deck="Configurators are org-scoped: one belongs to a single organization (website) and is visible only within it."
    >
      <p>
        Storefront lookups are scoped to the current website's organization
        (WebsiteManager::getCurrentWebsite()), and because slugs are unique only per organization, that
        scoping is what makes the lookup unambiguous — a configurator owned by one org's storefront
        cannot be reached, or probed via the products endpoint, from another's.
      </p>
    </Section>

    <Section
      eyebrow="Frontend"
      title="Backbone.js app"
      deck="The storefront app is bootstrapped from the serialized definition and holds all shopper state client-side."
    >
      <p>
        configurator-app-view boots from the serialized definition and holds shopper state in
        configurator-state-model. Steps render through a view registry (step-view-registry) that maps a
        step's field_type to its view — image-radio-step-view (tile picker) or slider-step-view (range)
        — while product-results-view renders the paged, enriched product cards (product-card) and
        build-summary-view shows the running selection. Conditional show/hide is evaluated client-side
        by lib/condition-evaluator, a by-value mirror of the PHP ConditionEvaluator, so the browser
        hides the same stages/steps the server would.
      </p>
    </Section>

    {/* ───────────────────────── 🚀 Development & Testing ───────────────────────── */}

    <Section
      eyebrow="🚀 Development & testing"
      title="Running tests"
      deck="Unit tests run directly against the bundle; functional tests run through the wq-functional suite."
    >
      <CodeBlock
        lang="bash"
        code={`# Unit tests
ddev exec ./bin/phpunit src/Wastequip/Bundle/ProductConfiguratorBundle/Tests/Unit/

# Functional tests
ddev exec ./bin/phpunit --testsuite wq-functional --filter Configurator`}
      />
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

    <Footer
      lines={[
        'Rendered by @docsmith/builder from src/docs/configurator.tsx',
        'source · src/Wastequip/Bundle/ProductConfiguratorBundle/README.md',
        'pipeline · JSX → HTML (renderToStaticMarkup) → PDF (headless Chrome)',
      ]}
    />
  </Doc>
);
