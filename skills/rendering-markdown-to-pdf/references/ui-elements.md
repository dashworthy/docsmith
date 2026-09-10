# UI Elements — Decision Matrix & Mini Templates

The `designed` theme ships a component library modeled on a real Claude design artifact.
Every element is **token-driven**, so it renders correctly in both `--mode light` and
`--mode dark` with no per-mode markup — the "light/dark versions" are just the `--mode`
flag. Colors come from role tokens (`accent`, `positive`, `negative`, `warning`, `neutral`),
so `--accent green` (etc.) recolors the accent pieces in one move.

Two kinds of element:
- **Native Markdown** — cover, callouts, badges, reference cards, eyebrow, diagram cards.
  You write plain Markdown / directives; docsmith renders the component.
- **Copy-paste HTML** — the richer artifact components (comparison, phases, flow, panels,
  legend, key boxes, custom lists, footer). Paste the snippet inline in your Markdown;
  Chrome renders it and the tokens style it. Keep a blank line before and after each block.

## Contents
- [Decision matrix](#decision-matrix)
- [Native Markdown elements](#native-markdown-elements)
- [Copy-paste HTML elements](#copy-paste-html-elements)

## Decision matrix

| Element | Reach for it when… | Prefer something else when… |
|---|---|---|
| **Cover header** | The doc is a deliverable (spec, report, guide) that benefits from a title, status and metadata. | It's a quick internal note — a plain `#` H1 is enough. |
| **Eyebrow kicker** | A section needs a one-line category/label above its heading. | The heading already stands alone. |
| **Callout** | One point needs to interrupt the flow — a warning, tip, or note. | Several parallel points → use key boxes or a list. |
| **Badge / pill** | Labeling inline status (New, Beta, Deprecated) or a short tag. | It's a full sentence — write prose. |
| **Reference cards** | A 2-column "name → description" table whose first column is long/monospace (APIs, classes, flags). | Truly tabular data with short cells and >2 columns → keep the table. |
| **Key boxes** | 2–4 short parallel metrics/facts that deserve tinting (e.g. two failure modes). | One point → callout; many rows → list or table. |
| **Comparison** | Contrasting two options/states side by side (today vs target, A vs B), each a short bullet list. | More than two things, or long prose → panels or sections. |
| **Panels** | Two related blocks that read side by side (data-flow + library picks). | Content is sequential → stack normally. |
| **Flow lanes** | A short before/after or good/bad pipeline of labeled steps, in HTML (no graph needed). | A branching/graph structure → use a ```mermaid diagram. |
| **Phase cards** | An ordered, numbered plan/roadmap where each step has a title + one-liner. | Unordered items → a list. |
| **Legend** | Explaining what your role colors mean once, near where they're first used. | Colors are obvious from context. |
| **Custom lists** | Numbered open questions (`Q1…`) or struck non-goals (`×`). | Ordinary bullets/numbers suffice. |
| **Footer** | Provenance/attribution at the very end (source paths, references). | Not needed for short docs. |
| **Diagram card** | Any real diagram — flowchart, ER, sequence — via ```mermaid. | A CSS flow (see Flow lanes) is enough. |

## Native Markdown elements

**Cover header** — a YAML frontmatter block at the very top:
```yaml
---
title: My Guide
subtitle: One line under the title.
eyebrow: Engineering spec · 2026-09-10
author: Andrew Leach
status: Approved            # Approved/Done/Final/Ready → green chip
version: 1.0
reference: dashworthy/docsmith
chips: [Extra · one, Another]
---
```

**Eyebrow kicker** — on the line before a heading:
```md
<!-- eyebrow: The headline finding -->
## Overview
```

**Callouts** — GitHub admonitions:
```md
> [!NOTE] general information (accent role)
> [!TIP] a helpful suggestion (positive)
> [!IMPORTANT] don't miss this (accent)
> [!WARNING] proceed carefully (warning)
> [!CAUTION] destructive / risky (negative)
```

**Badges** — inline pills:
```md
[[New]] [[accent:New]] [[positive:Stable]] [[warning:Beta]] [[negative:Deprecated]]
```

**Reference cards** — just write a 2-column table; the designed theme turns it into cards.
Force a plain table with `<!-- table -->` on the line before it:
```md
| Class | Responsibility |
|---|---|
| `Search\Finder` | Finds products. Applies the per-stage cap and pages the result. |
```

**Diagram card** — a mermaid fence, optionally titled:
```md
<!-- figure: Data Model | The aggregate and its relationships -->
​```mermaid
erDiagram
  A ||--o{ B : has
​```
```

## Copy-paste HTML elements

Paste these inline in your Markdown (blank line before/after). They inherit the theme tokens.

**Key boxes** (roles: `accent` / `positive` / `negative` / `warning`):
```html
<div class="keygrid">
  <div class="keybox negative"><div class="k">Gap 1 — no results</div>
    <div class="v">Tool output is absent end to end.</div></div>
  <div class="keybox negative"><div class="k">Gap 2 — no markdown</div>
    <div class="v">Prose renders as plain pre-wrapped text.</div></div>
</div>
```

**Legend**:
```html
<div class="legend">
  <span class="t"><span class="dot" style="background:var(--accent)"></span>accent</span>
  <span class="t"><span class="dot" style="background:var(--positive)"></span>positive</span>
  <span class="t"><span class="dot" style="background:var(--negative)"></span>negative</span>
  <span class="t"><span class="dot" style="background:var(--warning)"></span>warning</span>
</div>
```

**Comparison** (`is-a` = warning tint, `is-b` = positive tint):
```html
<div class="compare">
  <div class="compare__head"><span class="compare__num">01</span><h3>Questions</h3></div>
  <div class="compare__cols">
    <div class="compare__col is-a"><div class="compare__label"><span class="swatch"></span>Today</div>
      <ul><li>Vanishes after answering.</li><li>Answers flattened to a string.</li></ul></div>
    <div class="compare__col is-b"><div class="compare__label"><span class="swatch"></span>Target</div>
      <ul><li>Inline card with previews.</li><li>Structured, persisted answers.</li></ul></div>
  </div>
  <div class="compare__target"><b>Target</b>Inline card, previews, structured answers.</div>
</div>
```

**Panels** (side-by-side cards):
```html
<div class="panelgrid">
  <div class="panel"><h3>Data flow</h3><p>Parser → correlate → store → render.</p></div>
  <div class="panel"><h3>Library picks</h3><p>marked, mermaid, puppeteer-core.</p></div>
</div>
```

**Flow lanes** (`bad` / `good` lane and step modifiers):
```html
<div class="flow">
  <div class="lane bad"><span class="tag">today</span>
    <div class="steps"><span class="step">parser</span><span class="arr">→</span>
      <span class="step bad">drops results</span></div></div>
  <div class="lane good"><span class="tag">target</span>
    <div class="steps"><span class="step good">parser + result</span><span class="arr">→</span>
      <span class="step good">router</span></div></div>
</div>
```

**Phase cards** (add `parallel` to a phase for the green variant + badge):
```html
<div class="phases">
  <div class="phase"><div class="idx">0</div><div class="pbody"><h3>Foundations</h3>
    <p>Result capture end to end; unified row + router.</p></div></div>
  <div class="phase parallel"><div class="idx">7</div><div class="pbody">
    <h3>Discovery <span class="badge-par">parallelizable</span></h3>
    <p>Independent of the render work; can start immediately.</p></div></div>
</div>
```

**Custom lists** — numbered questions and struck non-goals:
```html
<ul class="qlist"><li>DB migration vs rebuild for the new column?</li>
  <li>Truncation policy for large output?</li></ul>

<ul class="xlist"><li><b>Other-agent support</b> — out of scope this run.</li>
  <li><b>Non-chat panes</b> — not part of this work.</li></ul>
```

**Footer** (provenance):
```html
<div class="docfooter">
  Generated from the approved spec.<br>
  spec · .engineering/2026-09-09-run/spec.md<br>
  reference · github.com/dashworthy/docsmith
</div>
```
