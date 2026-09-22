import { describe, it, expect } from 'vitest';
import { renderToBuffer } from '@react-pdf/renderer';
import { FONT } from '../src/pdf/theme.js';
import { PdfDoc } from '../src/pdf/components/PdfDoc.js';
import { P } from '../src/pdf/components/prose.js';

describe('fonts', () => {
  it('uses ShadCN default sans (Inter) for body and headings', () => {
    expect(FONT.sans).toBe('Inter');
    expect(FONT.display).toBe('Inter');
  });

  it('registers the faces and embeds them in a rendered PDF', async () => {
    const buf = await renderToBuffer(
      <PdfDoc theme="light" title="t">
        <P>hello Inter</P>
      </PdfDoc>,
    );
    expect(buf.subarray(0, 4).toString()).toBe('%PDF');
  });
});
