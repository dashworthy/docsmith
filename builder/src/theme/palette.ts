// The vanilla ShadCN token palette — the single source of truth for color in the PDF component set.
// The canonical ShadCN default theme (slate base), transcribed from its `globals.css`
// `:root`/`.dark` custom properties and resolved from HSL to hex (react-pdf parses hex reliably; it
// has no CSS variables). Components reach these through the `tw()` styling boundary (see
// `pdf/theme.ts`), never directly. Kept deliberately vanilla: retuning toward a custom look happens
// here and nowhere else.

/** A ShadCN semantic design token — the shared key set of both themes. */
export type ShadcnToken =
  | 'background' | 'foreground'
  | 'card' | 'card-foreground'
  | 'popover' | 'popover-foreground'
  | 'primary' | 'primary-foreground'
  | 'secondary' | 'secondary-foreground'
  | 'muted' | 'muted-foreground'
  | 'accent' | 'accent-foreground'
  | 'destructive' | 'destructive-foreground'
  | 'border' | 'input' | 'ring';

export const SHADCN: { light: Record<ShadcnToken, string>; dark: Record<ShadcnToken, string> } = {
  light: {
    background: '#ffffff',
    foreground: '#020817',
    card: '#ffffff',
    'card-foreground': '#020817',
    popover: '#ffffff',
    'popover-foreground': '#020817',
    primary: '#0f172a',
    'primary-foreground': '#f8fafc',
    secondary: '#f1f5f9',
    'secondary-foreground': '#0f172a',
    muted: '#f1f5f9',
    'muted-foreground': '#64748b',
    accent: '#f1f5f9',
    'accent-foreground': '#0f172a',
    destructive: '#ef4444',
    'destructive-foreground': '#f8fafc',
    border: '#e2e8f0',
    input: '#e2e8f0',
    ring: '#020817',
  },
  dark: {
    background: '#020817',
    foreground: '#f8fafc',
    card: '#020817',
    'card-foreground': '#f8fafc',
    popover: '#020817',
    'popover-foreground': '#f8fafc',
    primary: '#f8fafc',
    'primary-foreground': '#0f172a',
    secondary: '#1e293b',
    'secondary-foreground': '#f8fafc',
    muted: '#1e293b',
    'muted-foreground': '#94a3b8',
    accent: '#1e293b',
    'accent-foreground': '#f8fafc',
    destructive: '#7f1d1d',
    'destructive-foreground': '#f8fafc',
    border: '#1e293b',
    input: '#1e293b',
    ring: '#cbd5e1',
  },
} as const;
