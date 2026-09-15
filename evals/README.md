# Evals for `docsmith:builder`

A [`claude plugin eval`](https://code.claude.com/docs/en/plugin-evals) suite that checks the
`docsmith:builder` skill steers Claude correctly and produces a designed PDF. It complements the
66 vitest unit tests in `skills/builder/` (which test the *package*, never skill invocation).

Three fixture-driven cases, in two tiers:

| Case | Tag | Tier | What it checks |
|---|---|---|---|
| `make-designed-pdf` | `smoke` | free | The skill fires and authors a `pdf.tsx` importing `@docsmith/builder`, using `KeyBox` (not the non-existent `Callout`). |
| `mermaid-is-real-diagram` | `smoke` | free | A mermaid diagram is authored as a real diagram (`rasterizeMermaid`/`Mermaid`), not left as a code fence. |
| `render-end-to-end` | `render` | **paid** | Both PDFs render for real, and an LLM judge confirms a rasterized page shows a cover, sections, and a real diagram. |

## Run the free tier (steering + guardrail)

Deterministic graders only — no LLM judge, so no judge cost:

```bash
cd skills/builder && npm install   # one-time: builder deps (+ bundled Chromium for mermaid)
cd -                               # back to the plugin root
claude plugin eval . --tag smoke --allow-tools Write Bash
```

`Write` **and** `Bash` are granted so Claude runs the skill's real workflow (author → render) —
with only `Write`, Claude fires the skill but can't complete its setup/render steps and ends up
authoring nothing. The graders only check what Claude **authored** (the skill fired, the `pdf.tsx`
imports `@docsmith/builder`, uses `KeyBox` not `Callout`, wires mermaid through `Mermaid`), so
these cases pass on authoring alone and never invoke the paid LLM judge. Authoring happens before
the render step, so a case still passes even if the render can't finish (e.g. no browser for the
mermaid case).

## Run the paid tier (real render + page-quality judge)

```bash
cd skills/builder && npm install   # one-time: deps + puppeteer's bundled Chromium (for mermaid)
cd -                               # back to the plugin root
claude plugin eval . --case render-end-to-end --allow-tools Write Bash
```

This renders both themes and rasterizes a page for the LLM judge, so it **costs money** (agent
runs + one judge per run) and needs a browser + poppler. Add `--ablation none` to skip the
without-plugin baseline arm and roughly halve the cost while iterating.

## Prerequisites

- **Node ≥ 18** and the builder deps installed (`cd skills/builder && npm install`) — both tiers run
  the skill's render workflow.
- **A Chromium-family browser** — for any case whose doc has a mermaid diagram (auto-detected, or set
  `CHROME_PATH` / `PUPPETEER_EXECUTABLE_PATH`); puppeteer's bundled Chromium from `npm install`
  suffices. The authoring graders pass without it, but the render step won't finish.
- **poppler** (`brew install poppler`) — provides `pdftoppm`; needed **only for the paid tier**,
  which rasterizes the page the judge looks at.
- **`claude` authenticated** — every `claude plugin eval` run spawns real Claude runs.

## Notes

- **Every `claude plugin eval` run is billable** (it spawns real Claude agent runs; the render tier
  also bills the judge). `claude plugin validate` checks only the plugin/marketplace manifests — it
  does **not** validate eval cases — so there is no free offline check of the cases themselves;
  a `--runs 1 --ablation none` run is the cheapest smoke.
- Run output lands under `evals/results/` and is git-ignored.
- By default each case runs 3× with the plugin and 3× without, to measure the plugin's contribution
  (Δ). The free tier expects a strongly positive Δ (bare Claude does not author a `@docsmith/builder`
  document); the hard pass gate is the with-plugin arm meeting `--threshold`.
