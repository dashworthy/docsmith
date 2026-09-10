// Chrome/Chromium discovery for the PDF pipeline. Tries, in order: the two puppeteer/Chrome env
// overrides, the standard install paths on macOS/Linux/Windows (ported from md2pdf.mjs), and
// finally the Chromium puppeteer downloaded for itself. Returns the first that exists on disk, or
// null when none is found — the caller decides what a null means (the PDF branch fails loudly).

import { existsSync } from 'node:fs';
import puppeteer from 'puppeteer';

export function findChrome(): string | null {
  const candidates: (string | undefined)[] = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  ];

  const found = candidates.find((p): p is string => typeof p === 'string' && existsSync(p));
  if (found) return found;

  // Fall back to the browser puppeteer installed for itself, when it has been downloaded.
  try {
    const bundled = puppeteer.executablePath();
    if (bundled && existsSync(bundled)) return bundled;
  } catch {
    /* executablePath throws if no browser is configured — treat as "none found". */
  }
  return null;
}
