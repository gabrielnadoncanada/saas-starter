import { cn } from "@/lib/utils";

import { Eyebrow, H2, SerifAccent } from "./primitives";

const rows: Array<[string, string, string]> = [
  ["Framework", "Next.js 16", "App Router · Turbopack · React 19"],
  ["Language", "TypeScript", "Strict mode. Every boundary typed."],
  [
    "UI",
    "Tailwind 4 + shadcn/ui",
    "Radix primitives. ai-elements for the assistant.",
  ],
  ["Auth", "Better Auth", "DB sessions, magic link, OAuth, org plugin."],
  ["Database", "PostgreSQL + Prisma", "Multi-file schema in prisma/models/."],
  ["Payments", "Stripe", "Checkout, portal, webhooks, trials, automatic tax."],
  ["AI", "Vercel AI SDK", "Google, OpenAI, Groq. Tool calling. Streaming."],
  ["Email", "Resend + React Email", "Typed templates, dev preview."],
  ["Validation", "Zod", "Input parsing at every server boundary."],
  ["Testing", "Vitest + Playwright", "Unit + e2e. Real examples included."],
];

export function SpecTable() {
  return (
    <section
      id="spec"
      className="border-t border-border bg-card px-10 py-[110px]"
    >
      <div className="mx-auto max-w-[1200px]">
        <Eyebrow n="05">THE STACK</Eyebrow>
        <H2 className="max-w-[820px]">
          2026 defaults.{" "}
          <SerifAccent>No legacy you&apos;d have ripped out anyway.</SerifAccent>
        </H2>

        <div className="mt-12 overflow-hidden rounded-xl border border-border bg-background">
          {rows.map((r, i) => (
            <div
              key={r[0]}
              className={cn(
                "grid grid-cols-[160px_220px_1fr_60px] items-center gap-6 px-6 py-[18px]",
                i < rows.length - 1 && "border-b border-border",
              )}
            >
              <span className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground">
                {r[0].toUpperCase()}
              </span>
              <span className="text-base font-medium">{r[1]}</span>
              <span className="text-[13.5px] text-muted-foreground">
                {r[2]}
              </span>
              <span className="text-right font-mono text-[11px] text-brand">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
