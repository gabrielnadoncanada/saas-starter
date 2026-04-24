import { cn } from "@/lib/utils";

const navItems: Array<{ label: string; active?: boolean; badge?: string }> = [
  { label: "Dashboard", active: true },
  { label: "Tasks" },
  { label: "Members" },
  { label: "Assistant", badge: "●" },
  { label: "Billing" },
  { label: "Settings" },
];

const kpis: Array<{ k: string; v: string; d: string }> = [
  { k: "MRR", v: "$14,280", d: "+12.4%" },
  { k: "Seats", v: "3 / 5", d: "Pro" },
  { k: "AI credits", v: "418 / 1000", d: "used" },
  { k: "Tasks", v: "2,184", d: "+186" },
];

const members: Array<{
  a: string;
  n: string;
  r: string;
  s: "active" | "pending";
}> = [
  { a: "GN", n: "Gabriel Nadon", r: "Owner", s: "active" },
  { a: "SM", n: "Sara Meyer", r: "Admin", s: "active" },
  { a: "RK", n: "Rafael Kim", r: "Member", s: "pending" },
];

const trafficLight = ["bg-[#2a2a2a]", "bg-[#2a2a2a]", "bg-[#2a2a2a]"];

export function AppPreview() {
  return (
    <div className="overflow-hidden rounded-[14px] border border-border bg-[#0b0b0e] shadow-[0_60px_140px_-30px_rgba(0,0,0,0.8),0_20px_60px_-20px_hsl(var(--brand-hsl)/0.15)]">
      {/* Browser chrome */}
      <div className="flex items-center gap-2.5 border-b border-border bg-[#0d0d10] px-3.5 py-2.5">
        <div className="flex gap-1.5">
          {trafficLight.map((c, i) => (
            <span key={i} className={cn("size-[11px] rounded-full", c)} />
          ))}
        </div>
        <div className="flex-1 text-center font-mono text-[11px] text-muted-foreground">
          app.tenviq.dev / acme-corp / overview
        </div>
        <div className="w-[33px]" />
      </div>

      {/* App body */}
      <div className="flex h-[620px]">
        {/* Sidebar */}
        <div className="w-[200px] border-r border-border bg-[#070709] p-3 text-xs">
          <div className="mb-4 flex items-center gap-2 rounded-md border border-border bg-[#141418] px-2.5 py-2">
            <span className="grid size-4 place-items-center rounded-[4px] bg-brand text-[10px] font-semibold text-brand-foreground">
              A
            </span>
            <span className="font-medium">Acme Corp</span>
            <span className="ml-auto text-muted-foreground/60">⌄</span>
          </div>
          <div className="mx-2.5 mb-2 mt-1.5 font-mono text-[10px] tracking-[0.15em] text-muted-foreground/60">
            WORKSPACE
          </div>
          {navItems.map((item) => (
            <div
              key={item.label}
              className={cn(
                "mb-px flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs",
                item.active
                  ? "bg-[#141418] text-foreground"
                  : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "size-1 rounded-full",
                  item.active ? "bg-brand" : "bg-muted-foreground/60",
                )}
              />
              {item.label}
              {item.badge && (
                <span className="ml-auto text-[10px] text-brand">
                  {item.badge}
                </span>
              )}
            </div>
          ))}
          <div className="mx-2.5 mb-2 mt-4 font-mono text-[10px] tracking-[0.15em] text-muted-foreground/60">
            ADMIN
          </div>
          {["Users", "Organizations", "Audit log"].map((l) => (
            <div key={l} className="px-2.5 py-1.5 text-xs text-muted-foreground">
              {l}
            </div>
          ))}
          <div className="relative mt-4 rounded-md border border-border bg-[linear-gradient(135deg,hsl(var(--brand-hsl)/0.12),transparent)] p-2.5">
            <div className="text-[11px] font-medium">Pro plan</div>
            <div className="mt-0.5 text-[10.5px] text-muted-foreground">
              418 / 1000 tasks · 3 / 5 members
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 overflow-hidden p-6">
          <div className="mb-5 flex justify-between">
            <div>
              <div className="text-[22px] font-medium tracking-[-0.02em]">
                Overview
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                April 2026 · Acme Corp · 3 members
              </div>
            </div>
            <div className="flex gap-2">
              <span className="rounded-md border border-border px-3 py-1.5 text-[11px]">
                Last 30 days ⌄
              </span>
              <span className="rounded-md bg-brand px-3 py-1.5 text-[11px] font-medium text-brand-foreground">
                + Invite
              </span>
            </div>
          </div>

          {/* KPIs */}
          <div className="mb-3.5 grid grid-cols-4 gap-2.5">
            {kpis.map(({ k, v, d }) => (
              <div
                key={k}
                className="rounded-lg border border-border bg-card p-3"
              >
                <div className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground">
                  {k.toUpperCase()}
                </div>
                <div className="mt-1 text-xl font-medium">{v}</div>
                <div
                  className={cn(
                    "text-[10.5px]",
                    d.startsWith("+") ? "text-brand" : "text-muted-foreground",
                  )}
                >
                  {d}
                </div>
              </div>
            ))}
          </div>

          {/* Chart + side panel */}
          <div className="mb-3.5 grid grid-cols-[2fr_1fr] gap-2.5">
            <div className="rounded-lg border border-border bg-card p-3.5">
              <div className="mb-2.5 flex justify-between">
                <div className="text-xs font-medium">Workspace activity</div>
                <div className="font-mono text-[10px] text-muted-foreground">
                  30D
                </div>
              </div>
              <svg
                viewBox="0 0 500 130"
                width="100%"
                height="110"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="gv2" x1="0" x2="0" y1="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="hsl(var(--brand-hsl))"
                      stopOpacity="0.4"
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(var(--brand-hsl))"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>
                <path
                  d="M0,100 L25,92 L50,86 L75,90 L100,76 L125,82 L150,66 L175,58 L200,52 L225,58 L250,44 L275,38 L300,42 L325,30 L350,24 L375,32 L400,18 L425,22 L450,12 L475,16 L500,8 L500,130 L0,130 Z"
                  fill="url(#gv2)"
                />
                <path
                  d="M0,100 L25,92 L50,86 L75,90 L100,76 L125,82 L150,66 L175,58 L200,52 L225,58 L250,44 L275,38 L300,42 L325,30 L350,24 L375,32 L400,18 L425,22 L450,12 L475,16 L500,8"
                  stroke="hsl(var(--brand-hsl))"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
            </div>
            <div className="rounded-lg border border-border bg-card p-3.5">
              <div className="mb-2.5 text-xs font-medium">AI assistant</div>
              <div className="text-[11px] leading-[1.5] text-muted-foreground">
                Draft the Q2 OKRs from last week&apos;s tasks…
              </div>
              <div className="mt-2.5 rounded-md border border-border bg-[#0d0d10] p-2 font-mono text-[10.5px]">
                <span className="text-brand">▸ tasks.search</span>
                <div className="mt-0.5 text-muted-foreground">
                  status: completed, 30d
                </div>
              </div>
              <div className="mt-2 font-mono text-[10px] text-brand">
                streaming…
              </div>
            </div>
          </div>

          {/* Members table */}
          <div className="rounded-lg border border-border bg-card p-3.5">
            <div className="mb-2.5 flex items-center justify-between">
              <div className="text-xs font-medium">Organization members</div>
              <div className="font-mono text-[10px] tracking-[0.1em] text-muted-foreground">
                3 ACTIVE
              </div>
            </div>
            {members.map(({ a, n, r, s }) => (
              <div
                key={n}
                className="grid grid-cols-[24px_1fr_100px_80px_20px] items-center gap-2.5 border-t border-border py-1.5"
              >
                <span className="grid size-[22px] place-items-center rounded-full bg-[#222] text-[9px] font-semibold">
                  {a}
                </span>
                <span className="text-xs">{n}</span>
                <span className="text-[11px] text-muted-foreground">{r}</span>
                <span
                  className={cn(
                    "font-mono text-[10px]",
                    s === "active" ? "text-brand" : "text-muted-foreground",
                  )}
                >
                  ● {s}
                </span>
                <span className="text-sm text-muted-foreground/60">⋯</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
