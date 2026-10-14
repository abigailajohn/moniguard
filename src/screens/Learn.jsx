import Icon from '../icons.jsx'
import { useT } from '../i18n.js'

export default function Learn() {
  const { t } = useT()
  return (
    <div className="sc">
      <div className="top" style={{ marginTop: 6 }}><h1 className="h1b">{t('learn.title')}</h1></div>
      <div style={{ marginTop: 22, background: 'var(--lav2)', borderRadius: 26, padding: '28px 22px', textAlign: 'center' }}>
        <div className="av" style={{ width: 68, height: 68, margin: '0 auto' }}><Icon name="learn" size={32} color="var(--p)" /></div>
        <span className="pill" style={{ marginTop: 16, background: '#F6B73C', color: 'var(--ink)' }}>{t('comingSoon')}</span>
        <div style={{ fontSize: 20, fontWeight: 600, marginTop: 12, lineHeight: 1.3 }}>{t('learn.h')}</div>
        <div className="t" style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>{t('learn.b')}</div>
      </div>
      <div className="lbl" style={{ marginTop: 24 }}>{t('learn.way')}</div>
      <div className="card" style={{ padding: '2px 16px', opacity: 0.65 }}>
        {['learn.t1', 'learn.t2', 'learn.t3'].map((k) => <div className="row" key={k}><span className="ico"><Icon name="learn" size={20} color="var(--mut)" /></span><span className="flex1 ttl">{t(k)}</span></div>)}
      </div>
    </div>
  )
}
