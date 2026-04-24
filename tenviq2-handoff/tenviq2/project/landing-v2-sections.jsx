// Landing v2 sections — all exported to window, then composed in the main HTML.

// ─────────────────────────────────────────
// TOP BAR
function TopBar() {
  return (
    <>
      <div style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,106,74,0.12), transparent)',
        borderBottom: `1px solid ${t.line}`,
        padding: '10px 24px', textAlign: 'center',
        fontFamily: t.mono, fontSize: 11, letterSpacing: 1.5, color: t.inkSoft,
      }}>
        <span style={{ color: t.accent, fontWeight: 500 }}>● FOUNDING PRICE</span>
        <span style={{ margin: '0 14px', opacity: 0.4 }}>—</span>
        <span>$99 today · goes to $149 once 20 founding seats are gone · lifetime updates</span>
      </div>
      <div style={{ display:'flex', alignItems:'center', padding: '20px 40px', maxWidth: MAX, margin: '0 auto' }}>
        <Logo />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 28, fontSize: 14, color: t.inkSoft }}>
          <a>What ships</a><a>Stack</a><a>How it works</a><a>Pricing</a><a>Live demo ↗</a><a>Docs</a>
        </div>
        <div style={{ display:'flex', gap: 10, alignItems: 'center' }}>
          <a style={{ fontSize: 14, color: t.inkSoft }}>Sign in</a>
          <PrimaryBtn compact>Buy · $99 →</PrimaryBtn>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────
// HERO
function Hero() {
  return (
    <div style={{ padding: '80px 40px 24px', textAlign: 'center', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        padding: '7px 14px', borderRadius: 999,
        background: t.surface, border: `1px solid ${t.line}`,
        fontFamily: t.mono, fontSize: 11, letterSpacing: 1.5, color: t.inkSoft,
        marginBottom: 28,
      }}>
        <span style={{ width: 5, height: 5, borderRadius: 999, background: t.accent }} />
        NEXT.JS 16 · REACT 19 · TAILWIND 4 · BETTER AUTH
      </div>

      <h1 style={{
        fontFamily: t.sans, fontWeight: 500, fontSize: 80, lineHeight: 1.02,
        letterSpacing: -3, margin: 0, textWrap: 'balance',
      }}>
        The B2B SaaS base<br/>
        you'll <SerifAccent color={t.accent}>actually keep shipping</SerifAccent><br/>
        from.
      </h1>

      <p style={{
        fontSize: 19, lineHeight: 1.55, color: t.inkSoft,
        maxWidth: 620, margin: '28px auto 0', textWrap: 'pretty',
      }}>
        Multi-tenant orgs, Stripe with capability-based plan gating, admin surfaces,
        and an AI assistant with tool calling — in a codebase
        <span style={{ color: t.ink }}> built to be read, not decoded.</span>
      </p>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
        <PrimaryBtn>Claim a founding seat · $99 <span>→</span></PrimaryBtn>
        <GhostBtn>Open live demo ↗</GhostBtn>
      </div>

      <div style={{ marginTop: 28, fontFamily: t.mono, fontSize: 11, color: t.inkDim, letterSpacing: 1 }}>
        ONE-TIME PAYMENT · LIFETIME UPDATES · UNLIMITED PRODUCTS · COMMERCIAL LICENSE
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// HERO APP SHOT
function HeroApp() {
  return (
    <div style={{ padding: '30px 40px 80px', position: 'relative' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(255,106,74,0.16), transparent 70%)',
        pointerEvents: 'none',
      }}/>
      <div style={{ maxWidth: 1180, margin: '0 auto', position: 'relative' }}>
        <AppMockup />
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          marginTop: 14, fontFamily: t.mono, fontSize: 11, color: t.inkDim, letterSpacing: 1.2,
        }}>
          <span>FIG. 01 — THE APP YOU CLONE · MULTI-TENANT FROM DAY ONE</span>
          <span>APP.TENVIQ.DEV — LIVE DEMO</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// MOAT — why this is different
function Moat() {
  const items = [
    { k: '01', h: 'Readable, not decoded', p: 'Feature-organized modules, thin routes, typed boundaries. You can understand the app in an afternoon and still understand it six months in.' },
    { k: '02', h: 'Real B2B multi-tenant', p: 'Organizations, invites, roles, active-org switching, per-org data. Built in, not bolted on.' },
    { k: '03', h: 'Stripe that speaks your language', p: 'Capability-based plan gating with a single source of truth. assertCapability("ai.assistant") — done.' },
    { k: '04', h: 'AI assistant with tool calling', p: 'Vercel AI SDK with Google, OpenAI, Groq. Org-scoped conversations, tools, model selection.' },
    { k: '05', h: 'Built for modification', p: 'No framework-within-a-framework. Add product logic without fighting a hidden abstraction.' },
    { k: '06', h: 'Demo mode, shipped', p: 'DEMO_MODE=true shows a public instance prospects can try — daily DB reset included.' },
  ];
  return (
    <div style={{ padding: '100px 40px', borderTop: `1px solid ${t.line}`, borderBottom: `1px solid ${t.line}`, background: t.surface }}>
      <div style={{ maxWidth: MAX, margin: '0 auto' }}>
        <Eyebrow n="01">WHY TENVIQ IS DIFFERENT</Eyebrow>
        <H2 style={{ maxWidth: 900 }}>
          Most starters let you ship fast, then make you <SerifAccent>rewrite everything</SerifAccent> at month three.
        </H2>
        <p style={{ fontSize: 17, color: t.inkSoft, marginTop: 22, maxWidth: 680, lineHeight: 1.55 }}>
          Tenviq optimizes for the part ShipFast-style starters skip: a codebase
          you'll still enjoy reading when your first real customer asks for something odd.
        </p>

        <div style={{
          marginTop: 56,
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1,
          background: t.line, border: `1px solid ${t.line}`, borderRadius: 12, overflow: 'hidden',
        }}>
          {items.map(it => (
            <div key={it.k} style={{ background: t.bg, padding: '30px 26px 32px' }}>
              <div style={{ fontFamily: t.mono, fontSize: 11, color: t.accent, letterSpacing: 1.5 }}>{it.k}</div>
              <div style={{ fontSize: 21, fontWeight: 500, marginTop: 14, letterSpacing: -0.4 }}>{it.h}</div>
              <div style={{ fontSize: 13.5, color: t.inkSoft, marginTop: 10, lineHeight: 1.55 }}>{it.p}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// INSIDE — tabbed feature showcase
function Inside() {
  const [tab, setTab] = React.useState(0);
  const tabs = [
    {
      id: 'auth', label: 'Auth',
      eyebrow: 'BETTER AUTH · NOT NEXTAUTH',
      title: 'Sign-in that already handles the messy cases.',
      desc: 'Email/password, magic link, Google, GitHub. Account linking by verified email, device sessions, soft delete, email verification.',
      bullets: ['Better Auth with DB sessions', 'OAuth: Google + GitHub', 'Magic link via Resend', 'Session + device management', 'Soft account deletion'],
    },
    {
      id: 'orgs', label: 'Organizations',
      eyebrow: 'MULTI-TENANT FROM DAY ONE',
      title: 'Workspaces, roles, invites — wired.',
      desc: 'Active-org switching, role-aware routes, per-org data. Configurable: personal-only, organizations-only, or both.',
      bullets: ['Owner / Admin / Member roles', 'Invite flow with email templates', 'Active organization switching', 'Per-org data scoping', 'Personal-only or org-only modes'],
    },
    {
      id: 'billing', label: 'Billing',
      eyebrow: 'STRIPE + CAPABILITY GATING',
      title: 'Stripe decides the plan. Your config decides the power.',
      desc: 'Checkout, portal, webhooks, usage metering. Gate features with assertCapability, gate quotas with assertLimit. Monthly and yearly out of the box.',
      bullets: ['Checkout + customer portal', 'Webhook-safe subscription state', 'Capability-based feature flags', 'Usage quotas with assertLimit', 'Trials, automatic tax, tax ID collection'],
    },
    {
      id: 'admin', label: 'Admin',
      eyebrow: 'LOOKS REAL ON DAY ONE',
      title: 'The admin surface your buyers expect.',
      desc: 'User search, organization management, audit log, role-gated routes, soft delete. The stuff you\'d normally skip for the demo.',
      bullets: ['User search + impersonation', 'Organization management', 'Audit log', 'Role-gated routes', 'Soft delete with recovery'],
    },
    {
      id: 'ai', label: 'AI assistant',
      eyebrow: 'VERCEL AI SDK · TOOL CALLING',
      title: 'An AI that can actually touch your product.',
      desc: 'Streaming chat, tool calling, model selection, persisted conversations — scoped to the active org. Providers: Google, OpenAI, Groq.',
      bullets: ['Streaming chat + persisted threads', 'Tool calling with typed schemas', 'Model picker (Google / OpenAI / Groq)', 'Org-scoped conversations', 'Credits tracked per plan'],
    },
    {
      id: 'dx', label: 'Dev experience',
      eyebrow: 'BUILT TO BE READ',
      title: 'The convention you keep across projects.',
      desc: 'Feature-first modules, strict TypeScript, Prisma multi-file schema, seed data, Vitest, Playwright e2e. pnpm setup asks you every env var and writes .env for you.',
      bullets: ['Feature-first structure', 'Strict TypeScript', 'Multi-file Prisma schema', 'Seeded demo data', 'Vitest + Playwright', 'Interactive pnpm setup'],
    },
  ];
  const active = tabs[tab];
  return (
    <div style={{ padding: '110px 40px' }}>
      <div style={{ maxWidth: MAX, margin: '0 auto' }}>
        <Eyebrow n="02">WHAT'S INSIDE</Eyebrow>
        <H2 style={{ maxWidth: 860 }}>
          Six B2B surfaces, <SerifAccent>already wired</SerifAccent>.
        </H2>

        <div style={{ marginTop: 40, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {tabs.map((tb, i) => (
            <span key={tb.id} onClick={() => setTab(i)} style={{
              padding: '9px 16px', borderRadius: 999,
              background: i === tab ? t.ink : 'transparent',
              color: i === tab ? t.bg : t.inkSoft,
              border: `1px solid ${i === tab ? t.ink : t.line}`,
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>
              {tb.label}
            </span>
          ))}
        </div>

        <div style={{
          marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 40,
          padding: 32, background: t.surface, border: `1px solid ${t.line}`, borderRadius: 14,
        }}>
          <div>
            <div style={{ fontFamily: t.mono, fontSize: 11, letterSpacing: 1.5, color: t.accent }}>{active.eyebrow}</div>
            <div style={{ fontSize: 30, fontWeight: 500, letterSpacing: -0.8, marginTop: 12, lineHeight: 1.15, textWrap: 'balance' }}>
              {active.title}
            </div>
            <div style={{ fontSize: 14.5, color: t.inkSoft, marginTop: 14, lineHeight: 1.6 }}>{active.desc}</div>
            <div style={{ marginTop: 20 }}>
              {active.bullets.map(b => (
                <div key={b} style={{ display: 'flex', gap: 10, padding: '5px 0', fontSize: 13.5 }}>
                  <span style={{ color: t.accent, fontWeight: 600 }}>✓</span>
                  <span style={{ color: t.ink }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
          <FeaturePreview id={active.id} />
        </div>
      </div>
    </div>
  );
}

// Visual preview per feature — abstract but specific
function FeaturePreview({ id }) {
  const wrap = { background: '#0b0b0e', border: `1px solid ${t.line}`, borderRadius: 10, padding: 22, fontFamily: t.mono, fontSize: 12, color: t.ink, lineHeight: 1.7, minHeight: 280 };
  if (id === 'auth') return (
    <div style={wrap}>
      <div style={{ color: t.inkDim }}>// lib/auth/auth-config.ts</div>
      <div><span style={{ color: '#c594c5' }}>export const</span> auth = <span style={{ color: '#7cafc2' }}>betterAuth</span>({'{'}</div>
      <div>&nbsp;&nbsp;emailAndPassword: {'{ enabled: '}<span style={{ color: t.accent2 }}>true</span>{' },'}</div>
      <div>&nbsp;&nbsp;socialProviders: {'{'}</div>
      <div>&nbsp;&nbsp;&nbsp;&nbsp;google: {'{ clientId, clientSecret },'}</div>
      <div>&nbsp;&nbsp;&nbsp;&nbsp;github: {'{ clientId, clientSecret },'}</div>
      <div>&nbsp;&nbsp;{'},'}</div>
      <div>&nbsp;&nbsp;plugins: {'['}</div>
      <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#7cafc2' }}>magicLink</span>({'{ sendMagicLink }'}),</div>
      <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#7cafc2' }}>organization</span>({'{ allowUserToCreateOrganization: '}<span style={{ color: t.accent2 }}>true</span>{' }'}),</div>
      <div>&nbsp;&nbsp;{'],'}</div>
      <div>{'});'}</div>
    </div>
  );
  if (id === 'orgs') return (
    <div style={wrap}>
      <div style={{ color: t.inkDim }}>// server action scoped to active org</div>
      <div><span style={{ color: '#c594c5' }}>export async function</span> <span style={{ color: '#7cafc2' }}>listTasks</span>() {'{'}</div>
      <div>&nbsp;&nbsp;<span style={{ color: '#c594c5' }}>const</span> {'{ activeOrgId, role }'} = <span style={{ color: '#c594c5' }}>await</span> <span style={{ color: '#7cafc2' }}>requireOrgSession</span>();</div>
      <div>&nbsp;&nbsp;<span style={{ color: '#7cafc2' }}>assertRole</span>(role, <span style={{ color: t.accent2 }}>"member"</span>);</div>
      <div>&nbsp;&nbsp;<span style={{ color: '#c594c5' }}>return</span> db.task.<span style={{ color: '#7cafc2' }}>findMany</span>({'{'}</div>
      <div>&nbsp;&nbsp;&nbsp;&nbsp;where: {'{ organizationId: activeOrgId }'},</div>
      <div>&nbsp;&nbsp;{'});'}</div>
      <div>{'}'}</div>
      <div style={{ marginTop: 10, color: t.inkDim }}>// every query scoped. no leaks between tenants.</div>
    </div>
  );
  if (id === 'billing') return (
    <div style={wrap}>
      <div style={{ color: t.inkDim }}>// config/billing.config.ts</div>
      <div>{'{'}</div>
      <div>&nbsp;&nbsp;id: <span style={{ color: t.accent2 }}>"pro"</span>,</div>
      <div>&nbsp;&nbsp;capabilities: {'['}</div>
      <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: t.accent2 }}>"task.create"</span>,</div>
      <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: t.accent2 }}>"task.export"</span>,</div>
      <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: t.accent2 }}>"team.invite"</span>,</div>
      <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: t.accent2 }}>"ai.assistant"</span>,</div>
      <div>&nbsp;&nbsp;{'],'}</div>
      <div>&nbsp;&nbsp;limits: {'{ tasksPerMonth: '}<span style={{ color: t.accent2 }}>1000</span>{', aiCredits: '}<span style={{ color: t.accent2 }}>1000</span>{' }'}</div>
      <div>{'}'}</div>
      <div style={{ marginTop: 10, color: t.inkDim }}>// then, anywhere in your app:</div>
      <div><span style={{ color: '#7cafc2' }}>assertCapability</span>(planId, <span style={{ color: t.accent2 }}>"ai.assistant"</span>);</div>
    </div>
  );
  if (id === 'admin') return (
    <div style={wrap}>
      <div style={{ color: t.inkDim }}>// features/users/server/admin.ts</div>
      <div><span style={{ color: '#c594c5' }}>export async function</span> <span style={{ color: '#7cafc2' }}>impersonateUser</span>(id: <span style={{ color: '#c594c5' }}>string</span>) {'{'}</div>
      <div>&nbsp;&nbsp;<span style={{ color: '#c594c5' }}>const</span> admin = <span style={{ color: '#c594c5' }}>await</span> <span style={{ color: '#7cafc2' }}>requireAdmin</span>();</div>
      <div>&nbsp;&nbsp;<span style={{ color: '#c594c5' }}>await</span> <span style={{ color: '#7cafc2' }}>logAudit</span>({'{'}</div>
      <div>&nbsp;&nbsp;&nbsp;&nbsp;actorId: admin.id,</div>
      <div>&nbsp;&nbsp;&nbsp;&nbsp;action: <span style={{ color: t.accent2 }}>"user.impersonate"</span>,</div>
      <div>&nbsp;&nbsp;&nbsp;&nbsp;targetId: id,</div>
      <div>&nbsp;&nbsp;{'});'}</div>
      <div>&nbsp;&nbsp;<span style={{ color: '#c594c5' }}>return</span> <span style={{ color: '#7cafc2' }}>startSession</span>(id);</div>
      <div>{'}'}</div>
    </div>
  );
  if (id === 'ai') return (
    <div style={wrap}>
      <div style={{ color: t.inkDim }}>// features/assistant/server/chat.ts</div>
      <div><span style={{ color: '#c594c5' }}>const</span> result = <span style={{ color: '#c594c5' }}>await</span> <span style={{ color: '#7cafc2' }}>streamText</span>({'{'}</div>
      <div>&nbsp;&nbsp;model: <span style={{ color: '#7cafc2' }}>google</span>(<span style={{ color: t.accent2 }}>"gemini-2.0-flash"</span>),</div>
      <div>&nbsp;&nbsp;system: <span style={{ color: '#7cafc2' }}>buildSystemPrompt</span>(org),</div>
      <div>&nbsp;&nbsp;tools: {'{'}</div>
      <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: t.accent }}>searchTasks</span>: {'{ parameters, execute },'}</div>
      <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: t.accent }}>createTask</span>: {'{ parameters, execute },'}</div>
      <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: t.accent }}>draftEmail</span>: {'{ parameters, execute },'}</div>
      <div>&nbsp;&nbsp;{'},'}</div>
      <div>&nbsp;&nbsp;messages,</div>
      <div>{'});'}</div>
      <div style={{ marginTop: 10, color: t.inkDim }}>// org-scoped. credits tracked. you ship it.</div>
    </div>
  );
  return (
    <div style={wrap}>
      <div style={{ color: t.inkDim }}>// project structure — features/&lt;name&gt;/ every time</div>
      <div>features/</div>
      <div>&nbsp;&nbsp;tasks/</div>
      <div>&nbsp;&nbsp;&nbsp;&nbsp;actions/   <span style={{ color: t.inkDim }}>// server actions</span></div>
      <div>&nbsp;&nbsp;&nbsp;&nbsp;components/</div>
      <div>&nbsp;&nbsp;&nbsp;&nbsp;server/    <span style={{ color: t.inkDim }}>// data access</span></div>
      <div>&nbsp;&nbsp;&nbsp;&nbsp;schemas/   <span style={{ color: t.inkDim }}>// zod</span></div>
      <div>&nbsp;&nbsp;&nbsp;&nbsp;types/</div>
      <div>&nbsp;&nbsp;billing/ · assistant/ · auth/ · organizations/</div>
      <div style={{ marginTop: 12, color: t.inkDim }}>// every feature same shape. every time.</div>
    </div>
  );
}

// ─────────────────────────────────────────
// CODE PROOF — gate a feature in 1 line
function CodeProof() {
  return (
    <div style={{ padding: '110px 40px', background: t.surface, borderTop: `1px solid ${t.line}`, borderBottom: `1px solid ${t.line}` }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Eyebrow n="03">THE MOAT, IN CODE</Eyebrow>
        <H2 style={{ maxWidth: 780 }}>
          Gate a feature. One line. <SerifAccent>One source of truth.</SerifAccent>
        </H2>
        <p style={{ fontSize: 16, color: t.inkSoft, marginTop: 20, maxWidth: 620, lineHeight: 1.55 }}>
          No sprawling permission system. No feature-flag SaaS. Capabilities live in one config file —
          Stripe picks the plan, your config decides what it unlocks.
        </p>

        <div style={{ marginTop: 40, background: '#08080a', border: `1px solid ${t.line}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', background: '#0d0d10', borderBottom: `1px solid ${t.line}`, display: 'flex', gap: 6, fontFamily: t.mono, fontSize: 11, color: t.inkSoft }}>
            <span style={{ width: 9, height: 9, borderRadius: 999, background: '#ff5f57' }}/>
            <span style={{ width: 9, height: 9, borderRadius: 999, background: '#febc2e' }}/>
            <span style={{ width: 9, height: 9, borderRadius: 999, background: '#28c840' }}/>
            <span style={{ marginLeft: 14 }}>features/tasks/actions/export.ts</span>
          </div>
          <div style={{ padding: '22px 24px', fontFamily: t.mono, fontSize: 14, lineHeight: 1.75, color: t.ink }}>
            <div style={{ color: t.inkDim }}>{'// Block the feature if the plan doesn\'t include it.'}</div>
            <div style={{ color: t.inkDim }}>{'// Enforce usage quota. Done.'}</div>
            <div>&nbsp;</div>
            <div><span style={{ color: '#c594c5' }}>"use server"</span>;</div>
            <div>&nbsp;</div>
            <div><span style={{ color: '#c594c5' }}>export async function</span> <span style={{ color: '#7cafc2' }}>exportTasks</span>() {'{'}</div>
            <div>&nbsp;&nbsp;<span style={{ color: '#c594c5' }}>const</span> {'{ planId, usage }'} = <span style={{ color: '#c594c5' }}>await</span> <span style={{ color: '#7cafc2' }}>getOrgEntitlements</span>();</div>
            <div>&nbsp;</div>
            <div>&nbsp;&nbsp;<span style={{ color: '#7cafc2' }}>assertCapability</span>(planId, <span style={{ color: t.accent2 }}>"task.export"</span>);</div>
            <div>&nbsp;&nbsp;<span style={{ color: '#7cafc2' }}>assertLimit</span>(planId, <span style={{ color: t.accent2 }}>"tasksPerMonth"</span>, usage.tasks);</div>
            <div>&nbsp;</div>
            <div>&nbsp;&nbsp;<span style={{ color: '#c594c5' }}>return</span> <span style={{ color: '#7cafc2' }}>generateCsv</span>();</div>
            <div>{'}'}</div>
          </div>
        </div>

        <div style={{ marginTop: 18, fontFamily: t.mono, fontSize: 12, color: t.inkSoft, letterSpacing: 0.5, textAlign: 'center' }}>
          <span style={{ color: t.accent }}>Stripe decides which plan is active.</span>
          &nbsp;&nbsp;Your config decides what that plan gives.
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// WEEKEND — timeline
function Weekend() {
  return (
    <div style={{ padding: '110px 40px' }}>
      <div style={{ maxWidth: MAX, margin: '0 auto' }}>
        <Eyebrow n="04">FROM PAY TO SHIP</Eyebrow>
        <H2 style={{ maxWidth: 760 }}>
          From Stripe checkout to production <SerifAccent>in one weekend</SerifAccent>.
        </H2>

        <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: t.line, border: `1px solid ${t.line}`, borderRadius: 12, overflow: 'hidden' }}>
          {[
            { t: '00:00', h: 'Pay', d: 'Stripe checkout. One-time payment. No seat math, no sales call.' },
            { t: '00:02', h: 'Get the repo', d: 'Your GitHub is invited to the private repo. Full source, full history, commercial license.' },
            { t: '00:10', h: 'Run locally', d: 'pnpm setup walks you through every env var. Migrate, seed, and localhost is up with auth + multi-tenant + Stripe + AI.' },
            { t: 'SUN', h: 'Deploy demo', d: 'Vercel button provisions a Neon Postgres. DEMO_MODE gives you a public instance prospects can try without breaking.' },
          ].map((s, i) => (
            <div key={s.h} style={{ background: t.bg, padding: '28px 24px' }}>
              <div style={{ display: 'flex', alignItems:'center', gap: 10 }}>
                <span style={{ width: 28, height: 28, borderRadius: 999, background: t.accent, color: '#fff', display: 'grid', placeItems: 'center', fontFamily: t.mono, fontSize: 11, fontWeight: 600 }}>{i+1}</span>
                <span style={{ fontFamily: t.mono, fontSize: 11, letterSpacing: 1.5, color: t.inkSoft }}>{s.t}</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: -0.4, marginTop: 16 }}>{s.h}</div>
              <div style={{ fontSize: 13, color: t.inkSoft, marginTop: 8, lineHeight: 1.55 }}>{s.d}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 30, background: '#08080a', border: `1px solid ${t.line}`, borderRadius: 12, padding: '18px 22px', fontFamily: t.mono, fontSize: 13, color: '#d5d0c4', lineHeight: 1.8 }}>
          <div><span style={{ color: t.inkDim }}>$</span> git clone git@github.com:acme/app.git && <span style={{ color: t.inkDim }}>cd</span> app</div>
          <div><span style={{ color: t.inkDim }}>$</span> pnpm install && pnpm setup</div>
          <div style={{ color: t.inkSoft, fontSize: 12, paddingLeft: 18 }}>? POSTGRES_URL · ? AUTH_SECRET · ? STRIPE_SECRET_KEY · ? RESEND_API_KEY · ? GOOGLE_AI_KEY</div>
          <div><span style={{ color: t.inkDim }}>$</span> pnpm db:migrate && pnpm db:seed && pnpm dev</div>
          <div style={{ marginTop: 6 }}><span style={{ color: t.accent }}>▲</span> ready at <span style={{ color: t.accent2 }}>http://localhost:3000</span>   <span style={{ color: t.inkDim }}>·</span> demo@starter.local / demo123</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// STACK
function Stack() {
  const rows = [
    ['Framework','Next.js 16','App Router · Turbopack · React 19'],
    ['Language','TypeScript','Strict mode. Every boundary typed.'],
    ['UI','Tailwind 4 + shadcn/ui','Radix primitives. ai-elements for the assistant.'],
    ['Auth','Better Auth','DB sessions, magic link, OAuth, org plugin.'],
    ['Database','PostgreSQL + Prisma','Multi-file schema in prisma/models/.'],
    ['Payments','Stripe','Checkout, portal, webhooks, trials, automatic tax.'],
    ['AI','Vercel AI SDK','Google, OpenAI, Groq. Tool calling. Streaming.'],
    ['Email','Resend + React Email','Typed templates, dev preview.'],
    ['Validation','Zod','Input parsing at every server boundary.'],
    ['Testing','Vitest + Playwright','Unit + e2e. Real examples included.'],
  ];
  return (
    <div style={{ padding: '110px 40px', borderTop: `1px solid ${t.line}`, background: t.surface }}>
      <div style={{ maxWidth: MAX, margin: '0 auto' }}>
        <Eyebrow n="05">THE STACK</Eyebrow>
        <H2 style={{ maxWidth: 820 }}>
          2026 defaults. <SerifAccent>No legacy you'd have ripped out anyway.</SerifAccent>
        </H2>

        <div style={{ marginTop: 48, border: `1px solid ${t.line}`, borderRadius: 12, background: t.bg, overflow: 'hidden' }}>
          {rows.map((r, i) => (
            <div key={r[0]} style={{
              display: 'grid', gridTemplateColumns: '160px 220px 1fr 60px',
              gap: 24, alignItems: 'center', padding: '18px 24px',
              borderBottom: i < rows.length - 1 ? `1px solid ${t.line}` : 'none',
            }}>
              <span style={{ fontFamily: t.mono, fontSize: 11, color: t.inkSoft, letterSpacing: 1.2 }}>{r[0].toUpperCase()}</span>
              <span style={{ fontSize: 16, fontWeight: 500 }}>{r[1]}</span>
              <span style={{ fontSize: 13.5, color: t.inkSoft }}>{r[2]}</span>
              <span style={{ fontFamily: t.mono, fontSize: 11, color: t.accent, textAlign: 'right' }}>{String(i+1).padStart(2,'0')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// COMPARE
function Compare() {
  const cols = [
    {
      t: 'Light starters',
      s: 'ShipFast, basic boilerplates',
      items: [
        ['Auth', 'NextAuth basics, no org model'],
        ['Multi-tenant', 'You add it later'],
        ['Plan gating', 'If/else on stripe.status'],
        ['AI', 'Optional add-on, untyped'],
        ['Admin', 'Not included'],
        ['Demo mode', 'Roll your own'],
      ],
    },
    {
      t: 'Heavy enterprise kits',
      s: 'Nx monorepos, over-framework\'d',
      items: [
        ['Auth', 'Ten abstractions deep'],
        ['Multi-tenant', 'Rigid, hard to modify'],
        ['Plan gating', 'Full RBAC you don\'t need'],
        ['AI', 'Not there or tacked on'],
        ['Admin', 'Heavy, opinionated wrong'],
        ['Demo mode', 'Not the use case'],
      ],
    },
    {
      t: 'Tenviq',
      s: 'Right-sized B2B starter',
      accent: true,
      items: [
        ['Auth', 'Better Auth + org plugin'],
        ['Multi-tenant', 'From day one, scoped queries'],
        ['Plan gating', 'Capabilities + limits config'],
        ['AI', 'Tool calling, first-class'],
        ['Admin', 'Real surfaces, already built'],
        ['Demo mode', 'DEMO_MODE=true ships it'],
      ],
    },
  ];
  return (
    <div style={{ padding: '110px 40px' }}>
      <div style={{ maxWidth: MAX, margin: '0 auto' }}>
        <Eyebrow n="06">WHERE TENVIQ FITS</Eyebrow>
        <H2 style={{ maxWidth: 820 }}>
          Between "too light to keep" and <SerifAccent>"too heavy to use".</SerifAccent>
        </H2>

        <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: t.line, border: `1px solid ${t.line}`, borderRadius: 12, overflow: 'hidden' }}>
          {cols.map(col => (
            <div key={col.t} style={{
              background: col.accent ? '#13100f' : t.bg,
              padding: '28px 24px 30px',
              borderTop: col.accent ? `2px solid ${t.accent}` : 'none',
            }}>
              <div style={{ fontFamily: t.mono, fontSize: 10.5, letterSpacing: 1.5, color: col.accent ? t.accent : t.inkSoft }}>
                {col.accent ? '● YOU HERE' : col.s.toUpperCase()}
              </div>
              <div style={{ fontSize: 22, fontWeight: 500, marginTop: 10, letterSpacing: -0.4 }}>{col.t}</div>
              <div style={{ marginTop: 20, borderTop: `1px solid ${t.line}`, paddingTop: 12 }}>
                {col.items.map(([k, v]) => (
                  <div key={k} style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 10, padding: '8px 0', fontSize: 12.5, borderBottom: `1px solid ${t.line}` }}>
                    <span style={{ color: t.inkSoft, fontFamily: t.mono, letterSpacing: 1 }}>{k.toUpperCase()}</span>
                    <span style={{ color: col.accent ? t.ink : t.inkSoft }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// PRICING
function Pricing() {
  const tiers = [
    { t: 'Founding', p: '99', s: '20 seats · 8 left', hl: true, cta: 'Claim a founding seat →',
      bullets: ['Direct input on what ships next', 'Lifetime updates', 'Private GitHub access today', 'Unlimited products', 'Commercial license', '1 developer seat'] },
    { t: 'Early access', p: '149', s: 'Next tier · coming soon', cta: 'Notify me',
      bullets: ['Lifetime updates', 'Private GitHub access', 'Unlimited products', 'Commercial license', '1 developer seat'] },
    { t: 'Standard', p: '249', s: 'Permanent price', cta: 'Notify me',
      bullets: ['Lifetime updates', 'Private GitHub access', 'Unlimited products', 'Commercial license', '1 developer seat'] },
  ];
  return (
    <div style={{ padding: '110px 40px', background: t.surface, borderTop: `1px solid ${t.line}`, borderBottom: `1px solid ${t.line}` }}>
      <div style={{ maxWidth: MAX, margin: '0 auto' }}>
        <Eyebrow n="07">PRICING</Eyebrow>
        <H2 style={{ maxWidth: 820 }}>
          One payment. <SerifAccent>Lifetime updates.</SerifAccent>
        </H2>
        <p style={{ fontSize: 16, color: t.inkSoft, marginTop: 18, maxWidth: 620, lineHeight: 1.55 }}>
          The product is production-ready today. The price is early because you are. It only goes up.
        </p>

        <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {tiers.map(tier => (
            <div key={tier.t} style={{
              padding: 28, borderRadius: 14,
              background: tier.hl ? '#141110' : t.bg,
              border: `1px solid ${tier.hl ? t.accent : t.line}`,
              position: 'relative',
              boxShadow: tier.hl ? '0 20px 60px -20px rgba(255,106,74,0.3)' : 'none',
            }}>
              {tier.hl && (
                <div style={{ position: 'absolute', top: -11, left: 24, padding: '4px 12px', background: t.accent, color: '#fff', fontFamily: t.mono, fontSize: 10, letterSpacing: 1.5, borderRadius: 999 }}>
                  HELP US LAUNCH
                </div>
              )}
              <div style={{ fontFamily: t.mono, fontSize: 11, letterSpacing: 1.5, color: tier.hl ? t.accent : t.inkSoft }}>{tier.s.toUpperCase()}</div>
              <div style={{ fontSize: 22, fontWeight: 500, marginTop: 10 }}>{tier.t}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 22 }}>
                <div style={{ fontSize: 22, fontWeight: 500, color: tier.hl ? t.accent : t.ink }}>$</div>
                <div style={{ fontSize: 64, fontWeight: 500, letterSpacing: -3, lineHeight: 1, color: tier.hl ? t.accent : t.ink }}>{tier.p}</div>
                <div style={{ fontFamily: t.mono, fontSize: 11, letterSpacing: 1.5, color: t.inkSoft, marginLeft: 6 }}>ONE-TIME</div>
              </div>
              <div style={{ marginTop: 20, borderTop: `1px solid ${t.line}`, paddingTop: 16 }}>
                {tier.bullets.map(b => (
                  <div key={b} style={{ display: 'flex', gap: 10, padding: '6px 0', fontSize: 13 }}>
                    <span style={{ color: t.accent, flexShrink: 0, fontWeight: 600 }}>✓</span>
                    <span style={{ color: t.ink }}>{b}</span>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: 22, padding: '12px 16px', textAlign: 'center',
                borderRadius: 8, fontSize: 14, fontWeight: 500,
                background: tier.hl ? t.accent : 'transparent',
                color: tier.hl ? '#fff' : t.ink,
                border: tier.hl ? 'none' : `1px solid ${t.line}`,
              }}>{tier.cta}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, fontSize: 13, color: t.inkSoft }}>
          <div><strong style={{ color: t.ink, display:'block', marginBottom: 4 }}>Try before you buy.</strong>Full live demo. Click every button before paying.</div>
          <div><strong style={{ color: t.ink, display:'block', marginBottom: 4 }}>Private GitHub access.</strong>Added to the repo the moment the payment clears.</div>
          <div><strong style={{ color: t.ink, display:'block', marginBottom: 4 }}>Lifetime updates.</strong>Every future release pushed to your repo. No renewals.</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// FAQ
function Faq() {
  const [open, setOpen] = React.useState(0);
  const items = [
    { q: 'Why is the price so low right now?', a: 'Tenviq is production-ready today. The founding price exists because direct feedback from the first 20 builders is worth more than an extra $150 up front. We also want to quote them credibly once we raise to $149, then $249 permanently. Once the 20 founding seats are gone, the price moves to $149, then $249.' },
    { q: 'Is this just a boilerplate?', a: 'No. It\'s a full product shell. Multi-tenant orgs, Stripe with capability-based plan gating, an admin surface, an AI assistant with tool calling, and docs. It already looks and behaves like a product you can demo and sell.' },
    { q: 'Who is Tenviq for?', a: 'Technical founders, indie hackers and small teams (2–5) shipping B2B SaaS or AI products who want a serious foundation without a heavy framework. If you\'re tired of rebuilding auth, orgs, billing and admin every new project, you\'re the buyer.' },
    { q: 'Who is it NOT for?', a: 'You only need a landing page + Stripe button for a simple solo MVP, you want a massive enterprise framework with plugins and ceremony, or you\'re shopping for the cheapest starter instead of the clearest one to extend.' },
    { q: 'What do I get when I buy?', a: 'Private GitHub access the moment the payment clears, full source with history, a commercial license, lifetime updates pushed to the repo, and access to the live demo build.' },
    { q: 'Can I use it for client work?', a: 'Yes — unlimited products under your single developer seat, including client projects. You cannot redistribute or resell the source itself. See LICENSE for full terms.' },
    { q: 'Do I get future updates?', a: 'Yes. Every release goes straight to your private fork. No subscription, no renewals.' },
    { q: 'Do you offer refunds?', a: 'Because it\'s source-available the moment you buy, we don\'t offer refunds after repo access is granted. That\'s why the live demo is full-fidelity — click every button before you pay.' },
  ];
  return (
    <div style={{ padding: '110px 40px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Eyebrow n="08">FAQ</Eyebrow>
        <H2 style={{ maxWidth: 700 }}>
          Questions, <SerifAccent>answered</SerifAccent>.
        </H2>

        <div style={{ marginTop: 40, border: `1px solid ${t.line}`, borderRadius: 12, background: t.surface, overflow: 'hidden' }}>
          {items.map((it, i) => (
            <div key={i} style={{ borderBottom: i < items.length-1 ? `1px solid ${t.line}` : 'none' }}>
              <div onClick={() => setOpen(open === i ? -1 : i)} style={{
                padding: '20px 24px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 16,
              }}>
                <span style={{ fontFamily: t.mono, fontSize: 11, color: t.accent, letterSpacing: 1, width: 24 }}>{String(i+1).padStart(2,'0')}</span>
                <span style={{ fontSize: 16, fontWeight: 500, flex: 1 }}>{it.q}</span>
                <span style={{ fontSize: 22, color: t.inkSoft }}>{open === i ? '–' : '+'}</span>
              </div>
              {open === i && (
                <div style={{ padding: '0 24px 24px 64px', fontSize: 14.5, color: t.inkSoft, lineHeight: 1.6 }}>
                  {it.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// FINAL CTA
function FinalCta() {
  return (
    <div style={{ padding: '110px 40px 90px', textAlign: 'center', borderTop: `1px solid ${t.line}`, background: t.surface, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 60% at 50% 100%, rgba(255,106,74,0.2), transparent 70%)', pointerEvents: 'none' }}/>
      <div style={{ position: 'relative', maxWidth: 820, margin: '0 auto' }}>
        <div style={{ fontFamily: t.mono, fontSize: 11, letterSpacing: 2, color: t.accent }}>● 8/20 FOUNDING SEATS LEFT</div>
        <h3 style={{ fontSize: 56, fontWeight: 500, letterSpacing: -1.8, margin: '22px 0 0', lineHeight: 1.05, textWrap: 'balance' }}>
          Claim a founding seat at <SerifAccent color={t.accent}>$99</SerifAccent>, then build the part that's actually yours.
        </h3>
        <p style={{ fontSize: 16, color: t.inkSoft, marginTop: 22, maxWidth: 560, margin: '22px auto 0' }}>
          Skip the weeks of auth, orgs, billing, admin and AI wiring. Start from a base you can actually understand and sell from.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 32 }}>
          <PrimaryBtn>Claim a founding seat · $99 →</PrimaryBtn>
          <GhostBtn>Try the live demo</GhostBtn>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// FOOTER
function Footer() {
  return (
    <div style={{ padding: '50px 40px 36px', borderTop: `1px solid ${t.line}` }}>
      <div style={{ maxWidth: MAX, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 40 }}>
        <div>
          <Logo/>
          <div style={{ fontSize: 13, color: t.inkSoft, marginTop: 14, lineHeight: 1.55, maxWidth: 280 }}>
            The Next.js SaaS starter for technical founders building real B2B products.
          </div>
        </div>
        {[
          ['Product', ['Live demo','What ships','Stack','Pricing']],
          ['Resources', ['Docs','Changelog','License','Blog']],
          ['Legal', ['Privacy','Terms','Contact']],
        ].map(([h, ls]) => (
          <div key={h}>
            <div style={{ fontFamily: t.mono, fontSize: 11, letterSpacing: 1.5, color: t.inkSoft, marginBottom: 14 }}>{h.toUpperCase()}</div>
            {ls.map(l => <div key={l} style={{ fontSize: 13, color: t.ink, padding: '4px 0' }}>{l}</div>)}
          </div>
        ))}
      </div>
      <div style={{ maxWidth: MAX, margin: '36px auto 0', paddingTop: 20, borderTop: `1px solid ${t.line}`, display: 'flex', justifyContent: 'space-between', fontFamily: t.mono, fontSize: 11, letterSpacing: 1.5, color: t.inkDim }}>
        <span>© 2026 TENVIQ · ALL RIGHTS RESERVED</span>
        <span>EDITION 2026</span>
      </div>
    </div>
  );
}

Object.assign(window, {
  TopBar, Hero, HeroApp, Moat, Inside, FeaturePreview, CodeProof, Weekend, Stack, Compare, Pricing, Faq, FinalCta, Footer,
});
