import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { QList } from '../src/components/QList.js';
import { NonGoals } from '../src/components/NonGoals.js';

describe('QList', () => {
  const html = renderToStaticMarkup(
    <QList items={['DB migration vs rebuild?', 'Truncation policy for large output?']} />,
  );
  it('renders each question', () => {
    expect(html).toContain('DB migration vs rebuild?');
    expect(html).toContain('Truncation policy for large output?');
  });
  it('numbers items Q1, Q2 with an accent marker', () => {
    expect(html).toContain('Q1');
    expect(html).toContain('Q2');
    expect(html).toContain('text-[var(--accent)]');
  });
});

describe('NonGoals', () => {
  const html = renderToStaticMarkup(
    <NonGoals items={['Other-agent support', 'Non-chat panes']} />,
  );
  it('renders each item', () => {
    expect(html).toContain('Other-agent support');
    expect(html).toContain('Non-chat panes');
  });
  it('marks items with a struck × in the negative role', () => {
    expect(html).toContain('text-[var(--negative)]');
    expect(html).toContain('line-through');
  });
});
