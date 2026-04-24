import { Eyebrow, H2, SerifAccent } from "./primitives";

const items = [
  {
    k: "01",
    h: "Readable, not decoded",
    p: "Feature-organized modules, thin routes, typed boundaries. You can understand the app in an afternoon and still understand it six months in.",
  },
  {
    k: "02",
    h: "Real B2B multi-tenant",
    p: "Organizations, invites, roles, active-org switching, per-org data. Built in, not bolted on.",
  },
  {
    k: "03",
    h: "Stripe that speaks your language",
    p: 'Capability-based plan gating with a single source of truth. assertCapability("ai.assistant") — done.',
  },
  {
    k: "04",
    h: "AI assistant with tool calling",
    p: "Vercel AI SDK with Google, OpenAI, Groq. Org-scoped conversations, tools, model selection.",
  },
  {
    k: "05",
    h: "Built for modification",
    p: "No framework-within-a-framework. Add product logic without fighting a hidden abstraction.",
  },
  {
    k: "06",
    h: "Demo mode, shipped",
    p: "DEMO_MODE=true shows a public instance prospects can try — daily DB reset included.",
  },
];

export function Benefits() {
  return (
    <section className="border-y border-border bg-card px-10 py-24">
      <div className="mx-auto max-w-[1200px]">
        <Eyebrow n="01">WHY TENVIQ IS DIFFERENT</Eyebrow>
        <H2 className="max-w-[900px]">
          Most starters let you ship fast, then make you{" "}
          <SerifAccent>rewrite everything</SerifAccent> at month three.
        </H2>
        <p className="mt-5 max-w-[680px] text-[17px] leading-[1.55] text-muted-foreground">
          Tenviq optimizes for the part ShipFast-style starters skip: a
          codebase you&apos;ll still enjoy reading when your first real customer
          asks for something odd.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div key={it.k} className="bg-background px-6 py-8">
              <div className="font-mono text-[11px] tracking-[0.15em] text-brand">
                {it.k}
              </div>
              <div className="mt-3.5 text-[21px] font-medium tracking-[-0.02em]">
                {it.h}
              </div>
              <div className="mt-2.5 text-[13.5px] leading-[1.55] text-muted-foreground">
                {it.p}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
