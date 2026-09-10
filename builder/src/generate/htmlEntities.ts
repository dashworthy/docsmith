/**
 * Reverse the HTML escaping `renderToStaticMarkup` applies to the text content it renders. The
 * pre-render passes store their source (code, mermaid charts) as escaped text inside a marker
 * `<div>`; this turns it back into the raw source before handing it to Shiki or mermaid. `&amp;`
 * is undone last so an already-escaped entity like `&amp;lt;` becomes `&lt;`, not `<`.
 */
export function unescapeHtml(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(?:39|x27);/g, "'")
    .replace(/&amp;/g, '&');
}
