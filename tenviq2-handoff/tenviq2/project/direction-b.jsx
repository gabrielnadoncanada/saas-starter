// Direction B — Product-first dark, documentation-quality
// Keeps the dark/coral DNA but reduces noise. One big product frame,
// short copy, more rhythm. Message: "See it. Buy it. Ship it."

const bStyles = {
  bg: '#0a0a0b',
  surface: '#111112',
  ink: '#f5f5f5',
  inkSoft: '#888',
  line: '#1f1f22',
  lineSoft: '#161618',
  accent: '#ff6a4a',
  accent2: '#ffc58b',
  sans: "'Geist', system-ui, sans-serif",
  mono: "'Geist Mono', ui-monospace, monospace",
  serif: "'Instrument Serif', Georgia, serif",
};

function BTag({ n, label }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      fontFamily: bStyles.mono, fontSize: 11, letterSpacing: 2,
      color: bStyles.inkSoft, textTransform: 'uppercase', marginBottom: 22,
    }}>
      <span style={{ color: bStyles.accent }}>{n}</span>
      <span style={{ width: 18, height: 1, background: bStyles.inkSoft, opacity: 0.4 }} />
      <span>{label}</span>
    </div>
  );
}

function DirectionB() {
  return (
    <div style={{ width: '100%', background: bStyles.bg, color: bStyles.ink, fontFamily: bStyles.sans }}>
      {/* Top announcement */}
      <div style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,106,74,0.14), transparent)',
        borderBottom: `1px solid ${bStyles.line}`,
        padding: '10px 24px', textAlign: 'center',
        fontFamily: bStyles.mono, fontSize: 11, letterSpacing: 1.5, color: bStyles.inkSoft,
      }}>
        <span style={{ color: bStyles.accent, fontWeight: 500 }}>● 8/20 FOUNDING SEATS LEFT</span>
        <span style={{ margin: '0 16px', opacity: 0.4 }}>—</span>
        <span>$99 TODAY · $149 ONCE SEATS ARE GONE</span>
      </div>

      {/* NAV */}
      <div style={{ display:'flex', alignItems:'center', padding: '20px 40px' }}>
        <TenviqMark color={bStyles.ink} size={20} />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 28, fontSize: 14, color: bStyles.inkSoft }}>
          <a>Product</a><a>What's inside</a><a>Pricing</a><a>Live demo</a><a>Docs</a>
        </div>
        <div style={{ display:'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: bStyles.inkSoft }}>Demo →</span>
          <span style={{ padding: '9px 14px', background: bStyles.accent, color: '#fff', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>
            Buy · $99
          </span>
        </div>
      </div>

      {/* HERO */}
      <div style={{ padding: '70px 40px 40px', textAlign: 'center', maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{
          fontFamily: bStyles.sans, fontWeight: 500,
          fontSize: 72, lineHeight: 1.04, letterSpacing: -2.5,
          margin: 0,
        }}>
          The B2B SaaS starter<br/>
          <span style={{ fontFamily: bStyles.serif, fontStyle:'italic', fontWeight: 400, color: bStyles.accent2 }}>
            you'll actually keep shipping from.
          </span>
        </h1>

        <p style={{
          fontSize: 18, lineHeight: 1.55, color: bStyles.inkSoft,
          maxWidth: 580, margin: '28px auto 0', textWrap: 'pretty',
        }}>
          Auth, organizations, Stripe, admin and AI — wired together with one set of
          conventions you won't throw away next project. Clone once. Reuse forever.
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 32 }}>
          <span style={{
            padding: '13px 22px', background: bStyles.accent, color: '#fff',
            borderRadius: 8, fontSize: 14.5, fontWeight: 500,
            display: 'inline-flex', alignItems: 'center', gap: 10,
            boxShadow: '0 12px 40px -10px rgba(255,106,74,0.6)',
          }}>
            Claim a founding seat · $99 <span>→</span>
          </span>
          <span style={{
            padding: '13px 22px', background: 'transparent', color: bStyles.ink,
            border: `1px solid ${bStyles.line}`,
            borderRadius: 8, fontSize: 14.5, fontWeight: 500,
          }}>
            Open the live demo
          </span>
        </div>

        <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center', gap: 28, fontFamily: bStyles.mono, fontSize: 10.5, letterSpacing: 1.5, color: '#555' }}>
          <span>NEXT.JS 15</span><span>·</span><span>TYPESCRIPT</span><span>·</span><span>PRISMA</span><span>·</span><span>AUTH.JS</span><span>·</span><span>STRIPE</span><span>·</span><span>SHADCN</span><span>·</span><span>VERCEL AI</span>
        </div>
      </div>

      {/* HERO PRODUCT */}
      <div style={{ padding: '20px 40px 60px', position: 'relative' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255,106,74,0.14), transparent 70%)',
          pointerEvents: 'none',
        }}/>
        <div style={{ maxWidth: 1160, margin: '0 auto', position: 'relative' }}>
          <BrowserChrome url="app.tenviq.dev / acme-corp / overview" bg={bStyles.surface} border={bStyles.line}>
            <DashboardMockup theme="dark" accent={bStyles.accent} />
          </BrowserChrome>
        </div>
      </div>

      {/* METRICS STRIP */}
      <div style={{ padding: '60px 40px', borderTop: `1px solid ${bStyles.line}`, borderBottom: `1px solid ${bStyles.line}` }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40 }}>
          {[
            ['~180h', 'of B2B plumbing already wired'],
            ['8 surfaces', 'dashboard · members · billing · admin · AI · settings · activity · invites'],
            ['1 weekend', 'from clone to live demo'],
            ['1 convention', 'across every project you start'],
          ].map(([k, l]) => (
            <div key={k}>
              <div style={{ fontFamily: bStyles.sans, fontSize: 40, fontWeight: 500, letterSpacing: -1, color: bStyles.accent }}>{k}</div>
              <div style={{ fontSize: 13, color: bStyles.inkSoft, marginTop: 6, lineHeight: 1.5 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURE SCREENS — thumbnails */}
      <div style={{ padding: '100px 40px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <BTag n="01" label="WHAT'S INSIDE" />
          <h2 style={{ fontSize: 48, fontWeight: 500, letterSpacing: -1.4, margin: 0, maxWidth: 720, lineHeight: 1.05 }}>
            Every B2B surface your buyers expect — <span style={{ fontFamily: bStyles.serif, fontStyle: 'italic', color: bStyles.inkSoft, fontWeight: 400 }}>on day one.</span>
          </h2>

          <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              ['Dashboard','Overview, activity, KPIs, usage'],
              ['Members','Invites, roles, impersonation'],
              ['Billing','Stripe checkout, portal, usage metering'],
              ['Admin panel','Audit log, user search, soft delete'],
              ['AI assistant','Streaming chat, tool calls, artifacts'],
              ['Settings','Org, personal, security, API keys'],
            ].map(([t, d], i) => (
              <div key={t} style={{
                border: `1px solid ${bStyles.line}`, borderRadius: 10,
                background: bStyles.surface, overflow: 'hidden',
              }}>
                <div style={{
                  height: 180, background: '#0d0d0f',
                  backgroundImage: `repeating-linear-gradient(135deg, rgba(255,255,255,0.015) 0 2px, transparent 2px 10px)`,
                  borderBottom: `1px solid ${bStyles.line}`, position: 'relative',
                }}>
                  {/* Stylized mini ui */}
                  <div style={{ position:'absolute', top: 10, left: 10, right: 10, display: 'flex', gap: 6 }}>
                    {[0,1,2].map(j => <span key={j} style={{ width: 8, height: 8, borderRadius:999, background: '#2a2a2a' }} />)}
                  </div>
                  <div style={{ position:'absolute', top: 32, left: 14, width: '60%', height: 8, background: '#2a2a2a', borderRadius: 2 }}/>
                  <div style={{ position:'absolute', top: 48, left: 14, width: '40%', height: 6, background: '#1f1f1f', borderRadius: 2 }}/>
                  <div style={{ position:'absolute', top: 72, left: 14, right: 14, height: 80, background: '#141416', border:`1px solid ${bStyles.line}`, borderRadius: 4 }}>
                    <div style={{ padding: 10 }}>
                      <div style={{ width: 30, height: 6, background: '#333', marginBottom: 8 }}/>
                      <div style={{ width: 60, height: 14, background: bStyles.accent, opacity: 0.8 }}/>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{t}</div>
                    <div style={{ fontSize: 12, color: bStyles.inkSoft, marginTop: 2 }}>{d}</div>
                  </div>
                  <div style={{ fontFamily: bStyles.mono, fontSize: 10, letterSpacing: 1.2, color: bStyles.accent }}>0{i+1}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TIMELINE — weekend */}
      <div style={{ padding: '100px 40px', background: bStyles.surface, borderTop: `1px solid ${bStyles.line}`, borderBottom: `1px solid ${bStyles.line}` }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <BTag n="02" label="FROM PAY TO SHIP" />
          <h2 style={{ fontSize: 48, fontWeight: 500, letterSpacing: -1.4, margin: 0, maxWidth: 640, lineHeight: 1.05 }}>
            Pay at 8pm. <span style={{ fontFamily: bStyles.serif, fontStyle:'italic', fontWeight: 400, color: bStyles.accent2 }}>Demo Sunday morning.</span>
          </h2>

          <div style={{
            marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1,
            background: bStyles.line, border: `1px solid ${bStyles.line}`, borderRadius: 10, overflow: 'hidden',
          }}>
            {[
              { t: '00:00', h: 'Pay', d: 'Stripe checkout. One payment, no seats to negotiate.' },
              { t: '00:02', h: 'Clone', d: 'Your GitHub is added to the private repo. Clone, install, run.' },
              { t: 'WEEKEND', h: 'Ship', d: 'You already know where the code is — because it\'s the same structure you\'ll keep using.' },
            ].map((step, i) => (
              <div key={step.h} style={{ background: bStyles.bg, padding: '28px 26px' }}>
                <div style={{ display: 'flex', alignItems:'center', gap: 12 }}>
                  <span style={{
                    width: 30, height: 30, borderRadius: 999,
                    display:'grid', placeItems:'center',
                    background: bStyles.accent, color: '#fff',
                    fontFamily: bStyles.mono, fontSize: 12, fontWeight: 600,
                  }}>{i+1}</span>
                  <span style={{ fontFamily: bStyles.mono, fontSize: 11, letterSpacing: 1.5, color: bStyles.inkSoft }}>{step.t}</span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 500, marginTop: 18, letterSpacing: -0.6 }}>{step.h}</div>
                <div style={{ fontSize: 13.5, color: bStyles.inkSoft, marginTop: 8, lineHeight: 1.55 }}>{step.d}</div>
              </div>
            ))}
          </div>

          {/* Terminal proof */}
          <div style={{ marginTop: 32 }}>
            <CodeBlock lines={[
              '<span style="color:#888">$</span> git clone git@github.com:tenviq/starter.git acme',
              '<span style="color:#888">$</span> <span style="color:#888">cd</span> acme && pnpm install && pnpm db:setup',
              '<span style="color:#888">$</span> pnpm dev',
              '',
              '<span style="color:#ff6a4a">▲</span> ready on <span style="color:#ffc58b">http://localhost:3000</span>  · multi-tenant · stripe · auth · admin · ai',
            ]} />
          </div>
        </div>
      </div>

      {/* WHY DIFFERENT */}
      <div style={{ padding: '100px 40px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <BTag n="03" label="WHY TENVIQ" />
          <h2 style={{ fontSize: 48, fontWeight: 500, letterSpacing: -1.4, margin: 0, maxWidth: 720, lineHeight: 1.05 }}>
            Lightweight starters ship fast.<br/>
            <span style={{ fontFamily: bStyles.serif, fontStyle: 'italic', color: bStyles.inkSoft, fontWeight: 400 }}>Then you spend the next three months undoing them.</span>
          </h2>

          <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, border: `1px solid ${bStyles.line}`, background: bStyles.line, borderRadius: 10, overflow: 'hidden' }}>
            {[
              { title: 'Light starters', sub: 'ShipFast, boilerplates', color: bStyles.inkSoft, bad: true,
                items: ['Good for basic MVPs', 'Weak team & admin foundations', 'Little real B2B plumbing', 'Often becomes a rewrite later'] },
              { title: 'Heavy frameworks', sub: 'Nx monorepos, enterprise kits', color: bStyles.inkSoft, bad: true,
                items: ['More to absorb than to ship', 'Opinionated in the wrong places', 'Slower first commit to prod', 'Higher cognitive load'] },
              { title: 'Tenviq', sub: 'This starter', color: bStyles.accent, good: true,
                items: ['Teams, billing, admin, AI already wired', 'Readable, convention-first codebase', 'Faster time to first real feature', 'Safe changes without archaeology'] },
            ].map(col => (
              <div key={col.title} style={{
                background: col.good ? '#13100f' : bStyles.bg,
                padding: '28px 24px',
                borderTop: col.good ? `2px solid ${bStyles.accent}` : 'none',
              }}>
                <div style={{ fontFamily: bStyles.mono, fontSize: 10.5, letterSpacing: 1.5, color: col.color }}>
                  {col.good ? '● YOU HERE' : col.sub.toUpperCase()}
                </div>
                <div style={{ fontSize: 22, fontWeight: 500, marginTop: 10, letterSpacing: -0.4 }}>{col.title}</div>
                <div style={{ marginTop: 20 }}>
                  {col.items.map(it => (
                    <div key={it} style={{ display: 'flex', gap: 10, padding: '6px 0', fontSize: 13, color: col.good ? bStyles.ink : bStyles.inkSoft }}>
                      <span style={{ color: col.good ? bStyles.accent : '#555', flexShrink: 0 }}>{col.good ? '✓' : '—'}</span>
                      <span>{it}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRICING */}
      <div style={{ padding: '100px 40px', background: bStyles.surface, borderTop: `1px solid ${bStyles.line}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <BTag n="04" label="PRICING" />
          <h2 style={{ fontSize: 48, fontWeight: 500, letterSpacing: -1.4, margin: 0, maxWidth: 720, lineHeight: 1.05 }}>
            One payment. <span style={{ fontFamily: bStyles.serif, fontStyle: 'italic', fontWeight: 400, color: bStyles.accent2 }}>Lifetime updates.</span>
          </h2>

          <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {[
              { t: 'Founding', p: '$99', s: '8 OF 20 SEATS LEFT', hl: true,
                bullets: ['Direct input on what ships next', 'Full codebase & unlimited products', 'Lifetime updates', 'Private GitHub access today', '1 developer seat'] },
              { t: 'Early access', p: '$149', s: 'NEXT TIER',
                bullets: ['Full codebase & unlimited products', 'Lifetime updates', 'Private GitHub access', '1 developer seat', 'Commercial license'] },
              { t: 'Standard', p: '$249', s: 'PERMANENT PRICE',
                bullets: ['Full codebase & unlimited products', 'Lifetime updates', 'Private GitHub access', '1 developer seat', 'Commercial license'] },
            ].map(tier => (
              <div key={tier.t} style={{
                padding: 26,
                borderRadius: 12,
                background: tier.hl ? '#141110' : bStyles.bg,
                border: `1px solid ${tier.hl ? bStyles.accent : bStyles.line}`,
                position: 'relative',
              }}>
                <div style={{ fontFamily: bStyles.mono, fontSize: 11, letterSpacing: 1.5, color: tier.hl ? bStyles.accent : bStyles.inkSoft }}>{tier.s}</div>
                <div style={{ fontSize: 20, fontWeight: 500, marginTop: 10 }}>{tier.t}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 18 }}>
                  <div style={{ fontSize: 54, fontWeight: 500, letterSpacing: -2, color: tier.hl ? bStyles.accent : bStyles.ink, lineHeight: 1 }}>{tier.p}</div>
                  <div style={{ fontFamily: bStyles.mono, fontSize: 11, letterSpacing: 1.5, color: bStyles.inkSoft }}>ONE-TIME</div>
                </div>
                <div style={{ marginTop: 20, borderTop: `1px solid ${bStyles.line}`, paddingTop: 16 }}>
                  {tier.bullets.map(b => (
                    <div key={b} style={{ display: 'flex', gap: 10, padding: '6px 0', fontSize: 13 }}>
                      <span style={{ color: bStyles.accent, flexShrink: 0 }}>✓</span>
                      <span style={{ color: bStyles.ink }}>{b}</span>
                    </div>
                  ))}
                </div>
                <div style={{
                  marginTop: 22, padding: '11px 16px', textAlign: 'center',
                  borderRadius: 8, fontSize: 14, fontWeight: 500,
                  background: tier.hl ? bStyles.accent : 'transparent',
                  color: tier.hl ? '#fff' : bStyles.ink,
                  border: tier.hl ? 'none' : `1px solid ${bStyles.line}`,
                }}>
                  {tier.hl ? 'Claim a founding seat →' : 'Locked — coming soon'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div style={{ padding: '90px 40px', textAlign: 'center' }}>
        <h3 style={{
          fontSize: 44, fontWeight: 500, letterSpacing: -1.2, margin: 0, lineHeight: 1.1,
        }}>
          Start from a base you can <span style={{ fontFamily: bStyles.serif, fontStyle: 'italic', color: bStyles.accent, fontWeight: 400 }}>actually ship from.</span>
        </h3>
        <p style={{ color: bStyles.inkSoft, fontSize: 16, marginTop: 18, maxWidth: 500, margin: '18px auto 0' }}>
          Skip the weeks of auth, billing, org, admin and AI wiring. Start from the part that actually sells.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 32 }}>
          <span style={{ padding: '13px 22px', background: bStyles.accent, color: '#fff', borderRadius: 8, fontSize: 14.5, fontWeight: 500 }}>
            Claim a founding seat · $99 →
          </span>
          <span style={{ padding: '13px 22px', border: `1px solid ${bStyles.line}`, borderRadius: 8, fontSize: 14.5, fontWeight: 500 }}>
            Try the live demo
          </span>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ padding: '30px 40px', borderTop: `1px solid ${bStyles.line}`, display: 'flex', justifyContent: 'space-between', fontFamily: bStyles.mono, fontSize: 11, letterSpacing: 1.5, color: bStyles.inkSoft }}>
        <span>TENVIQ · 2026</span>
        <span>DOCS · LICENSE · PRIVACY · TERMS</span>
      </div>
    </div>
  );
}

Object.assign(window, { DirectionB });
