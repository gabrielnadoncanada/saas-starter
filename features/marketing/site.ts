/**
 * Marketing page copy — single source for counts and seller profile.
 * Doc count: `(Get-ChildItem content/docs -Recurse -File).Count` (PowerShell)
 */
export const MARKETING_DOC_COUNT = 113;

export const marketingBuilder = {
  name: "Tenviq",
  initials: "T",
  bioParagraphs: [
    "We build SaaS foundations and got tired of rewiring auth, billing, and plan enforcement from scratch every time. So we built the stack we actually wanted — one where billing controls what users can do, not just what they pay.",
    "This starter is the base we use for our own products. It is opinionated enough to move fast, simple enough to understand in an afternoon, and clean enough to hand off to another developer without apologies.",
  ],
  /** Add { label, href } entries when you have public profiles; empty hides the row. */
  socialLinks: [] as { label: string; href: string }[],
};
