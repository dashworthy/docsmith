import { describe, it, expect } from 'vitest';
import { t, cx, cssVar, themeStyleBlock } from '../src/theme/tokens.js';

describe('token className fragments', () => {
  it('maps background tokens to CSS-var arbitrary utilities', () => {
    expect(t.bg.surface).toBe('bg-[var(--surface)]');
    expect(t.bg.ground).toBe('bg-[var(--ground)]');
    expect(t.bg.accentSoft).toBe('bg-[var(--accent-soft)]');
  });

  it('maps text tokens', () => {
    expect(t.text.accent).toBe('text-[var(--accent)]');
    expect(t.text.ink).toBe('text-[var(--ink)]');
    expect(t.text.ink3).toBe('text-[var(--ink3)]');
  });

  it('maps border tokens', () => {
    expect(t.border.base).toBe('border-[var(--border)]');
    expect(t.border.accent).toBe('border-[var(--accent)]');
  });

  it('maps font tokens', () => {
    expect(t.font.sans).toBe('font-[var(--font-sans)]');
    expect(t.font.mono).toBe('font-[var(--font-mono)]');
    expect(t.font.display).toBe('font-[var(--font-display)]');
  });
});

describe('cx', () => {
  it('joins truthy parts space-separated, dropping falsy', () => {
    expect(cx('a', false, 'b', null, undefined)).toBe('a b');
  });
});

describe('cssVar', () => {
  it('wraps a token name in var()', () => {
    expect(cssVar('accent')).toBe('var(--accent)');
    expect(cssVar('positive')).toBe('var(--positive)');
  });
});

describe('themeStyleBlock', () => {
  const block = themeStyleBlock();
  it('defines the light palette on :root', () => {
    expect(block).toContain(':root{');
    expect(block).toContain('--surface:#ffffff');
    expect(block).toContain('--accent:#4b52d4');
  });
  it('overrides under [data-theme=dark]', () => {
    expect(block).toContain('[data-theme=dark]');
    expect(block).toContain('--surface:#141922');
    expect(block).toContain('--accent:#838af6');
  });
  it('wires the body font var', () => {
    expect(block).toContain('--font-sans:');
  });
});
