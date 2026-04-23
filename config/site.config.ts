/**
 * Site-wide branding — consumed by marketing components that would
 * otherwise hardcode the product name or edition. Replace these values
 * to rebrand the starter without touching component JSX.
 */
export const siteConfig = {
  /** Brand name used in footers, legal meta, CTA signatures. */
  name: "Tenviq",

  /** Lowercase token used by the default logo mark. */
  wordmark: "tenviq",

  /** Placeholder URL shown inside the Hero browser chrome mockup. */
  appDomain: "app.yourdomain.com",

  /** Small edition label shown in the marketing footer. */
  footerEdition: "Edition · 2026",

  /** Edition token appended after the brand name in the final-CTA signature. */
  ctaEdition: "Edition 2026",

  /** Right-aligned signature in the final-CTA block — matches the section count. */
  lastChapter: "End · Chapter 09",
} as const;

export type SiteConfig = typeof siteConfig;
