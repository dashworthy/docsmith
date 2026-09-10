import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Doc } from '../src/components/Doc.js';
import { Cover } from '../src/components/Cover.js';
import { Section } from '../src/components/Section.js';
import { Footer } from '../src/components/Footer.js';

describe('Doc', () => {
  const html = renderToStaticMarkup(<Doc>{'body'}</Doc>);
  it('is a <main> carrying base ground/ink/sans tokens', () => {
    expect(html).toContain('<main');
    expect(html).toContain('bg-[var(--ground)]');
    expect(html).toContain('text-[var(--ink)]');
    expect(html).toContain('font-[var(--font-sans)]');
    expect(html).toContain('body');
  });
});

describe('Cover', () => {
  const html = renderToStaticMarkup(
    <Cover eyebrow="E" title="T" lede="L" chips={['a', 'b']} />,
  );
  it('renders eyebrow, title, lede and chips', () => {
    expect(html).toContain('E');
    expect(html).toContain('T');
    expect(html).toContain('L');
    expect(html).toContain('a');
    expect(html).toContain('b');
  });
  it('styles the eyebrow muted-mono and title in the display face', () => {
    expect(html).toContain('text-[var(--ink3)]');
    expect(html).toContain('font-[var(--font-display)]');
  });
});

describe('Section', () => {
  const html = renderToStaticMarkup(
    <Section eyebrow="Cat" title="Title" deck="the deck">
      <p>kids</p>
    </Section>,
  );
  it('renders eyebrow, title, deck and children', () => {
    expect(html).toContain('Cat');
    expect(html).toContain('Title');
    expect(html).toContain('the deck');
    expect(html).toContain('kids');
  });
  it('uses the accent eyebrow and muted deck tokens', () => {
    expect(html).toContain('text-[var(--accent)]');
    expect(html).toContain('text-[var(--ink2)]');
  });
});

describe('Footer', () => {
  const html = renderToStaticMarkup(<Footer lines={['gen from spec', 'ref x']} />);
  it('renders provenance lines in muted mono', () => {
    expect(html).toContain('gen from spec');
    expect(html).toContain('ref x');
    expect(html).toContain('text-[var(--ink3)]');
    expect(html).toContain('font-[var(--font-mono)]');
  });
});
