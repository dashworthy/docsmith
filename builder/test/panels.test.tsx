import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PanelGrid, Panel } from '../src/components/PanelGrid.js';
import { KeyBox } from '../src/components/KeyBox.js';

describe('PanelGrid / Panel', () => {
  const html = renderToStaticMarkup(
    <PanelGrid>
      <Panel title="Data flow">Parser → store → render.</Panel>
      <Panel title="Library picks">marked, mermaid, puppeteer.</Panel>
    </PanelGrid>,
  );
  it('renders panel titles and bodies', () => {
    expect(html).toContain('Data flow');
    expect(html).toContain('Parser → store → render.');
    expect(html).toContain('Library picks');
  });
  it('lays panels out in a surface card on the base border', () => {
    expect(html).toContain('grid');
    expect(html).toContain('bg-[var(--surface)]');
    expect(html).toContain('border-[var(--border)]');
  });
});

describe('KeyBox', () => {
  it('renders its key and value', () => {
    const html = renderToStaticMarkup(<KeyBox role="negative" k="Gap 1" v="no results" />);
    expect(html).toContain('Gap 1');
    expect(html).toContain('no results');
  });
  it('maps role to its tint', () => {
    const neg = renderToStaticMarkup(<KeyBox role="negative" k="k" v="v" />);
    expect(neg).toContain('text-[var(--negative)]');
    expect(neg).toContain('bg-[var(--negative-soft)]');

    const pos = renderToStaticMarkup(<KeyBox role="positive" k="k" v="v" />);
    expect(pos).toContain('text-[var(--positive)]');

    const acc = renderToStaticMarkup(<KeyBox role="accent" k="k" v="v" />);
    expect(acc).toContain('text-[var(--accent)]');

    const warn = renderToStaticMarkup(<KeyBox role="warning" k="k" v="v" />);
    expect(warn).toContain('text-[var(--warning)]');
  });
});
