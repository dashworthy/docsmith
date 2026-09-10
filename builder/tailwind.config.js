/**
 * Native Tailwind — no customization by design.
 *
 * Per the build's Global Constraints: `theme` and `plugins` stay empty; exact artifact
 * colors are carried by CSS variables read through native arbitrary utilities
 * (e.g. `bg-[var(--surface)]`), NOT through a customized color palette. `darkMode` is
 * left at its default because theming is baked at generation time via
 * `<html data-theme>`, not the `dark:` variant. The only entry here is the mandatory
 * `content` glob so the CLI can scan the components for the utilities they use.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {},
  plugins: [],
};
