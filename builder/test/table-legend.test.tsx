import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Table } from '../src/components/Table.js';
import { Legend } from '../src/components/Legend.js';

describe('Table', () => {
  const html = renderToStaticMarkup(
    <Table head={['Class', 'Role']} rows={[['A', 'first'], ['B', 'second']]} />,
  );
  it('renders head and body cells', () => {
    expect(html).toContain('Class');
    expect(html).toContain('Role');
    expect(html).toContain('A');
    expect(html).toContain('second');
  });
  it('styles the header band accent-soft with accent text', () => {
    expect(html).toContain('<thead');
    expect(html).toContain('bg-[var(--accent-soft)]');
    expect(html).toContain('text-[var(--accent)]');
  });
});

describe('Legend', () => {
  const html = renderToStaticMarkup(
    <Legend
      items={[
        { role: 'accent', label: 'accent' },
        { role: 'positive', label: 'positive' },
      ]}
    />,
  );
  it('renders each label', () => {
    expect(html).toContain('accent');
    expect(html).toContain('positive');
  });
  it('colors each dot via an inline cssVar background', () => {
    expect(html).toContain('background:var(--accent)');
    expect(html).toContain('background:var(--positive)');
  });
});
