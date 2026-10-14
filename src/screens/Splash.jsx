import { useT } from '../i18n.js'
import { Logo } from './auth/AuthKit.jsx'

export default function Splash({ loading }) {
  const { t } = useT()
  return (
    <div className="splash" role="status" aria-label="MoniGuard">
      <i className="blob" style={{ left: -90, top: 150, background: 'radial-gradient(#CFC3F5,#CFC3F500 70%)' }} />
      <i className="blob" style={{ right: -110, top: 380, background: 'radial-gradient(#F7D9B5,#F7D9B500 70%)' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', paddingBottom: 60 }}>
        <Logo size={140} animate />
        <div style={{ fontSize: 36, fontWeight: 700, marginTop: 24, letterSpacing: -0.5, color: 'var(--ink)' }}>MoniGuard</div>
        <div style={{ fontSize: 16, color: 'var(--mut)', marginTop: 10 }}>{t('splash.tag')}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, paddingBottom: 48, position: 'relative' }}>
        <div className="dots" aria-hidden="true"><i /><i /><i /></div>
        <div className="t">{loading ? t('loading') : t('splash.sub')}</div>
      </div>
    </div>
  )
}
