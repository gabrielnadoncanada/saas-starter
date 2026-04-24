// Shared primitives for landing directions
// Each direction has its own styles object; these utilities are style-agnostic.

// Fake browser-chrome wrapper for product mockups
function BrowserChrome({ children, url = 'app.tenviq.dev', accent = '#888', bg = '#0a0a0a', border = '#1f1f1f' }) {
  return (
    <div style={{
      width: '100%',
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 30px 80px -20px rgba(0,0,0,0.5)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px',
        borderBottom: `1px solid ${border}`,
        background: 'rgba(255,255,255,0.02)',
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ width: 11, height: 11, borderRadius: 999, background: '#3a3a3a' }} />
          <span style={{ width: 11, height: 11, borderRadius: 999, background: '#3a3a3a' }} />
          <span style={{ width: 11, height: 11, borderRadius: 999, background: '#3a3a3a' }} />
        </div>
        <div style={{
          flex: 1, textAlign: 'center',
          fontFamily: 'Geist Mono, monospace',
          fontSize: 11, color: '#888', letterSpacing: 0.5,
        }}>{url}</div>
        <div style={{ width: 33 }} />
      </div>
      <div>{children}</div>
    </div>
  );
}

// Abstracted dashboard mockup — shared across directions, restyled per theme
function DashboardMockup({ theme = 'dark', accent = '#ff6a4a' }) {
  const isDark = theme === 'dark';
  const bg = isDark ? '#0d0d0d' : '#fafaf7';
  const fg = isDark ? '#e5e5e5' : '#18181b';
  const muted = isDark ? '#707070' : '#8a8a8a';
  const border = isDark ? '#1d1d1d' : '#e8e4dc';
  const card = isDark ? '#111' : '#fff';
  const sidebarBg = isDark ? '#070707' : '#f5f1ea';

  return (
    <div style={{ display: 'flex', height: 560, background: bg, color: fg, fontFamily: 'Geist, sans-serif', fontSize: 12 }}>
      {/* Sidebar */}
      <div style={{ width: 180, background: sidebarBg, borderRight: `1px solid ${border}`, padding: '16px 12px' }}>
        <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, color: muted, letterSpacing: 1, marginBottom: 14 }}>ACME CORP</div>
        {['Overview','Members','Billing','API keys','Assistant','Settings'].map((l, i) => (
          <div key={l} style={{
            padding: '7px 10px', borderRadius: 6, marginBottom: 2,
            background: i === 0 ? (isDark ? '#1a1a1a' : '#ebe6dc') : 'transparent',
            color: i === 0 ? fg : muted, fontSize: 12,
          }}>{l}</div>
        ))}
        <div style={{ marginTop: 18, fontFamily: 'Geist Mono, monospace', fontSize: 10, color: muted, letterSpacing: 1, marginBottom: 8 }}>WORKSPACES</div>
        {['Acme Corp','Personal'].map((l, i) => (
          <div key={l} style={{ display: 'flex', alignItems:'center', gap:8, padding: '6px 10px', fontSize: 12, color: muted }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: i===0 ? accent : (isDark? '#2a2a2a':'#d9d4c8') }} />
            {l}
          </div>
        ))}
      </div>
      {/* Main */}
      <div style={{ flex: 1, padding: 22, overflow: 'hidden' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>Overview</div>
            <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>April 2026 · Acme Corp</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ padding: '6px 12px', border: `1px solid ${border}`, borderRadius: 6, fontSize: 11 }}>Last 30 days</span>
            <span style={{ padding: '6px 12px', background: accent, color: '#fff', borderRadius: 6, fontSize: 11, fontWeight: 500 }}>Invite</span>
          </div>
        </div>
        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
          {[
            { k: 'MRR', v: '$14,280', d: '+12.4%' },
            { k: 'Active seats', v: '186', d: '+9' },
            { k: 'Plan', v: 'Pro', d: 'annual' },
          ].map((kpi) => (
            <div key={kpi.k} style={{ padding: 14, background: card, border: `1px solid ${border}`, borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: muted, fontFamily:'Geist Mono, monospace', letterSpacing: 1 }}>{kpi.k.toUpperCase()}</div>
              <div style={{ fontSize: 22, fontWeight: 600, marginTop: 6 }}>{kpi.v}</div>
              <div style={{ fontSize: 11, color: kpi.d.startsWith('+') ? accent : muted, marginTop: 2 }}>{kpi.d}</div>
            </div>
          ))}
        </div>
        {/* Chart */}
        <div style={{ padding: 14, background: card, border: `1px solid ${border}`, borderRadius: 8, marginBottom: 14 }}>
          <div style={{ display:'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 500 }}>Workspace activity</div>
            <div style={{ fontSize: 10, color: muted, fontFamily: 'Geist Mono, monospace' }}>30D</div>
          </div>
          <svg viewBox="0 0 500 120" width="100%" height="100" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`g-${theme}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity="0.35"/>
                <stop offset="100%" stopColor={accent} stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d="M0,95 L25,88 L50,82 L75,85 L100,70 L125,75 L150,62 L175,55 L200,48 L225,52 L250,42 L275,36 L300,40 L325,30 L350,26 L375,32 L400,20 L425,22 L450,15 L475,18 L500,10 L500,120 L0,120 Z"
                  fill={`url(#g-${theme})`}/>
            <path d="M0,95 L25,88 L50,82 L75,85 L100,70 L125,75 L150,62 L175,55 L200,48 L225,52 L250,42 L275,36 L300,40 L325,30 L350,26 L375,32 L400,20 L425,22 L450,15 L475,18 L500,10"
                  stroke={accent} strokeWidth="1.5" fill="none"/>
          </svg>
        </div>
        {/* Members table */}
        <div style={{ padding: 14, background: card, border: `1px solid ${border}`, borderRadius: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 10 }}>Recent members</div>
          {[
            ['JD','Jules Dubreuil','Admin','active'],
            ['SM','Sara Meyer','Member','active'],
            ['RK','Rafael Kim','Owner','active'],
          ].map(([a,n,r,s]) => (
            <div key={n} style={{ display:'grid', gridTemplateColumns:'24px 1fr 100px 80px', gap: 10, alignItems:'center', padding:'7px 0', borderTop: `1px solid ${border}` }}>
              <span style={{ width: 22, height: 22, borderRadius: 999, background: isDark ? '#222' : '#eee5d3', display:'grid', placeItems:'center', fontSize: 9, fontWeight: 600 }}>{a}</span>
              <span style={{ fontSize: 12 }}>{n}</span>
              <span style={{ fontSize: 11, color: muted }}>{r}</span>
              <span style={{ fontSize: 10, color: accent, fontFamily: 'Geist Mono, monospace' }}>● {s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Fake terminal / code block
function CodeBlock({ lines, theme = 'dark' }) {
  const isDark = theme === 'dark';
  const bg = isDark ? '#08080a' : '#1b1816';
  const border = isDark ? '#1a1a1a' : '#2b2723';
  return (
    <div style={{
      background: bg, border: `1px solid ${border}`, borderRadius: 10,
      padding: '14px 18px',
      fontFamily: 'Geist Mono, monospace', fontSize: 12.5, lineHeight: 1.7,
      color: '#d5d0c4',
    }}>
      {lines.map((l, i) => (
        <div key={i}>
          <span style={{ color: '#555', marginRight: 14, userSelect: 'none' }}>{String(i+1).padStart(2,'0')}</span>
          <span dangerouslySetInnerHTML={{__html: l}} />
        </div>
      ))}
    </div>
  );
}

// Logo wordmark (re-styleable)
function TenviqMark({ color = '#18181b', size = 20, italic = false }) {
  return (
    <span style={{
      fontFamily: italic ? 'Fraunces, serif' : 'Geist, sans-serif',
      fontStyle: italic ? 'italic' : 'normal',
      fontWeight: italic ? 500 : 700,
      fontSize: size,
      color,
      letterSpacing: italic ? 0 : -0.5,
    }}>
      tenviq<span style={{ color: color === '#18181b' ? '#c94f2a' : color, marginLeft: -1 }}>.</span>
    </span>
  );
}

Object.assign(window, { BrowserChrome, DashboardMockup, CodeBlock, TenviqMark });
