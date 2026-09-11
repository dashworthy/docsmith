import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Callout } from '../src/components/Callout.js';
import { Badge } from '../src/components/Badge.js';

describe('Callout', () => {
  it('renders title and body', () => {
    const html = renderToStaticMarkup(
      <Callout role="tip" title="Heads up">
        body text
      </Callout>,
    );
    expect(html).toContain('Heads up');
    expect(html).toContain('body text');
  });

  it('maps each role to its role-tint tokens', () => {
    const tip = renderToStaticMarkup(<Callout role="tip">x</Callout>);
    expect(tip).toContain('text-[var(--positive)]');
    expect(tip).toContain('bg-[var(--positive-soft)]');

    const caution = renderToStaticMarkup(<Callout role="caution">x</Callout>);
    expect(caution).toContain('text-[var(--negative)]');
    expect(caution).toContain('bg-[var(--negative-soft)]');

    const warning = renderToStaticMarkup(<Callout role="warning">x</Callout>);
    expect(warning).toContain('text-[var(--warning)]');

    const note = renderToStaticMarkup(<Callout role="note">x</Callout>);
    expect(note).toContain('text-[var(--accent)]');

    const important = renderToStaticMarkup(<Callout role="important">x</Callout>);
    expect(important).toContain('text-[var(--accent)]');
  });
});

describe('Badge', () => {
  it('renders its label', () => {
    expect(renderToStaticMarkup(<Badge>New</Badge>)).toContain('New');
  });

  it('maps each role to its color token', () => {
    expect(renderToStaticMarkup(<Badge role="warning">Beta</Badge>)).toContain('text-[var(--warning)]');
    expect(renderToStaticMarkup(<Badge role="positive">Stable</Badge>)).toContain('text-[var(--positive)]');
    expect(renderToStaticMarkup(<Badge role="negative">Old</Badge>)).toContain('text-[var(--negative)]');
    expect(renderToStaticMarkup(<Badge role="accent">Accent</Badge>)).toContain('text-[var(--accent)]');
    // neutral is the default
    expect(renderToStaticMarkup(<Badge>Plain</Badge>)).toContain('text-[var(--ink2)]');
  });
});
