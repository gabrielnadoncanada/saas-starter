import { Eyebrow, H2, SerifAccent } from "./primitives";

export function CodeShowcase() {
  return (
    <section className="border-y border-border bg-card px-10 py-[110px]">
      <div className="mx-auto max-w-[1000px]">
        <Eyebrow n="03">THE MOAT, IN CODE</Eyebrow>
        <H2 className="max-w-[780px]">
          Gate a feature. One line.{" "}
          <SerifAccent>One source of truth.</SerifAccent>
        </H2>
        <p className="mt-5 max-w-[620px] text-base leading-[1.55] text-muted-foreground">
          No sprawling permission system. No feature-flag SaaS. Capabilities
          live in one config file — Stripe picks the plan, your config decides
          what it unlocks.
        </p>

        <div className="mt-10 overflow-hidden rounded-xl border border-border bg-[#08080a]">
          <div className="flex gap-1.5 border-b border-border bg-[#0d0d10] px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
            <span className="size-[9px] rounded-full bg-[#ff5f57]" />
            <span className="size-[9px] rounded-full bg-[#febc2e]" />
            <span className="size-[9px] rounded-full bg-[#28c840]" />
            <span className="ml-3.5">features/tasks/actions/export.ts</span>
          </div>
          <div className="px-6 py-5 font-mono text-sm leading-[1.75] text-foreground">
            <div className="text-muted-foreground/60">
              {"// Block the feature if the plan doesn't include it."}
            </div>
            <div className="text-muted-foreground/60">
              {"// Enforce usage quota. Done."}
            </div>
            <div>&nbsp;</div>
            <div>
              <span className="text-[#c594c5]">&quot;use server&quot;</span>;
            </div>
            <div>&nbsp;</div>
            <div>
              <span className="text-[#c594c5]">export async function</span>{" "}
              <span className="text-[#7cafc2]">exportTasks</span>() {"{"}
            </div>
            <div>
              &nbsp;&nbsp;<span className="text-[#c594c5]">const</span>{" "}
              {"{ planId, usage }"} ={" "}
              <span className="text-[#c594c5]">await</span>{" "}
              <span className="text-[#7cafc2]">getOrgEntitlements</span>();
            </div>
            <div>&nbsp;</div>
            <div>
              &nbsp;&nbsp;
              <span className="text-[#7cafc2]">assertCapability</span>(planId,{" "}
              <span className="text-[#ffc58b]">&quot;task.export&quot;</span>);
            </div>
            <div>
              &nbsp;&nbsp;<span className="text-[#7cafc2]">assertLimit</span>(planId,{" "}
              <span className="text-[#ffc58b]">&quot;tasksPerMonth&quot;</span>,
              usage.tasks);
            </div>
            <div>&nbsp;</div>
            <div>
              &nbsp;&nbsp;<span className="text-[#c594c5]">return</span>{" "}
              <span className="text-[#7cafc2]">generateCsv</span>();
            </div>
            <div>{"}"}</div>
          </div>
        </div>

        <div className="mt-4 text-center font-mono text-xs tracking-[0.03em] text-muted-foreground">
          <span className="text-brand">
            Stripe decides which plan is active.
          </span>
          &nbsp;&nbsp;Your config decides what that plan gives.
        </div>
      </div>
    </section>
  );
}
