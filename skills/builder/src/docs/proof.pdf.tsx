import { PdfDoc } from '../pdf/components/PdfDoc.js';
import { Cover } from '../pdf/components/Cover.js';
import { Section } from '../pdf/components/Section.js';
import { P, B } from '../pdf/components/prose.js';
import type { PdfTheme } from '../pdf/theme.js';

export default (theme: PdfTheme) => (
  <PdfDoc theme={theme} title="react-pdf proof">
    <Cover
      eyebrow="Wastequip · OroCommerce bundle"
      title="Product Configurator"
      lede="A storefront guided product builder: customers answer a series of questions that narrow the catalog until the right product surfaces."
      chips={['Backbone.js storefront', 'Website Search', 'Org-scoped', 'Conditional logic']}
    />
    <Section
      eyebrow="Lay person's guide"
      title="A digital sales assistant"
      deck="Instead of browsing a giant catalog, the customer is guided through a conversation."
    >
      <P>
        This paragraph checks font weights, wrapping, and the paged model: <B>bold ink</B> against
        regular body copy, wrapping naturally within the page content width, with the ground color
        reaching every paper edge and a uniform inset on every page.
      </P>
    </Section>
  </PdfDoc>
);
