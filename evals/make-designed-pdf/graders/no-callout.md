---
type: tool_used
tool: Write
input_match: 'Callout'
min: 0
max: 0
---
Claude never wrote a `Callout` — there is no such component (KeyBox is the admonition). Scoped to
Write input: the skill's own references mention "Callout" to say it does not exist, so a trace-based
not_contains check would false-negative the moment Claude reads them. Written content is the honest
signal that Claude did not reach for the non-existent component.
