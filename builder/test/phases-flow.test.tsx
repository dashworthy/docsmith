import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Phases } from '../src/components/Phases.js';
import { Flow } from '../src/components/Flow.js';

describe('Phases', () => {
  const html = renderToStaticMarkup(
    <Phases
      items={[
        { idx: '0', title: 'Foundations', body: 'Result capture end to end.' },
        { idx: '7', title: 'Discovery', body: 'Independent of the render work.', parallel: true },
      ]}
    />,
  );
  it('renders each index, title and body', () => {
    expect(html).toContain('Foundations');
    expect(html).toContain('Result capture end to end.');
    expect(html).toContain('Discovery');
    expect(html).toContain('7');
  });
  it('tiles a normal phase accent and a parallel phase positive', () => {
    expect(html).toContain('bg-[var(--accent-soft)]');
    expect(html).toContain('text-[var(--accent)]');
    expect(html).toContain('bg-[var(--positive-soft)]');
    expect(html).toContain('text-[var(--positive)]');
  });
});

describe('Flow', () => {
  const html = renderToStaticMarkup(
    <Flow
      lanes={[
        { tag: 'today', tone: 'bad', steps: [{ text: 'parser' }, { text: 'drops', tone: 'bad' }] },
        { tag: 'target', tone: 'good', steps: [{ text: 'parser' }, { text: 'router' }] },
      ]}
    />,
  );
  it('renders lane tags and steps', () => {
    expect(html).toContain('today');
    expect(html).toContain('target');
    expect(html).toContain('parser');
    expect(html).toContain('router');
  });
  it('tints a bad lane negative and a good lane positive, steps in mono', () => {
    expect(html).toContain('text-[var(--negative)]');
    expect(html).toContain('text-[var(--positive)]');
    expect(html).toContain('font-[var(--font-mono)]');
  });
});
