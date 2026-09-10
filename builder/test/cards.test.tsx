import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CompareCard } from '../src/components/CompareCard.js';
import { SourceCard } from '../src/components/SourceCard.js';

describe('CompareCard', () => {
  const html = renderToStaticMarkup(
    <CompareCard
      num="01"
      title="Questions & permissions"
      a={{ label: 'Today', role: 'negative', items: ['Vanishes after answering.'] }}
      b={{ label: 'Target', role: 'positive', items: ['Inline card with previews.'] }}
      target="Structured, persisted answers."
    />,
  );
  it('renders the number, title, column labels and items', () => {
    expect(html).toContain('01');
    expect(html).toContain('Questions &amp; permissions');
    expect(html).toContain('Today');
    expect(html).toContain('Target');
    expect(html).toContain('Vanishes after answering.');
    expect(html).toContain('Inline card with previews.');
  });
  it('uses a neutral surface-2 header band with a muted number', () => {
    expect(html).toContain('bg-[var(--surface2)]');
    expect(html).toContain('text-[var(--ink3)]');
  });
  it('colors each column label by role and gives it a swatch', () => {
    expect(html).toContain('text-[var(--negative)]');
    expect(html).toContain('text-[var(--positive)]');
    expect(html).toContain('background:var(--negative)');
    expect(html).toContain('background:var(--positive)');
  });
  it('puts the target in an accent-soft footer', () => {
    expect(html).toContain('bg-[var(--accent-soft)]');
    expect(html).toContain('Structured, persisted answers.');
  });
});

describe('SourceCard', () => {
  const html = renderToStaticMarkup(
    <SourceCard title="Docsmith\Render\MarkdownDocumentRenderer">the only class that drives Chrome</SourceCard>,
  );
  it('renders a mono accent title in a surface-2 header band', () => {
    expect(html).toContain('bg-[var(--surface2)]');
    expect(html).toContain('text-[var(--accent)]');
    expect(html).toContain('font-[var(--font-mono)]');
    expect(html).toContain('MarkdownDocumentRenderer');
  });
  it('renders the body', () => {
    expect(html).toContain('the only class that drives Chrome');
  });
});
