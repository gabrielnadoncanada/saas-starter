export type ComparisonColumn = {
  label: string;
  description: string;
  items: string[];
  tone: "weak" | "brand";
};

export const comparisonColumns: ComparisonColumn[] = [
  {
    label: "Thin starters",
    description:
      "Fast to buy, but still leave the expensive B2B parts for you to rebuild.",
    items: [
      "Good for basic MVPs",
      "Weak team and admin foundations",
      "More product plumbing left to build",
      "Less credible out of the box",
      "Often become a rewrite later",
    ],
    tone: "weak",
  },
  {
    label: "Heavy starters",
    description:
      "Complete on paper, but harder to understand when you need to move fast.",
    items: [
      "More architecture to absorb",
      "More ceremony around simple changes",
      "More patterns to learn first",
      "Slower first customization pass",
      "Higher cognitive load for small teams",
    ],
    tone: "weak",
  },
  {
    label: "Tenviq",
    description:
      "A launch-ready B2B base with less code archaeology before you can ship.",
    items: [
      "Teams, billing, admin, and AI already wired",
      "Readable feature-first codebase",
      "Faster time to first real feature",
      "Safer changes without hidden architecture",
      "Built for technical founders, not framework tourists",
    ],
    tone: "brand",
  },
];
