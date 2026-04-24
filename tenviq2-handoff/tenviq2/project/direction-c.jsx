// Direction C — Bold, indie, opinionated
// Big typography, tight grid, off-white background with strong accent blocks.
// Message speaks directly to the "I keep rebuilding the same thing" pain.

const cStyles = {
  bg: '#efece3',
  dark: '#131310',
  surface: '#fff',
  ink: '#131310',
  inkSoft: '#6b655c',
  line: '#d8d2c3',
  accent: '#ff4d1f',
  yellow: '#f5d03b',
  green: '#1b7a5a',
  sans: "'Geist', system-ui, sans-serif",
  mono: "'Geist Mono', ui-monospace, monospace",
  serif: "'Fraunces', Georgia, serif",
};

function CStamp({ children, bg = cStyles.accent, color = '#fff' }) {
  return (
    <span style={{
      display: 'inline-block',
      background: bg, color,
      padding: '3px 10px',
      fontFamily: cStyles.mono, fontSize: 11, letterSpacing: 1.5, fontWeight: 600,
      transform: 'rotate(-1.5deg)',
    }}>{children}</span>
  );
}

function DirectionC() {
  return (
    <div style={{ width: '100%', background: cStyles.bg, color: cStyles.ink, fontFamily: cStyles.sans }}>
      {/* NAV */}
      <div style={{ display:'flex', alignItems:'center', padding: '22px 40px', borderBottom: `2px solid ${cStyles.ink}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 10, height: 10, borderRadius: 999, background: cStyles.accent }}/>
          <span style={{ fontFamily: cStyles.sans, fontWeight: 800, fontSize: 22, letterSpacing: -1 }}>TENVIQ</span>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 28, fontSize: 14, fontWeight: 500 }}>
          <a>What's inside</a><a>The weekend</a><a>Pricing</a><a>Live demo</a>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13 }}>
          <span>Sign in</span>
          <span style={{
            padding: '9px 16px', background: cStyles.ink, color: cStyles.bg,
            fontWeight: 600,
          }}>
            BUY — $99
          </span>
        </div>
      </div>

      {/* HERO */}
      <div style={{ padding: '56px 40px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 14, alignItems:'center', marginBottom: 28 }}>
            <CStamp bg={cStyles.yellow} color={cStyles.ink}>● 8/20 FOUNDING SEATS</CStamp>
            <span style={{ fontFamily: cStyles.mono, fontSize: 12, color: cStyles.inkSoft, letterSpacing: 1 }}>
              $99 → $149 → $249. The price only goes up.
            </span>
          </div>

          <h1 style={{
            fontFamily: cStyles.sans, fontWeight: 800,
            fontSize: 120, lineHeight: 0.92, letterSpacing: -5,
            margin: 0, textTransform: 'none',
          }}>
            Stop rebuilding<br/>
            the same&nbsp;
            <span style={{
              fontFamily: cStyles.serif, fontStyle: 'italic', fontWeight: 500,
              color: cStyles.accent, letterSpacing: -3,
            }}>
              starter.
            </span>
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 60, marginTop: 48, alignItems: 'end' }}>
            <p style={{
              fontSize: 22, lineHeight: 1.4, color: cStyles.ink, margin: 0, textWrap: 'pretty',
              fontWeight: 400, maxWidth: 560,
            }}>
              Every idea, same ritual. New repo. Rewire auth.
              Re-pick Stripe libs. Re-argue conventions.
              <span style={{ background: cStyles.yellow, padding: '0 6px' }}>
                Tenviq is the opinion you keep.
              </span>
            </p>
            <div>
              <div style={{ fontFamily: cStyles.mono, fontSize: 12, letterSpacing: 1.5, color: cStyles.inkSoft, marginBottom: 14 }}>
                BUILT FOR
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 14 }}>
                {['Solo B2B founders','Indie hackers shipping SaaS','CTO early-stage','Small teams (2–5) who skip frameworks'].map(t => (
                  <div key={t} style={{ display:'flex', gap: 8, alignItems:'center' }}>
                    <span style={{ color: cStyles.accent, fontWeight: 700 }}>→</span> {t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 44 }}>
            <span style={{
              padding: '16px 24px', background: cStyles.ink, color: cStyles.bg,
              fontWeight: 600, fontSize: 16, display: 'inline-flex', gap: 12, alignItems: 'center',
            }}>
              CLAIM A FOUNDING SEAT <span style={{ color: cStyles.accent, fontWeight: 800 }}>$99</span>
              <span>→</span>
            </span>
            <span style={{
              padding: '16px 24px', background: 'transparent', color: cStyles.ink,
              border: `2px solid ${cStyles.ink}`, fontWeight: 600, fontSize: 16,
            }}>
              OPEN LIVE DEMO
            </span>
          </div>
        </div>
      </div>

      {/* TAPED PRODUCT SHOT */}
      <div style={{ padding: '90px 40px 40px', position: 'relative' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', position: 'relative', transform: 'rotate(-0.4deg)' }}>
          <div style={{ position:'absolute', top: -18, left: 60, zIndex: 2 }}>
            <CStamp bg={cStyles.accent}>LIVE DEMO · APP.TENVIQ.DEV</CStamp>
          </div>
          <div style={{ position:'absolute', top: -14, right: 100, zIndex: 2 }}>
            <CStamp bg={cStyles.green}>MULTI-TENANT · STRIPE · AI</CStamp>
          </div>
          <BrowserChrome url="app.tenviq.dev / acme-corp / overview" bg="#0b0b0d" border="#1a1a1a">
            <DashboardMockup theme="dark" accent={cStyles.accent} />
          </BrowserChrome>
        </div>
      </div>

      {/* PROBLEM — huge list */}
      <div style={{ padding: '100px 40px', background: cStyles.ink, color: cStyles.bg }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ fontFamily: cStyles.mono, fontSize: 13, letterSpacing: 2, color: cStyles.yellow, marginBottom: 24 }}>
            ♦ THE LOOP YOU'RE STUCK IN
          </div>
          <h2 style={{
            fontSize: 84, lineHeight: 0.95, letterSpacing: -3, margin: 0, fontWeight: 800,
          }}>
            You don't ship.<br/>
            You rebuild the <span style={{ color: cStyles.accent }}>same&nbsp;setup</span><br/>
            <span style={{ fontFamily: cStyles.serif, fontStyle: 'italic', fontWeight: 500 }}>every&nbsp;single&nbsp;time.</span>
          </h2>

          <div style={{ marginTop: 60, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, background: '#23231f' }}>
            {[
              'Reinvent auth, again — this time with magic links, maybe 2FA',
              'Re-wire Stripe, rediscover webhooks, reread Stripe docs',
              'Argue with yourself about folder structure, lose',
              'Pick "clean" libraries, regret three of them by week two',
              'Build the org / members / roles model from scratch — again',
              'Add an admin view at the last minute so demos don\'t look fake',
              'Lose track of which project uses which pattern',
              'Rewrite the whole thing next time because it\'s unreadable',
            ].map((t, i) => (
              <div key={i} style={{ background: cStyles.ink, padding: '22px 24px', fontSize: 16, display: 'flex', gap: 16 }}>
                <span style={{ fontFamily: cStyles.mono, fontSize: 12, color: cStyles.accent, letterSpacing: 1.5, flexShrink: 0, width: 28 }}>
                  {String(i+1).padStart(2, '0')}
                </span>
                <span style={{ color: '#e5e1d3' }}>{t}</span>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 50, padding: '26px 28px',
            background: cStyles.accent, color: '#fff',
            display: 'flex', gap: 20, alignItems: 'center',
            transform: 'rotate(-0.2deg)',
          }}>
            <span style={{ fontFamily: cStyles.serif, fontStyle: 'italic', fontSize: 40, fontWeight: 500, lineHeight: 1 }}>
              "It's always the same 180 hours."
            </span>
            <span style={{ fontFamily: cStyles.mono, fontSize: 11, letterSpacing: 1.5, marginLeft: 'auto', flexShrink: 0 }}>
              — YOU, EVERY FEW MONTHS
            </span>
          </div>
        </div>
      </div>

      {/* WHAT'S INSIDE — grid with strong type */}
      <div style={{ padding: '100px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display:'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: `2px solid ${cStyles.ink}`, paddingBottom: 24, marginBottom: 0 }}>
            <h2 style={{ fontSize: 72, fontWeight: 800, letterSpacing: -2.5, margin: 0, lineHeight: 1 }}>
              The opinion,<br/>
              <span style={{ fontFamily: cStyles.serif, fontStyle: 'italic', fontWeight: 500, color: cStyles.accent }}>already wired.</span>
            </h2>
            <div style={{ fontFamily: cStyles.mono, fontSize: 12, letterSpacing: 1.5, color: cStyles.inkSoft, textAlign: 'right' }}>
              CH. 02<br/>WHAT'S INSIDE
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
            {[
              ['AUTH', 'Email + password, OAuth, magic links, 2FA, device management. Sessions & impersonation.'],
              ['ORGS', 'Multi-tenant from day one. Invites, roles, owner/admin/member. Per-org data.'],
              ['BILLING', 'Stripe checkout, portal, plans, usage metering, webhook-safe updates.'],
              ['ADMIN', 'Audit log. User search. Soft delete. Role-gated routes your buyer actually expects.'],
              ['AI', 'Streaming assistant with tool calls, chart & document artifacts, saved conversations.'],
              ['DX', 'Typed routes. Prisma schema. Seed data. Emails. Tidy docs. Same convention every time.'],
            ].map(([t, d], i) => (
              <div key={t} style={{
                padding: '32px 28px 40px',
                borderRight: i % 3 !== 2 ? `1px solid ${cStyles.line}` : 'none',
                borderBottom: i < 3 ? `1px solid ${cStyles.line}` : 'none',
                position: 'relative',
              }}>
                <div style={{
                  fontFamily: cStyles.mono, fontSize: 11, letterSpacing: 2, color: cStyles.inkSoft,
                  marginBottom: 16,
                }}>
                  {String(i+1).padStart(2,'0')} — {t}
                </div>
                <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1 }}>
                  {t === 'AUTH' && 'Sign in.'}
                  {t === 'ORGS' && 'Workspaces.'}
                  {t === 'BILLING' && 'Get paid.'}
                  {t === 'ADMIN' && 'Look real.'}
                  {t === 'AI' && 'Ship AI.'}
                  {t === 'DX' && 'Stay sane.'}
                </div>
                <div style={{ fontSize: 14.5, color: cStyles.inkSoft, marginTop: 18, lineHeight: 1.55 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WEEKEND TIMELINE */}
      <div style={{ padding: '100px 40px', background: cStyles.yellow }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ fontFamily: cStyles.mono, fontSize: 13, letterSpacing: 2, color: cStyles.ink, marginBottom: 24 }}>
            ♦ CH. 03 — THE WEEKEND
          </div>
          <h2 style={{ fontSize: 84, fontWeight: 800, letterSpacing: -3, margin: 0, lineHeight: 0.95 }}>
            Friday 8pm. <span style={{ fontFamily: cStyles.serif, fontStyle: 'italic', fontWeight: 500 }}>Sunday&nbsp;demo.</span>
          </h2>

          <div style={{
            marginTop: 60,
            border: `2px solid ${cStyles.ink}`,
            background: cStyles.bg,
          }}>
            {[
              ['FRI · 20:00', 'PAY', 'Stripe. One-time. No sales call.'],
              ['FRI · 20:02', 'GET THE REPO', 'GitHub invite. Full source. Full history. Commercial license.'],
              ['FRI · 20:10', 'CLONE, RUN', 'pnpm install · pnpm db:setup · pnpm dev. Localhost with multi-tenant + Stripe + AI.'],
              ['SAT', 'BRAND & SCHEMA', 'Logo, palette, Prisma schema. Convention means you actually find things.'],
              ['SUN', 'DEMO READY', 'Real dashboard. Real org invites. Real billing. Real admin. Real AI.'],
            ].map(([t, h, d], i, a) => (
              <div key={h} style={{
                display: 'grid', gridTemplateColumns: '160px 200px 1fr', gap: 20,
                padding: '22px 26px', alignItems: 'center',
                borderBottom: i < a.length - 1 ? `1px solid ${cStyles.line}` : 'none',
              }}>
                <div style={{ fontFamily: cStyles.mono, fontSize: 12, color: cStyles.accent, letterSpacing: 1.5, fontWeight: 600 }}>{t}</div>
                <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1 }}>{h}</div>
                <div style={{ fontSize: 14.5, color: cStyles.ink }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRICING */}
      <div style={{ padding: '100px 40px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', borderBottom: `2px solid ${cStyles.ink}`, paddingBottom: 24 }}>
            <h2 style={{ fontSize: 72, fontWeight: 800, letterSpacing: -2.5, margin: 0, lineHeight: 1 }}>
              One payment.<br/>
              <span style={{ fontFamily: cStyles.serif, fontStyle: 'italic', fontWeight: 500, color: cStyles.accent }}>No subscription.</span>
            </h2>
            <div style={{ fontFamily: cStyles.mono, fontSize: 12, letterSpacing: 1.5, color: cStyles.inkSoft, textAlign: 'right' }}>
              CH. 04 — PRICING<br/>LIFETIME UPDATES
            </div>
          </div>

          <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
            {[
              { t: 'Founding', p: '99', s: '8 OF 20 LEFT', hl: true,
                b: ['Direct input on what ships next','Lifetime updates','Private GitHub access today','Commercial license','1 seat'] },
              { t: 'Early access', p: '149', s: 'NEXT TIER',
                b: ['Lifetime updates','Private GitHub access','Commercial license','1 seat','Unlimited products'] },
              { t: 'Standard', p: '249', s: 'PERMANENT',
                b: ['Lifetime updates','Private GitHub access','Commercial license','1 seat','Unlimited products'] },
            ].map((tier, i) => (
              <div key={tier.t} style={{
                background: tier.hl ? cStyles.ink : cStyles.bg,
                color: tier.hl ? cStyles.bg : cStyles.ink,
                padding: '32px 28px 36px',
                borderRight: i < 2 ? `1px solid ${tier.hl ? '#333' : cStyles.line}` : 'none',
                position: 'relative',
              }}>
                {tier.hl && (
                  <div style={{ position: 'absolute', top: -10, left: 24 }}>
                    <CStamp bg={cStyles.accent}>BUY THIS ONE</CStamp>
                  </div>
                )}
                <div style={{ fontFamily: cStyles.mono, fontSize: 11, letterSpacing: 1.5, color: tier.hl ? cStyles.yellow : cStyles.inkSoft }}>
                  {tier.s}
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, marginTop: 10, letterSpacing: -0.6 }}>{tier.t}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 22 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: tier.hl ? cStyles.yellow : cStyles.accent }}>$</div>
                  <div style={{ fontSize: 88, fontWeight: 800, letterSpacing: -4, lineHeight: 1, color: tier.hl ? cStyles.yellow : cStyles.accent }}>{tier.p}</div>
                </div>
                <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${tier.hl ? '#333' : cStyles.line}` }}>
                  {tier.b.map(bb => (
                    <div key={bb} style={{ display: 'flex', gap: 10, padding: '5px 0', fontSize: 14 }}>
                      <span style={{ color: tier.hl ? cStyles.yellow : cStyles.accent, flexShrink: 0, fontWeight: 700 }}>→</span>
                      <span>{bb}</span>
                    </div>
                  ))}
                </div>
                <div style={{
                  marginTop: 26, padding: '14px 16px', textAlign: 'center',
                  fontWeight: 700, fontSize: 15, letterSpacing: 0.5,
                  background: tier.hl ? cStyles.accent : 'transparent',
                  color: tier.hl ? '#fff' : cStyles.ink,
                  border: tier.hl ? 'none' : `2px solid ${cStyles.ink}`,
                }}>
                  {tier.hl ? 'CLAIM YOUR SEAT →' : 'NOTIFY ME'}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 28, padding: '16px 20px', background: cStyles.ink, color: cStyles.bg,
            fontFamily: cStyles.mono, fontSize: 12, letterSpacing: 1.5, textAlign: 'center',
          }}>
            PRICE LADDER: $99 (20 LEFT) → $149 (NEXT 50) → $249 (PERMANENT). THIS IS THE CHEAPEST TENVIQ WILL EVER SELL AT.
          </div>
        </div>
      </div>

      {/* FINAL CTA */}
      <div style={{ padding: '120px 40px 80px', textAlign: 'center' }}>
        <h3 style={{
          fontFamily: cStyles.serif, fontStyle: 'italic', fontSize: 72, fontWeight: 500,
          letterSpacing: -2, margin: 0, lineHeight: 1,
        }}>
          ship the part<br/>that <span style={{ color: cStyles.accent }}>actually sells</span>.
        </h3>
        <div style={{ marginTop: 44 }}>
          <span style={{
            padding: '18px 30px', background: cStyles.ink, color: cStyles.bg,
            fontWeight: 700, fontSize: 17, letterSpacing: 0.5,
          }}>
            CLAIM A FOUNDING SEAT · $99 →
          </span>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ padding: '30px 40px', borderTop: `2px solid ${cStyles.ink}`, display: 'flex', justifyContent: 'space-between', fontFamily: cStyles.mono, fontSize: 11, letterSpacing: 1.5, color: cStyles.ink, fontWeight: 600 }}>
        <span>TENVIQ — EDITION 2026</span>
        <span>DOCS · BLOG · LICENSE · PRIVACY</span>
      </div>
    </div>
  );
}

Object.assign(window, { DirectionC });
