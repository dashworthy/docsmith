---
title: docsmith UI Gallery
subtitle: Every designed-theme element in one document, for light/dark comparison.
eyebrow: Component gallery · 2026-09-10
author: Andrew Leach
status: Approved
version: 1.0
reference: dashworthy/docsmith
chips: [Theme · designed]
---

## Callouts & badges

<!-- eyebrow: Inline elements -->
Badges: [[New]] [[accent:Accent]] [[positive:Stable]] [[warning:Beta]] [[negative:Deprecated]].

> [!NOTE]
> A note in the accent role.

> [!TIP]
> A tip in the positive role.

> [!WARNING]
> A warning in the amber role.

> [!CAUTION]
> A caution in the negative role.

## Key boxes & legend

<div class="keygrid">
  <div class="keybox negative"><div class="k">Gap 1 — no results</div><div class="v">Tool output is absent end to end.</div></div>
  <div class="keybox negative"><div class="k">Gap 2 — no markdown</div><div class="v">Prose renders as plain text.</div></div>
</div>

<div class="legend">
  <span class="t"><span class="dot" style="background:var(--accent)"></span>accent</span>
  <span class="t"><span class="dot" style="background:var(--positive)"></span>positive</span>
  <span class="t"><span class="dot" style="background:var(--negative)"></span>negative</span>
  <span class="t"><span class="dot" style="background:var(--warning)"></span>warning</span>
</div>

<!-- eyebrow: Category by category -->
## Reference cards
<!-- deck: A two-column table becomes a grid of cards — neutral header band, accent title, and clean namespace wrapping, styled like the artifact's cards. -->

| Class | Responsibility |
|---|---|
| `Docsmith\Render\MarkdownDocumentRenderer` | The only class allowed to drive the headless browser. Parses the Markdown, runs mermaid, prints the PDF. |
| `Docsmith\Theme\DesignedThemeStylesheetProviderInterface` | A deliberately long name to prove the header wraps cleanly at the namespace separator instead of running off the card edge. |
| `Docsmith\Diagram\DiagramCardBuilder` | Turns a mermaid fence plus its figure/caption directives into a titled card. |

## Comparison

<div class="compare">
  <div class="compare__head"><span class="compare__num">01</span><h3>Questions &amp; permissions</h3></div>
  <div class="compare__cols">
    <div class="compare__col is-a"><div class="compare__label"><span class="swatch"></span>Today</div>
      <ul><li>Vanishes after answering.</li><li>Answers flattened to a string.</li></ul></div>
    <div class="compare__col is-b"><div class="compare__label"><span class="swatch"></span>Target</div>
      <ul><li>Inline card with previews.</li><li>Structured, persisted answers.</li></ul></div>
  </div>
  <div class="compare__target"><b>Target</b>Inline card, previews, structured answers, full scopes.</div>
</div>

## Panels & flow

<div class="panelgrid">
  <div class="panel"><h3>Data flow</h3><p>Parser → correlate by id → store → render.</p></div>
  <div class="panel"><h3>Library picks</h3><p>marked, mermaid, puppeteer-core.</p></div>
</div>

<div class="flow">
  <div class="lane bad"><span class="tag">today</span>
    <div class="steps"><span class="step">parser</span><span class="arr">→</span><span class="step bad">drops results</span><span class="arr">→</span><span class="step bad">raw JSON</span></div></div>
  <div class="lane good"><span class="tag">target</span>
    <div class="steps"><span class="step good">parser + result</span><span class="arr">→</span><span class="step good">router</span><span class="arr">→</span><span class="step good">presenter</span></div></div>
</div>

## Phases

<div class="phases">
  <div class="phase"><div class="idx">0</div><div class="pbody"><h3>Foundations</h3><p>Result capture end to end; unified row + router.</p></div></div>
  <div class="phase"><div class="idx">1</div><div class="pbody"><h3>Tool-row system</h3><p>Pure presenter, collapsed rows, result view.</p></div></div>
  <div class="phase parallel"><div class="idx">7</div><div class="pbody"><h3>Discovery <span class="badge-par">parallelizable</span></h3><p>Independent of the render work; can start immediately.</p></div></div>
</div>

## Diagram

<!-- figure: Render Pipeline | Markdown becomes a styled page, then Chrome prints it. -->
```mermaid
flowchart LR
  MD[Markdown] --> HTML[Designed HTML] --> Chrome[Headless Chrome] --> PDF[(PDF)]
```

## Open questions & non-goals

<ul class="qlist"><li>DB migration vs rebuild for the new column?</li><li>Truncation policy for large output?</li></ul>

<ul class="xlist"><li><b>Other-agent support</b> — out of scope this run.</li><li><b>Non-chat panes</b> — not part of this work.</li></ul>

<div class="docfooter">
  Generated from the approved spec.<br>
  spec · .engineering/2026-09-09-run/spec.md<br>
  reference · github.com/dashworthy/docsmith
</div>
