---
spec: 2026-09-14-update-skill-builder
shipped: true
diff: main..babf5dd (PRs #47–#51)
---
# Retro — update-skill-builder

## §1 Problem — held
Matched what shipped: the plugin's one skill drove the retired Markdown→HTML→PDF pipeline; it now
ships `docsmith:builder`, which owns the React builder.

## §3 Success Criteria — held
All checkable criteria met: `docsmith:builder` exists, legacy skill gone, builder tests+typecheck
green from `skills/builder/` (66/66), a doc renders both themes into `.docsmith/<run>/` (verified
visually), grep clean of the old skill name and old path. One refinement surfaced during build: the
"grep clean" check must exclude the frozen `docs/specs/` spec, which describes the removed skill as
history — a scoping the criterion didn't originally state.

## §4 Constraints — held
Skill name, placement (package at skill root), input model, run-dir shape, and location-independence
all held as written.

## §6 Approach — drifted
The approach (delete legacy, move package, author-JSX workflow, fix refs) held. The **shaped
boundary's resolution mechanism** diverged: the interface note and plan committed to a
`.docsmith/node_modules/@docsmith/builder` **symlink**; in build it was replaced by **staging a temp
copy of the doc under `src/docs/`** and resolving the bare import by package **self-reference**. The
*interface* (bare `@docsmith/builder`, `render <run-dir>`, both themes into the run dir) and the
load-bearing property (authored file never learns the package path) held exactly; only the hidden
mechanism changed.

## §8 Open questions — underspecified (bit us)
§8 framed the resolution mechanism as "symlink / NODE_PATH / resolve hook — the plan picks one." The
real answer was **none of the three**: the failure was not specifier resolution at all but tsx
applying the classic JSX transform + mis-resolving react-pdf's transitive subpath exports to any doc
**outside the tsconfig `include`**. The three guessed options all shared the wrong mental model.

## Process friction & cost
- Committed to a symlink mechanism in design that turned out to solve the wrong problem; discovering
  the real cause (tsx `include`-gated transform/resolution for out-of-tree docs) took an empirical
  isolation loop in build (symlink vs absolute import vs in-package copy). Suspected fix: when a
  boundary's viability rests on a runtime resolution assumption, **probe it with a throwaway render
  before the spec gate** rather than reasoning about it. [phase: using-codebase-design / brainstorming]

## Rework & churn
- One mid-build mechanism reversal (symlink → stage-in-src) after empirical failure; the interface
  was unchanged, so spec/plan didn't need re-approval, only the as-built notes were updated.
- One per-task review round on Task 2 surfaced three findings (stale symlink comment, untested
  cleanup path, `--theme` validator duplication) — all fixed in the task's own diff.

## Scope fidelity
- §5 In/Out held; both §5 Deferred items (salvage the old decision matrix; a `docsmith new`
  scaffolder) stayed deferred. One adjacent-accuracy fix was pulled in beyond the original scope: a
  stale `Callout` component reference (there is no `Callout`; `KeyBox` is the admonition) in the
  package README and feature doc — a real defect discovered while writing the skill docs, fixed
  rather than left (refusing-deferral). Small and justified.

## Gate correction load
- Spec gate: 1 round, approved with no changes. Plan gate: approved first pass + isolation choice.
- Most correction landed **pre-gate**, in the design dialogue: the user added the `.docsmith/<run>`
  requirement mid-brainstorm and reshaped the skill↔builder relationship ("move it in", not
  "reference"), and paused once to clarify before the right-size choice. The entrances absorbed it;
  the gates themselves were clean.

## Assumption & open-question outcomes
- Resolution-mechanism assumption (symlink): **wrong** — see §8. Cost an isolation loop in build,
  but caught before ship and left the interface intact.
- References-depth open question: started lean (SKILL + two references), adequate; not revisited.
