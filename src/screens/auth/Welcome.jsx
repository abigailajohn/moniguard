import Icon from '../../icons.jsx'
import { useT } from '../../i18n.js'
import { LangPicker, Logo } from './AuthKit.jsx'

export default function Welcome({ go, startGuest, lang, setLang }) {
  const { t } = useT()
  return (
    <div className="sc authsc">
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}><LangPicker lang={lang} setLang={setLang} /></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 28 }}>
        <Logo size={52} />
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.3 }}>MoniGuard</div>
      </div>
      <h1 style={{ marginTop: 26, fontSize: 32 }}>{t('welcome.title')}</h1>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--mut)', marginTop: 10 }}>{t('welcome.body')}</p>
      <div className="card" style={{ marginTop: 18, padding: '4px 16px' }}>
        {[['scan', 'welcome.b1'], ['book', 'welcome.b2'], ['bell', 'welcome.b3']].map(([i, k]) => (
          <div className="row" key={k}><span className="ico"><Icon name={i} size={20} color="var(--p)" /></span><span className="flex1 ttl" style={{ fontSize: 13.5 }}>{t(k)}</span></div>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <button className="btn pri" style={{ marginTop: 24 }} onClick={() => go('signup')}>{t('welcome.create')}</button>
      <button className="btn out" style={{ marginTop: 10 }} onClick={() => go('login')}>{t('welcome.login')}</button>
      <button className="link" style={{ marginTop: 16, alignSelf: 'center', fontWeight: 600 }} onClick={startGuest}>{t('welcome.guest')}</button>
      <div className="t" style={{ textAlign: 'center', marginTop: 4 }}>{t('welcome.guestNote')}</div>
    </div>
  )
}
