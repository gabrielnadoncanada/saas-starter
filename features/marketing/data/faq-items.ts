export type FaqItem = {
  question: string;
  answer: string;
};

export const faqItems: FaqItem[] = [
  {
    question: "Why is the price so low right now?",
    answer:
      "Tenviq is production-ready today. The founding price exists because we are trading price for two things: direct feedback from the first 20 builders using it in anger, and permission to quote them when we move to the standard price. You get the same codebase, the same private GitHub access, and the same lifetime updates as someone paying $249 later. Once the 20 founding seats are gone, the price moves to $149, then $249 permanently.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "No refunds — but the live demo is your guarantee. You get full access to the running product before you pay: click through the dashboard, auth, billing, teams, admin panel, and AI assistant. If the demo doesn't convince you, don't buy. Once you purchase, we hand over the source code and private GitHub access immediately — that's why the sale is final. Try the demo first, and only buy when you're sure.",
  },
  {
    question: "Is this just a boilerplate?",
    answer:
      "No. It is a product-ready B2B SaaS foundation with real auth, enforced billing logic, teams, admin surfaces, and an AI assistant already wired together. The point is not just faster setup. The point is starting from a product that already feels real.",
  },
  {
    question: "What do I get when I buy?",
    answer:
      "Immediate access to a private GitHub repository with the full source code, the same product surfaces you can inspect in the live demo, and all future updates for the lifetime of the product. You own your copy and can start shipping from it the same day.",
  },
  {
    question: "Who is this for?",
    answer:
      "Technical founders building a real B2B or AI SaaS who want auth, billing, organizations, admin, and product-ready surfaces without buying a heavy starter they will spend weeks decoding.",
  },
  {
    question: "Can I use it for client projects or multiple products?",
    answer:
      "Yes. The starter includes unlimited end products and full commercial usage. Build for yourself, for your startup, or for client work without per-project fees.",
  },
  {
    question: "Who is this not for?",
    answer:
      "If you only need a basic login, a landing page, and a Stripe button for a simple solo MVP, this is probably more foundation than you need. It is best for products that actually need teams, billing rules, admin visibility, and room to grow.",
  },
  {
    question: "Do I get future updates?",
    answer:
      "Yes. The starter includes lifetime updates. When we ship new features, upgrades, or framework bumps, you get them in your private repo at no extra cost.",
  },
  {
    question: "What's NOT allowed under the license?",
    answer:
      "You cannot resell or redistribute the starter codebase itself, sublicense it, or use it to build a competing starter kit or template product. The seat is per developer and cannot be shared. Full terms at /license.",
  },
];
