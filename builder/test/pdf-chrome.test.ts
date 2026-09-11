import { describe, it, expect, afterEach } from 'vitest';
import { fileURLToPath } from 'node:url';
import { findChrome } from '../src/pdf/chrome.js';

describe('findChrome (pdf path)', () => {
  const saved = process.env.PUPPETEER_EXECUTABLE_PATH;
  afterEach(() => {
    if (saved === undefined) delete process.env.PUPPETEER_EXECUTABLE_PATH;
    else process.env.PUPPETEER_EXECUTABLE_PATH = saved;
  });

  it('returns an explicit executable override when it exists on disk', () => {
    const real = fileURLToPath(import.meta.url); // this test file is guaranteed to exist
    process.env.PUPPETEER_EXECUTABLE_PATH = real;
    expect(findChrome()).toBe(real);
  });

  it('returns a string or null', () => {
    process.env.PUPPETEER_EXECUTABLE_PATH = '/nonexistent/chrome-binary-xyz';
    const result = findChrome();
    expect(result === null || typeof result === 'string').toBe(true);
  });
});
