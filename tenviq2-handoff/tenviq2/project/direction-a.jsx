// Direction A — Editorial / Product-led light
// Warm cream background, Fraunces serif display, generous whitespace.
// Message: "The B2B starter, made with care."
// Target: technical founder tired of noisy dev templates.

const aStyles = {
  bg: '#f4efe6',
  surface: '#faf7f0',
  ink: '#1a1815',
  inkSoft: '#5b564e',
  line: '#e3ddd0',
  accent: '#c94f2a',
  accent2: '#2a4a3f',
  serif: "'Fraunces', Georgia, serif",
  sans: "'Geist', system-ui, sans-serif",
  mono: "'Geist Mono', ui-monospace, monospace",
};

function ALabel({ n, children }) {
  return (
    <div style={{
      fontFamily: aStyles.mono, fontSize: 11, letterSpacing: 2,
      color: aStyles.inkSoft, textTransform: 'uppercase',
      display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'center', marginBottom: 24,
    }}>
      <span style={{ width: 28, height: 1, background: aStyles.accent }} />
      <span>{n}</span>
      <span>·</span>
      <span>{children}</span>
      <span style={{ width: 28, height: 1, background: aStyles.accent }} />
    </div>
  );
}

function DirectionA() {
  return (
    <div style={{ width: '100%', background: aStyles.bg, color: aStyles.ink, fontFamily: aStyles.sans }}>
      {/* NAV */}
      <div style={{ display:'flex', alignItems:'center', padding: '24px 56px', borderBottom: `1px solid ${aStyles.line}` }}>
        <TenviqMark color={aStyles.ink} size={22} />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 32, fontSize: 14, color: aStyles.inkSoft }}>
          <a>What's inside</a><a>Pricing</a><a>Live demo</a><a>Docs</a>
        </div>
        <div style={{ display:'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: aStyles.inkSoft }}>Sign in</span>
          <span style={{ padding: '9px 16px', background: aStyles.ink, color: aStyles.bg, borderRadius: 999, fontSize: 13, fontWeight: 500 }}>
            Claim a founding seat · $99
          </span>
        </div>
      </div>

      {/* HERO */}
      <div style={{ padding: '90px 56px 60px', textAlign: 'center', maxWidth: 1040, margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '7px 16px', borderRadius: 999,
          background: aStyles.surface, border: `1px solid ${aStyles.line}`,
          fontFamily: aStyles.mono, fontSize: 11, letterSpacing: 1.5, color: aStyles.inkSoft,
          marginBottom: 32,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: aStyles.accent }} />
          <span>20 FOUNDING SEATS · $99 · GOES TO $149 AFTER</span>
        </div>

        <h1 style={{
          fontFamily: aStyles.serif, fontWeight: 400,
          fontSize: 78, lineHeight: 1.02, letterSpacing: -2,
          margin: 0,
        }}>
          Ship a B2B SaaS<br/>
          your <em style={{ fontStyle: 'italic', color: aStyles.accent }}>first enterprise</em> customer<br/>
          will take seriously.
        </h1>

        <p style={{
          fontSize: 19, lineHeight: 1.55, color: aStyles.inkSoft,
          maxWidth: 620, margin: '32px auto 0',
          textWrap: 'pretty',
        }}>
          Tenviq is a Next.js starter for founders who keep rebuilding the same auth,
          billing, org and admin plumbing. One weekend. One clean, conventional codebase.
          No cognitive debt.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 36 }}>
          <span style={{
            padding: '14px 24px', background: aStyles.ink, color: aStyles.bg,
            borderRadius: 999, fontSize: 15, fontWeight: 500,
            display: 'inline-flex', alignItems: 'center', gap: 10,
          }}>
            Claim a founding seat · $99
            <span style={{ fontSize: 18 }}>→</span>
          </span>
          <span style={{
            padding: '14px 24px', background: 'transparent', color: aStyles.ink,
            border: `1px solid ${aStyles.ink}`,
            borderRadius: 999, fontSize: 15, fontWeight: 500,
          }}>
            Open the live demo
          </span>
        </div>

        <div style={{ marginTop: 36, fontFamily: aStyles.mono, fontSize: 11, letterSpacing: 1.5, color: aStyles.inkSoft }}>
          NEXT.JS 15 · TYPESCRIPT · PRISMA · AUTH.JS · STRIPE · SHADCN
        </div>
      </div>

      {/* PRODUCT SHOT */}
      <div style={{ padding: '40px 56px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <BrowserChrome url="app.tenviq.dev / acme-corp" bg={aStyles.surface} border={aStyles.line}>
            <DashboardMockup theme="light" accent={aStyles.accent} />
          </BrowserChrome>
          <div style={{
            marginTop: 18, display: 'flex', justifyContent: 'space-between',
            fontFamily: aStyles.mono, fontSize: 11, color: aStyles.inkSoft, letterSpacing: 1.5,
          }}>
            <span>FIG. 01 — MULTI-TENANT DASHBOARD, DAY ONE</span>
            <span>LIVE DEMO — APP.TENVIQ.DEV</span>
          </div>
        </div>
      </div>

      {/* PROBLEM — editorial pullquote */}
      <div style={{ padding: '100px 56px', background: aStyles.surface, borderTop: `1px solid ${aStyles.line}`, borderBottom: `1px solid ${aStyles.line}` }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <ALabel n="01">THE STARTER PROBLEM</ALabel>
          <h2 style={{
            fontFamily: aStyles.serif, fontWeight: 400,
            fontSize: 52, lineHeight: 1.1, letterSpacing: -1,
            textAlign: 'center', margin: 0,
          }}>
            You keep <em style={{ color: aStyles.accent }}>rebuilding</em> the same starter,<br/>
            and you keep <em style={{ color: aStyles.accent }}>losing</em> it.
          </h2>
          <p style={{
            fontSize: 18, color: aStyles.inkSoft, textAlign: 'center',
            maxWidth: 640, margin: '28px auto 0', lineHeight: 1.6,
          }}>
            Every new idea starts the same way. New repo. Reinstall auth. Re-wire Stripe.
            Re-pick the same libraries you always pick. Re-argue the same conventions.
            By the time you reach the feature that matters, the template is already a mess.
          </p>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24,
            marginTop: 64,
          }}>
            {[
              { k: '~180h', l: 'Auth + org model + billing, wired from scratch' },
              { k: '6+ libs', l: 'Re-chosen every time, never the same twice' },
              { k: '0 convention', l: 'Every project diverges by week two' },
            ].map(s => (
              <div key={s.k} style={{ textAlign:'center', padding: '0 12px' }}>
                <div style={{ fontFamily: aStyles.serif, fontStyle:'italic', fontSize: 44, color: aStyles.accent, lineHeight: 1 }}>{s.k}</div>
                <div style={{ marginTop: 12, fontSize: 14, color: aStyles.inkSoft }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WHAT'S INSIDE — index-style */}
      <div style={{ padding: '100px 56px' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <ALabel n="02">INSIDE THE STARTER</ALabel>
          <h2 style={{
            fontFamily: aStyles.serif, fontWeight: 400,
            fontSize: 52, lineHeight: 1.1, letterSpacing: -1,
            textAlign: 'center', margin: 0,
          }}>
            The B2B plumbing,<br/>already <em style={{ color: aStyles.accent }}>opinionated for you</em>.
          </h2>

          <div style={{
            marginTop: 64,
            border: `1px solid ${aStyles.line}`, borderRadius: 14, background: aStyles.surface,
            overflow: 'hidden',
          }}>
            {[
              ['01','Auth','Email + password, OAuth, magic links, 2FA. Sessions and device management.'],
              ['02','Organizations','Multi-tenant from day one. Invites, roles, per-org data.'],
              ['03','Billing','Stripe checkout, portal, usage metering, yearly & monthly plans.'],
              ['04','Admin','Users, impersonation, activity stream, role-gated routes.'],
              ['05','AI','Drop-in assistant with tool calls, streaming chat, saved conversations.'],
              ['06','DX','Typed routes, Prisma schema, seed data, email templates, tidy docs.'],
            ].map((r, i, arr) => (
              <div key={r[0]} style={{
                display: 'grid', gridTemplateColumns: '60px 180px 1fr 120px',
                gap: 24, alignItems: 'center', padding: '22px 28px',
                borderBottom: i < arr.length - 1 ? `1px solid ${aStyles.line}` : 'none',
              }}>
                <span style={{ fontFamily: aStyles.mono, fontSize: 12, color: aStyles.inkSoft, letterSpacing: 1 }}>{r[0]}</span>
                <span style={{ fontFamily: aStyles.serif, fontSize: 22, letterSpacing: -0.3 }}>{r[1]}</span>
                <span style={{ fontSize: 14, color: aStyles.inkSoft, lineHeight: 1.5 }}>{r[2]}</span>
                <span style={{ fontFamily: aStyles.mono, fontSize: 11, color: aStyles.accent, textAlign:'right', letterSpacing: 1.5 }}>VIEW →</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* THE WEEKEND — step-by-step */}
      <div style={{ padding: '100px 56px', background: aStyles.ink, color: aStyles.bg }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <div style={{
            fontFamily: aStyles.mono, fontSize: 11, letterSpacing: 2,
            color: '#c8beaa', textAlign: 'center', marginBottom: 24,
          }}>
            <span style={{ display:'inline-block', width: 28, height: 1, background: aStyles.accent, verticalAlign:'middle', marginRight: 14 }}/>
            03 · THE WEEKEND
            <span style={{ display:'inline-block', width: 28, height: 1, background: aStyles.accent, verticalAlign:'middle', marginLeft: 14 }}/>
          </div>
          <h2 style={{
            fontFamily: aStyles.serif, fontWeight: 400,
            fontSize: 52, lineHeight: 1.1, letterSpacing: -1,
            textAlign: 'center', margin: 0,
          }}>
            Friday evening to<br/>
            <em style={{ color: aStyles.accent }}>Sunday demo</em>.
          </h2>
          <p style={{ textAlign:'center', color: '#c8beaa', fontSize: 17, margin: '26px auto 0', maxWidth: 560 }}>
            No long onboarding. No enterprise hand-off. Pay, get dropped into your private repo, start shipping.
          </p>

          <div style={{ marginTop: 64, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: '#2a2620', border: `1px solid #2a2620`, borderRadius: 12, overflow:'hidden' }}>
            {[
              ['FRI 20:00', 'Pay', 'Stripe checkout. One payment, no seat math, no sales call.'],
              ['FRI 20:02', 'Repo', 'GitHub account added to the private repo. Full history, full license.'],
              ['SAT', 'Customize', 'Brand, schema, routes. Convention means you actually remember where things are.'],
              ['SUN', 'Demo', 'Multi-tenant. Stripe. Admin. AI. Real enough to open sales conversations.'],
            ].map(([t,h,d]) => (
              <div key={h} style={{ background: aStyles.ink, padding: '28px 24px' }}>
                <div style={{ fontFamily: aStyles.mono, fontSize: 10, color: aStyles.accent, letterSpacing: 1.5 }}>{t}</div>
                <div style={{ fontFamily: aStyles.serif, fontSize: 28, marginTop: 10 }}>{h}</div>
                <div style={{ fontSize: 13, color: '#c8beaa', marginTop: 10, lineHeight: 1.55 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRICING */}
      <div style={{ padding: '100px 56px' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <ALabel n="04">PRICING</ALabel>
          <h2 style={{
            fontFamily: aStyles.serif, fontWeight: 400,
            fontSize: 52, lineHeight: 1.1, letterSpacing: -1,
            textAlign: 'center', margin: 0,
          }}>
            One payment. <em style={{ color: aStyles.accent }}>Lifetime updates</em>.
          </h2>
          <p style={{ textAlign:'center', color: aStyles.inkSoft, fontSize: 17, maxWidth: 560, margin: '24px auto 0' }}>
            The product is production-ready. The price is early because you are.
          </p>

          <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { t: 'Founding', p: '$99', s: '8 of 20 seats left', hl: true,
                bullets: ['Direct input on what ships next', 'Lifetime updates', 'Auth, billing, teams, admin, AI, docs', 'Commercial license', 'Private GitHub access today'] },
              { t: 'Early access', p: '$149', s: 'After founding seats',
                bullets: ['Lifetime updates', 'Full codebase & unlimited products', '1 developer seat', 'Commercial license', 'Private GitHub access'] },
              { t: 'Standard', p: '$249', s: 'Permanent price',
                bullets: ['Lifetime updates', 'Full codebase & unlimited products', '1 developer seat', 'Commercial license', 'Private GitHub access'] },
            ].map((tier) => (
              <div key={tier.t} style={{
                padding: 28, borderRadius: 14,
                background: tier.hl ? aStyles.ink : aStyles.surface,
                color: tier.hl ? aStyles.bg : aStyles.ink,
                border: `1px solid ${tier.hl ? aStyles.ink : aStyles.line}`,
                position: 'relative',
              }}>
                {tier.hl && (
                  <div style={{
                    position:'absolute', top: -12, left: 24, padding: '4px 12px',
                    background: aStyles.accent, color: '#fff',
                    fontFamily: aStyles.mono, fontSize: 10, letterSpacing: 1.5, borderRadius: 999,
                  }}>HELP US LAUNCH</div>
                )}
                <div style={{ fontFamily: aStyles.serif, fontSize: 24 }}>{tier.t}</div>
                <div style={{ fontFamily: aStyles.mono, fontSize: 11, letterSpacing: 1.5, color: tier.hl ? '#c8beaa' : aStyles.inkSoft, marginTop: 4 }}>{tier.s.toUpperCase()}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 24 }}>
                  <div style={{ fontFamily: aStyles.serif, fontSize: 56, lineHeight: 1, color: tier.hl ? aStyles.accent : aStyles.ink }}>{tier.p}</div>
                  <div style={{ fontFamily: aStyles.mono, fontSize: 11, letterSpacing: 1.5, color: tier.hl ? '#c8beaa' : aStyles.inkSoft }}>ONE-TIME</div>
                </div>
                <div style={{ marginTop: 24, borderTop: `1px solid ${tier.hl ? '#2a2620' : aStyles.line}`, paddingTop: 20 }}>
                  {tier.bullets.map(b => (
                    <div key={b} style={{ display: 'flex', gap: 10, padding: '6px 0', fontSize: 13.5 }}>
                      <span style={{ color: aStyles.accent, flexShrink: 0 }}>✓</span>
                      <span style={{ color: tier.hl ? '#e5ddcb' : aStyles.ink }}>{b}</span>
                    </div>
                  ))}
                </div>
                <div style={{
                  marginTop: 24, padding: '12px 16px', textAlign: 'center',
                  borderRadius: 999, fontSize: 14, fontWeight: 500,
                  background: tier.hl ? aStyles.accent : 'transparent',
                  color: tier.hl ? '#fff' : aStyles.ink,
                  border: tier.hl ? 'none' : `1px solid ${aStyles.ink}`,
                }}>
                  {tier.hl ? 'Claim a founding seat →' : 'Notify me'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER CTA */}
      <div style={{ padding: '80px 56px 60px', background: aStyles.surface, borderTop: `1px solid ${aStyles.line}`, textAlign: 'center' }}>
        <div style={{ fontFamily: aStyles.mono, fontSize: 11, letterSpacing: 2, color: aStyles.inkSoft }}>STILL READING?</div>
        <h3 style={{ fontFamily: aStyles.serif, fontSize: 40, fontWeight: 400, margin: '18px 0 0', letterSpacing: -0.5 }}>
          The hard B2B parts, <em style={{ color: aStyles.accent }}>already done</em>.
        </h3>
        <div style={{ marginTop: 28 }}>
          <span style={{ padding: '14px 26px', background: aStyles.ink, color: aStyles.bg, borderRadius: 999, fontSize: 15, fontWeight: 500 }}>
            Claim a founding seat · $99 →
          </span>
        </div>
        <div style={{ marginTop: 60, display:'flex', justifyContent:'space-between', borderTop: `1px solid ${aStyles.line}`, paddingTop: 24, fontFamily: aStyles.mono, fontSize: 11, letterSpacing: 1.5, color: aStyles.inkSoft }}>
          <span>TENVIQ · EDITION 2026</span>
          <span>MADE FOR BUILDERS WHO KEEP THEIR REPOS TIDY</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DirectionA });
