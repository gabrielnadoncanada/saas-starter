// Tenviq landing v2 — positioned on the real moat from the repo.
// Single dark file, built to convert, organized section-by-section.

const t = {
  bg: '#0a0a0b',
  surface: '#0f0f11',
  surface2: '#141417',
  ink: '#f5f5f5',
  inkSoft: '#8a8a92',
  inkDim: '#55555c',
  line: '#1e1e22',
  accent: '#ff6a4a',
  accent2: '#ffc58b',
  sans: "'Geist', system-ui, sans-serif",
  mono: "'Geist Mono', ui-monospace, monospace",
  serif: "'Instrument Serif', Georgia, serif",
};

const MAX = 1200;

// ─────────────────────────────────────────
// Primitives
function Eyebrow({ n, children, color }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      fontFamily: t.mono, fontSize: 11, letterSpacing: 2,
      color: t.inkSoft, textTransform: 'uppercase', marginBottom: 22,
    }}>
      <span style={{ color: color || t.accent, fontWeight: 500 }}>{n}</span>
      <span style={{ width: 18, height: 1, background: t.inkSoft, opacity: 0.4 }} />
      <span>{children}</span>
    </div>
  );
}

function H2({ children, style }) {
  return (
    <h2 style={{
      fontFamily: t.sans, fontSize: 54, fontWeight: 500, letterSpacing: -1.6,
      margin: 0, lineHeight: 1.05, textWrap: 'balance',
      ...style,
    }}>{children}</h2>
  );
}

function SerifAccent({ children, color }) {
  return (
    <span style={{ fontFamily: t.serif, fontStyle: 'italic', fontWeight: 400, color: color || t.accent2 }}>
      {children}
    </span>
  );
}

function PrimaryBtn({ children, compact }) {
  return (
    <span style={{
      padding: compact ? '9px 16px' : '13px 22px',
      background: t.accent, color: '#fff',
      borderRadius: 8, fontSize: compact ? 13 : 14.5, fontWeight: 500,
      display: 'inline-flex', alignItems: 'center', gap: 10,
      boxShadow: '0 12px 40px -10px rgba(255,106,74,0.55)',
      cursor: 'pointer',
    }}>{children}</span>
  );
}

function GhostBtn({ children, compact }) {
  return (
    <span style={{
      padding: compact ? '9px 16px' : '13px 22px',
      background: 'transparent', color: t.ink,
      border: `1px solid ${t.line}`,
      borderRadius: 8, fontSize: compact ? 13 : 14.5, fontWeight: 500,
      display: 'inline-flex', alignItems: 'center', gap: 10,
      cursor: 'pointer',
    }}>{children}</span>
  );
}

// Logo
function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width="20" height="20" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke={t.accent} strokeWidth="2"/>
        <rect x="7" y="7" width="10" height="10" rx="2" fill={t.accent}/>
      </svg>
      <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: -0.3 }}>tenviq</span>
    </div>
  );
}

// ─────────────────────────────────────────
// App shell mockup — richer than the old one
function AppMockup() {
  return (
    <div style={{
      background: '#0b0b0e',
      border: `1px solid ${t.line}`,
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 60px 140px -30px rgba(0,0,0,0.8), 0 20px 60px -20px rgba(255,106,74,0.15)',
    }}>
      {/* Browser chrome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderBottom: `1px solid ${t.line}`, background: '#0d0d10' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['#ff5f57','#febc2e','#28c840'].map(c => <span key={c} style={{ width: 11, height: 11, borderRadius: 999, background: '#2a2a2a' }}/>)}
        </div>
        <div style={{ flex: 1, textAlign: 'center', fontFamily: t.mono, fontSize: 11, color: t.inkSoft }}>
          app.tenviq.dev / acme-corp / overview
        </div>
        <div style={{ width: 33 }} />
      </div>
      {/* App body */}
      <div style={{ display: 'flex', height: 620 }}>
        {/* Sidebar */}
        <div style={{ width: 200, background: '#070709', borderRight: `1px solid ${t.line}`, padding: '16px 12px', fontSize: 12 }}>
          {/* Org switcher */}
          <div style={{ padding: '9px 10px', background: '#141418', border: `1px solid ${t.line}`, borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ width: 16, height: 16, borderRadius: 4, background: t.accent, fontSize: 10, fontWeight: 600, display: 'grid', placeItems: 'center', color: '#fff' }}>A</span>
            <span style={{ fontWeight: 500 }}>Acme Corp</span>
            <span style={{ marginLeft: 'auto', color: t.inkDim }}>⌄</span>
          </div>
          <div style={{ fontFamily: t.mono, fontSize: 10, color: t.inkDim, letterSpacing: 1.5, margin: '6px 10px 8px' }}>WORKSPACE</div>
          {[
            ['Dashboard', true],['Tasks', false],['Members', false],['Assistant', false, '●'],['Billing', false],['Settings', false],
          ].map(([label, active, badge]) => (
            <div key={label} style={{
              padding: '7px 10px', borderRadius: 6, marginBottom: 1,
              background: active ? '#141418' : 'transparent',
              color: active ? t.ink : t.inkSoft, fontSize: 12,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ width: 4, height: 4, borderRadius: 999, background: active ? t.accent : t.inkDim }}/>
              {label}
              {badge && <span style={{ marginLeft:'auto', color: t.accent, fontSize: 10 }}>{badge}</span>}
            </div>
          ))}
          <div style={{ fontFamily: t.mono, fontSize: 10, color: t.inkDim, letterSpacing: 1.5, margin: '18px 10px 8px' }}>ADMIN</div>
          {['Users','Organizations','Audit log'].map(l => (
            <div key={l} style={{ padding: '7px 10px', fontSize: 12, color: t.inkSoft }}>{l}</div>
          ))}
          <div style={{ position: 'relative', marginTop: 18, padding: 10, background: 'linear-gradient(135deg, rgba(255,106,74,0.12), transparent)', border: `1px solid ${t.line}`, borderRadius: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 500 }}>Pro plan</div>
            <div style={{ fontSize: 10.5, color: t.inkSoft, marginTop: 3 }}>418 / 1000 tasks · 3 / 5 members</div>
          </div>
        </div>
        {/* Main */}
        <div style={{ flex: 1, padding: 24, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: -0.4 }}>Overview</div>
              <div style={{ fontSize: 12, color: t.inkSoft, marginTop: 3 }}>April 2026 · Acme Corp · 3 members</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ padding: '6px 12px', border: `1px solid ${t.line}`, borderRadius: 6, fontSize: 11 }}>Last 30 days ⌄</span>
              <span style={{ padding: '6px 12px', background: t.accent, color: '#fff', borderRadius: 6, fontSize: 11, fontWeight: 500 }}>+ Invite</span>
            </div>
          </div>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
            {[
              ['MRR','$14,280','+12.4%'],
              ['Seats','3 / 5','Pro'],
              ['AI credits','418 / 1000','used'],
              ['Tasks','2,184','+186'],
            ].map(([k,v,d]) => (
              <div key={k} style={{ padding: 13, background: t.surface, border: `1px solid ${t.line}`, borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: t.inkSoft, fontFamily: t.mono, letterSpacing: 1.2 }}>{k.toUpperCase()}</div>
                <div style={{ fontSize: 20, fontWeight: 500, marginTop: 5 }}>{v}</div>
                <div style={{ fontSize: 10.5, color: d.startsWith('+') ? t.accent : t.inkSoft, marginTop: 1 }}>{d}</div>
              </div>
            ))}
          </div>
          {/* Chart + side panel */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 14 }}>
            <div style={{ padding: 14, background: t.surface, border: `1px solid ${t.line}`, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 500 }}>Workspace activity</div>
                <div style={{ fontSize: 10, color: t.inkSoft, fontFamily: t.mono }}>30D</div>
              </div>
              <svg viewBox="0 0 500 130" width="100%" height="110" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gv2" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={t.accent} stopOpacity="0.4"/>
                    <stop offset="100%" stopColor={t.accent} stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0,100 L25,92 L50,86 L75,90 L100,76 L125,82 L150,66 L175,58 L200,52 L225,58 L250,44 L275,38 L300,42 L325,30 L350,24 L375,32 L400,18 L425,22 L450,12 L475,16 L500,8 L500,130 L0,130 Z" fill="url(#gv2)"/>
                <path d="M0,100 L25,92 L50,86 L75,90 L100,76 L125,82 L150,66 L175,58 L200,52 L225,58 L250,44 L275,38 L300,42 L325,30 L350,24 L375,32 L400,18 L425,22 L450,12 L475,16 L500,8" stroke={t.accent} strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
            <div style={{ padding: 14, background: t.surface, border: `1px solid ${t.line}`, borderRadius: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 10 }}>AI assistant</div>
              <div style={{ fontSize: 11, color: t.inkSoft, lineHeight: 1.5 }}>
                Draft the Q2 OKRs from last week's tasks…
              </div>
              <div style={{ marginTop: 10, padding: 8, background: '#0d0d10', border: `1px solid ${t.line}`, borderRadius: 6, fontFamily: t.mono, fontSize: 10.5 }}>
                <span style={{ color: t.accent }}>▸ tasks.search</span>
                <div style={{ color: t.inkSoft, marginTop: 3 }}>status: completed, 30d</div>
              </div>
              <div style={{ marginTop: 8, fontFamily: t.mono, fontSize: 10, color: t.accent }}>streaming…</div>
            </div>
          </div>
          {/* Members table */}
          <div style={{ padding: 14, background: t.surface, border: `1px solid ${t.line}`, borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 500 }}>Organization members</div>
              <div style={{ fontSize: 10, color: t.inkSoft, fontFamily: t.mono, letterSpacing: 1 }}>3 ACTIVE</div>
            </div>
            {[
              ['GN','Gabriel Nadon','Owner','active'],
              ['SM','Sara Meyer','Admin','active'],
              ['RK','Rafael Kim','Member','pending'],
            ].map(([a,n,r,s], i) => (
              <div key={n} style={{ display:'grid', gridTemplateColumns:'24px 1fr 100px 80px 20px', gap: 10, alignItems:'center', padding:'7px 0', borderTop: `1px solid ${t.line}` }}>
                <span style={{ width: 22, height: 22, borderRadius: 999, background: '#222', display:'grid', placeItems:'center', fontSize: 9, fontWeight: 600 }}>{a}</span>
                <span style={{ fontSize: 12 }}>{n}</span>
                <span style={{ fontSize: 11, color: t.inkSoft }}>{r}</span>
                <span style={{ fontSize: 10, color: s==='active' ? t.accent : t.inkSoft, fontFamily: t.mono }}>● {s}</span>
                <span style={{ color: t.inkDim, fontSize: 14 }}>⋯</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { t, MAX, Eyebrow, H2, SerifAccent, PrimaryBtn, GhostBtn, Logo, AppMockup });
