# STE writing rules for feature docs

Feature-doc prose follows **ASD-STE100 Simplified Technical English**. This file gives the rules
you apply, in our words. It is not the standard. The approved-word dictionary is copyright ASD and
is not in this repo, so the word rules below are the parts you can apply without it.

Contents: [Scope](#scope) · [Words](#words) · [Sentences](#sentences) ·
[Paragraphs and callouts](#paragraphs-and-callouts) · [Plainer replacements](#plainer-replacements) ·
[Check with the lint](#check-with-the-lint)

## Scope

**STE applies to:** all prose. This is the cover subtitle, overview, decks, captions, `<P>`, panel
and callout text, stage bodies, table cells, and list items.

**Exempt:** code and payload samples, inline code, identifiers, file paths, mermaid source,
template headings, and labels (`title`, `eyebrow`, `label` props). Put an identifier in backticks
(Markdown) or keep it in a code sample. Do not reword it.

## Words

- **One word, one meaning.** Use "start" every time, not "start", "launch", and "kick off" for the
  same action. Do not use one word for two meanings.
- **One name per thing.** When you name a component, a field, or a state, use that exact name
  every time. Do not use a synonym for variety.
- **Technical names are allowed.** Class names, product names, and domain terms that the code uses
  are technical names. Keep them as they are.
- **Simple verb tenses.** Use the simple present ("the worker sends"), simple past ("the job
  failed"), and future ("the queue will hold"). Do not use "-ing" verb forms ("is sending"). An
  "-ing" word is acceptable only as a technical name ("load balancing").
- **No phrasal verbs** when one verb does the job: "start", not "set up"; "find", not "look up".
- **Max 3 nouns in a row.** Break "invoice retry queue timeout value" into "the timeout value of
  the invoice retry queue".
- **Keep articles** ("the", "a") and short words such as "of" and "to". Do not write in telegraph
  style.

## Sentences

- **Max 20 words in an instruction** (a sentence that tells the reader to do something).
  **Max 25 words in a description.** Hyphenated words and numbers count as one word each.
- **One instruction per sentence.** "Run the migration. Then restart the worker." Not "Run the
  migration and restart the worker."
- **Use the imperative for instructions:** "Run `npm test`", not "You should run `npm test`".
- **Active voice.** Name who or what does the action: "The scheduler retries the job", not "The
  job is retried". Use the passive only when the actor is unknown or does not matter.
- **Put a condition first:** "If the token expires, the client gets a 401."

## Paragraphs and callouts

- **One topic per paragraph. Max 6 sentences.** Start with the sentence that states the topic.
- **Callouts (warnings, edge cases):** give the instruction or the effect first, then the reason.
  "Do not delete the cache key while a sync runs. The sync then writes partial data."
- **Lists for steps.** Write steps as numbered items, one action each.

## Plainer replacements

These are plainer choices. They are not checked against the STE dictionary.

| Instead of | Write |
|---|---|
| utilize, leverage | use |
| in order to | to |
| prior to | before |
| subsequent to | after |
| in the event that | if |
| is able to | can |
| a number of | some, or the number |
| ensure | make sure |
| facilitate | help, or name the action |
| via | through, or by |

## Check with the lint

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/feature-doc/scripts/ste-lint.mjs" <filled-doc.md | pdf.tsx>
```

- **Errors** (sentence length, paragraph length) fail the run. Fix each one.
- **Warnings** (passive voice, "-ing" forms) are pattern matches. Read each one. Change the text,
  or keep it when the word is a technical name or the passive is correct.
- The lint guesses that a sentence is an instruction from its first verb. It cannot check word
  meanings, phrasal verbs, or noun clusters. Read for those yourself.
- A `.tsx` file needs TypeScript. Run `npm install` once in `skills/docsmith` (the render step needs
  it too).
