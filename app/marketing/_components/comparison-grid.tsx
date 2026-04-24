import { cn } from "@/lib/utils";

import { Eyebrow, H2, SerifAccent } from "./primitives";

type Col = {
  t: string;
  s: string;
  accent?: boolean;
  items: Array<[string, string]>;
};

const cols: Col[] = [
  {
    t: "Light starters",
    s: "ShipFast, basic boilerplates",
    items: [
      ["Auth", "NextAuth basics, no org model"],
      ["Multi-tenant", "You add it later"],
      ["Plan gating", "If/else on stripe.status"],
      ["AI", "Optional add-on, untyped"],
      ["Admin", "Not included"],
      ["Demo mode", "Roll your own"],
    ],
  },
  {
    t: "Heavy enterprise kits",
    s: "Nx monorepos, over-framework'd",
    items: [
      ["Auth", "Ten abstractions deep"],
      ["Multi-tenant", "Rigid, hard to modify"],
      ["Plan gating", "Full RBAC you don't need"],
      ["AI", "Not there or tacked on"],
      ["Admin", "Heavy, opinionated wrong"],
      ["Demo mode", "Not the use case"],
    ],
  },
  {
    t: "Tenviq",
    s: "Right-sized B2B starter",
    accent: true,
    items: [
      ["Auth", "Better Auth + org plugin"],
      ["Multi-tenant", "From day one, scoped queries"],
      ["Plan gating", "Capabilities + limits config"],
      ["AI", "Tool calling, first-class"],
      ["Admin", "Real surfaces, already built"],
      ["Demo mode", "DEMO_MODE=true ships it"],
    ],
  },
];

export function ComparisonGrid() {
  return (
    <section className="px-10 py-[110px]">
      <div className="mx-auto max-w-[1200px]">
        <Eyebrow n="06">WHERE TENVIQ FITS</Eyebrow>
        <H2 className="max-w-[820px]">
          Between &quot;too light to keep&quot; and{" "}
          <SerifAccent>&quot;too heavy to use&quot;.</SerifAccent>
        </H2>

        <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
          {cols.map((col) => (
            <div
              key={col.t}
              className={cn(
                "px-6 py-7",
                col.accent
                  ? "border-t-2 border-brand bg-[#13100f]"
                  : "bg-background",
              )}
            >
              <div
                className={cn(
                  "font-mono text-[10.5px] tracking-[0.15em]",
                  col.accent ? "text-brand" : "text-muted-foreground",
                )}
              >
                {col.accent ? "● YOU HERE" : col.s.toUpperCase()}
              </div>
              <div className="mt-2.5 text-[22px] font-medium tracking-[-0.02em]">
                {col.t}
              </div>
              <div className="mt-5 border-t border-border pt-3">
                {col.items.map(([k, v]) => (
                  <div
                    key={k}
                    className="grid grid-cols-[90px_1fr] gap-2.5 border-b border-border py-2 text-[12.5px]"
                  >
                    <span className="font-mono tracking-[0.1em] text-muted-foreground">
                      {k.toUpperCase()}
                    </span>
                    <span
                      className={cn(
                        col.accent ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
