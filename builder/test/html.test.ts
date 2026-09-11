import { describe, it, expect } from 'vitest';
import { assembleHtml } from '../src/generate/html.js';

describe('assembleHtml', () => {
  const out = assembleHtml({
    bodyHtml: '<main>hi</main>',
    theme: 'dark',
    tailwindCss: '/*x*/',
    title: 'T',
  });

  it('stamps the chosen theme on <html>', () => {
    expect(out).toContain('data-theme="dark"');
  });
  it('links the Google Fonts stylesheet', () => {
    expect(out).toContain('fonts.googleapis.com');
  });
  it('inlines the theme style block', () => {
    expect(out).toContain('--surface:');
  });
  it('inlines the Tailwind CSS', () => {
    expect(out).toContain('<style>/*x*/</style>');
  });
  it('embeds the body markup and title', () => {
    expect(out).toContain('<main>hi</main>');
    expect(out).toContain('<title>T</title>');
  });
  it('is a full document that runs no JS', () => {
    expect(out.startsWith('<!doctype html>')).toBe(true);
    expect(out).not.toContain('<script');
  });
});
