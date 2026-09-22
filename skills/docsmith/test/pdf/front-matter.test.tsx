import { describe, it, expect } from 'vitest';
import TestRenderer from 'react-test-renderer';
import { Page, Text } from '@react-pdf/renderer';
import { PdfDoc } from '../../src/pdf/components/PdfDoc.js';

// frontMatter renders as its own inset <Page> between the cover and the body — the seam the
// feature-doc template's ToC relies on. Regression guard: a doc that passes frontMatter must get a
// dedicated page for it, and one that omits it must not.

function pagesOf(node: Parameters<typeof TestRenderer.create>[0]) {
  return TestRenderer.create(node).root.findAllByType(Page);
}

function textIn(page: ReturnType<typeof pagesOf>[number]): string {
  return page
    .findAllByType(Text)
    .flatMap((t) => t.children)
    .filter((c): c is string => typeof c === 'string')
    .join(' ');
}

describe('PdfDoc frontMatter', () => {
  it('renders a dedicated page for frontMatter, ordered cover → frontMatter → body', () => {
    const pages = pagesOf(
      <PdfDoc
        theme="light"
        title="t"
        cover={<Text>THE-COVER</Text>}
        frontMatter={<Text>THE-FRONTMATTER</Text>}
      >
        <Text>THE-BODY</Text>
      </PdfDoc>,
    );
    expect(pages).toHaveLength(3);
    expect(textIn(pages[0])).toContain('THE-COVER');
    expect(textIn(pages[1])).toContain('THE-FRONTMATTER');
    expect(textIn(pages[2])).toContain('THE-BODY');
  });

  it('omits the frontMatter page when no frontMatter is passed', () => {
    const pages = pagesOf(
      <PdfDoc theme="light" title="t" cover={<Text>C</Text>}>
        <Text>B</Text>
      </PdfDoc>,
    );
    expect(pages).toHaveLength(2); // cover + body only
  });
});
