// The shared marker-replacement seam every pre-render pass uses. A pass declares a global marker
// regex and an async renderer; this finds each marker and swaps in the rendered content. Factored
// out so the two non-obvious guarantees live in one place and can't drift between passes.

/**
 * Replace every match of `regex` in `bodyHtml` with content computed by `render`. Returns the body
 * unchanged when nothing matches (so a pass can skip expensive setup — loading Shiki, launching
 * Chrome — when there is nothing to do). `render` receives the whole match array (capture groups
 * included) and returns the replacement HTML.
 *
 * Two subtleties it owns: the replacement is applied through a *function* replacer, so a
 * `$`-sequence in the rendered HTML (e.g. `${}` in highlighted code) is inserted literally rather
 * than treated as a `String.replace` pattern; and matches are materialized up front, so replacing
 * one match never disturbs the scan of the others.
 *
 * `regex` must carry the global flag, or `matchAll` throws.
 */
export async function replaceMarkers(
  bodyHtml: string,
  regex: RegExp,
  render: (match: RegExpMatchArray) => Promise<string>,
): Promise<string> {
  const matches = [...bodyHtml.matchAll(regex)];
  if (matches.length === 0) return bodyHtml;

  let out = bodyHtml;
  for (const match of matches) {
    const replacement = await render(match);
    out = out.replace(match[0], () => replacement);
  }
  return out;
}
