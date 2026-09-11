// Chrome discovery moved to the PDF path (`src/pdf/chrome.ts`), which is the only subsystem that
// survives the PDF-only migration. This thin re-export keeps the HTML pipeline compiling until it
// is removed; it is deleted together with the rest of `src/generate/`.
export { findChrome } from '../pdf/chrome.js';
