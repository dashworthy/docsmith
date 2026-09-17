import { describe, expect, it } from 'vitest';
import { highlightCode } from '../src/pdf/highlightCode.js';

// A snippet is genuinely highlighted (not falling back to plain text) when its tokens carry
// more than one distinct color — a keyword, a string and a comment tint differently. An
// unknown language falls back to 'text', whose every token is the theme foreground: exactly
// one color. So "distinct colors > 1" is the behavioral signal that a grammar was loaded.
async function distinctColorCount(code: string, lang: string): Promise<number> {
  const { lines } = await highlightCode(code, lang, 'light');
  return new Set(lines.flat().map((tok) => tok.color)).size;
}

const SNIPPETS: Record<string, string> = {
  // Bare PHP (no <?php tag) — the shape real code samples take in a doc.
  php: "$this->logger->warning('already exists'); // note\nreturn self::ACK;",
  yaml: "service.name:\n  class: App\\Thing\n  arguments: ['@dep'] # wired",
};

describe('highlightCode language coverage', () => {
  it('control: an unknown language falls back to plain text (a single color)', async () => {
    expect(await distinctColorCount(SNIPPETS.php, 'not-a-real-language')).toBe(1);
  });

  for (const [lang, code] of Object.entries(SNIPPETS)) {
    it(`highlights ${lang} rather than falling back to plain text`, async () => {
      expect(await distinctColorCount(code, lang)).toBeGreaterThan(1);
    });
  }
});
