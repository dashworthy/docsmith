---
type: tool_used
tool: Skill
input_match: '"skill"\s*:\s*"(?:docsmith:)?builder"'
---
The request steered Claude into the docsmith:builder skill (matches the Skill tool input, with or
without the `docsmith:` plugin prefix). This grader measures the plugin's core contribution and, in
the two-arm run, is excluded from the score — the without-plugin arm can't fire it.
