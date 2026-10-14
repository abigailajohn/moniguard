import { useEffect } from 'react'

export default function Splash({ tab }) {
  useEffect(() => { const t = setTimeout(() => tab('home'), 1900); return () => clearTimeout(t) }, [])
  return (
    <button className="splash" onClick={() => tab('home')} aria-label="Continue">
      <i className="blob" style={{ left: -90, top: 150, background: 'radial-gradient(#CFC3F5,#CFC3F500 70%)' }} />
      <i className="blob" style={{ right: -110, top: 380, background: 'radial-gradient(#F7D9B5,#F7D9B500 70%)' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', paddingBottom: 60 }}>
        <svg width="140" height="150" viewBox="0 0 140 150" aria-hidden="true">
          <path d="M10 28C40 28 55 18 70 8c15 10 30 20 60 20v48c0 34-26 56-60 70C36 132 10 110 10 76z" fill="#8B6FE6" />
          <path d="M10 28C40 28 55 18 70 8v128C36 132 10 110 10 76z" fill="#fff" fillOpacity=".1" />
          <path d="m44 74 20 20 34-34" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="108" cy="112" r="17" fill="#F6B73C" />
          <text x="108" y="118" textAnchor="middle" fontFamily="Poppins,sans-serif" fontWeight="700" fontSize="17" fill="#1E1B2E">M</text>
        </svg>
        <div style={{ fontSize: 36, fontWeight: 700, marginTop: 24, letterSpacing: -0.5, color: 'var(--ink)' }}>MoniGuard</div>
        <div style={{ fontSize: 16, color: 'var(--mut)', marginTop: 10 }}>Verify today. Safer tomorrow.</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, paddingBottom: 48, position: 'relative' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <i style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--p)' }} />
          <i style={{ width: 8, height: 8, borderRadius: 4, background: '#8B6FE6' }} />
          <i style={{ width: 8, height: 8, borderRadius: 4, background: '#C9BDF0' }} />
        </div>
        <div className="t">A little clarity. A lot more confidence.</div>
      </div>
    </button>
  )
}
