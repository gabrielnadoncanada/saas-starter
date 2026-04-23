/**
 * Release manifest: what makes the tenviq-com repo different from the
 * tenviq-starter (the shippable artifact buyers get access to).
 *
 * - `remove`: paths removed from the starter snapshot entirely.
 *   Use this for Tenviq-specific marketing content (landing copy, /compare
 *   pages, blog posts, marketing-only config).
 *
 * - `overrideFrom`: files replaced by a generic template stored under
 *   `scripts/release/templates/` (same relative path).
 *   Use this for files that must exist in the starter but whose Tenviq
 *   content isn't useful to buyers (landing, legal pages, README, LICENSE).
 *
 * - `stringReplace`: simple token replacement applied to every file kept
 *   in the snapshot. Use sparingly — most rebrand cases should use
 *   `overrideFrom` instead so the diff stays legible.
 *
 * The starter is expected to be a usable SaaS starter on its own: the
 * template files linked below should leave a buyer with a working Next.js
 * app after cloning.
 */

export type ReleaseManifest = {
  remove: string[];
  overrideFrom: string[];
  stringReplace: Array<{ from: string; to: string }>;
  preserveDirs: string[];
};

export const manifest: ReleaseManifest = {
  remove: [
    // Tenviq-only blog posts (starter ships with a single welcome post template)
    "content/blog/introducing-saas-starter.mdx",
    "content/blog/plan-gating-that-actually-works.mdx",
    "content/blog/tenviq-vs-shipfast.mdx",

    // Marketing context + agent config (Tenviq-internal)
    ".agents",

    // Tenviq-only marketing route groups (created later: /compare, /vs, /alternatives)
    "app/(marketing)/compare",
    "app/(marketing)/vs",
    "app/(marketing)/alternatives",

    // Screenshot fixtures tied to Tenviq's marketing
    // (buyers regenerate their own via `pnpm marketing:screenshots`)
    "public/marketing/screenshots",

    // Release tooling itself — buyers don't need to re-release
    "scripts/release",

    // Fumadocs-generated output (regenerated on build, but tracked here)
    ".source",

    // Tenviq-branded e2e spec for the marketing video
    "e2e/video-demo.spec.ts",

    // AI-editor junk directories tracked in this repo
    ".aider",
    ".amazonq",
    ".amp",
    ".antigravity",
    ".augment",
    ".bolt",
    ".clawdbot",
    ".cline",
    ".codebuddy",
    ".codegpt",
    ".codex",
    ".cody",
    ".commandcode",
    ".continue",
    ".crush",
    ".devin",
    ".factory",
    ".gemini",
    ".goose",
    ".kilocode",
    ".kiro",
    ".lovable",
    ".mcpjam",
    ".mux",
    ".neovate",
    ".opencode",
    ".openhands",
    ".pi",
    ".playcode",
    ".qoder",
    ".qwen",
    ".replit",
    ".roo",
    ".tabby",
    ".tabnine",
    ".trae",
    ".windsurf",
    ".zencoder",
    ".github/skills",
    "skills",
  ],

  overrideFrom: [
    "app/(marketing)/page.tsx",
    "app/(marketing)/layout.tsx",
    "app/opengraph-image.tsx",
    "app/layout.tsx",
    "app/(marketing)/blog/page.tsx",
    "features/marketing/components/brand-logo.tsx",
    "package.json",
    "app/feed.xml/route.ts",
    "app/(marketing)/terms/page.tsx",
    "app/(marketing)/privacy/page.tsx",
    "app/(marketing)/license/page.tsx",
    "config/pricing.config.ts",
    "content/blog/welcome.mdx",
    "content/docs/index.mdx",
    "README.MD",
    "LICENSE.md",
    "CLAUDE.md",
    ".env.example",
  ],

  stringReplace: [
    // Fallback rename for any stray brand mention. Keep this list tight —
    // if a file needs more than one token swap, add it to `overrideFrom` instead.
    { from: "Tenviq", to: "SaaS Starter" },
    { from: "tenviq.com", to: "example.com" },
  ],

  preserveDirs: [
    // Directories that must be kept even if they only contain generated files
    // that are otherwise gitignored. The starter snapshot copies tracked files
    // only (via git ls-files), so this is mostly a sanity list for now.
    "content/blog",
  ],
};
