import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Eyebrow, H2, SerifAccent } from "./primitives";

const items = [
  {
    q: "Why is the price so low right now?",
    a: "Tenviq is production-ready today. The founding price exists because direct feedback from the first 20 builders is worth more than an extra $150 up front. We also want to quote them credibly once we raise to $149, then $249 permanently. Once the 20 founding seats are gone, the price moves to $149, then $249.",
  },
  {
    q: "Is this just a boilerplate?",
    a: "No. It's a full product shell. Multi-tenant orgs, Stripe with capability-based plan gating, an admin surface, an AI assistant with tool calling, and docs. It already looks and behaves like a product you can demo and sell.",
  },
  {
    q: "Who is Tenviq for?",
    a: "Technical founders, indie hackers and small teams (2–5) shipping B2B SaaS or AI products who want a serious foundation without a heavy framework. If you're tired of rebuilding auth, orgs, billing and admin every new project, you're the buyer.",
  },
  {
    q: "Who is it NOT for?",
    a: "You only need a landing page + Stripe button for a simple solo MVP, you want a massive enterprise framework with plugins and ceremony, or you're shopping for the cheapest starter instead of the clearest one to extend.",
  },
  {
    q: "What do I get when I buy?",
    a: "Private GitHub access the moment the payment clears, full source with history, a commercial license, lifetime updates pushed to the repo, and access to the live demo build.",
  },
  {
    q: "Can I use it for client work?",
    a: "Yes — unlimited products under your single developer seat, including client projects. You cannot redistribute or resell the source itself. See LICENSE for full terms.",
  },
  {
    q: "Do I get future updates?",
    a: "Yes. Every release goes straight to your private fork. No subscription, no renewals.",
  },
  {
    q: "Do you offer refunds?",
    a: "Because it's source-available the moment you buy, we don't offer refunds after repo access is granted. That's why the live demo is full-fidelity — click every button before you pay.",
  },
];

export function Faq() {
  return (
    <section className="px-10 py-[110px]">
      <div className="mx-auto max-w-[900px]">
        <Eyebrow n="08">FAQ</Eyebrow>
        <H2 className="max-w-[700px]">
          Questions, <SerifAccent>answered</SerifAccent>.
        </H2>

        <Accordion
          type="single"
          collapsible
          defaultValue="item-0"
          className="mt-10 overflow-hidden rounded-xl border border-border bg-card"
        >
          {items.map((it, i) => (
            <AccordionItem
              key={it.q}
              value={`item-${i}`}
              className="border-b border-border last:border-b-0"
            >
              <AccordionTrigger className="gap-4 px-6 py-5 text-base font-medium hover:no-underline [&>svg]:text-muted-foreground">
                <span className="flex flex-1 items-center gap-4">
                  <span className="w-6 font-mono text-[11px] tracking-[0.08em] text-brand">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 text-left">{it.q}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pl-16 text-[14.5px] leading-[1.6] text-muted-foreground">
                {it.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
