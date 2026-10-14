import { useState } from 'react'
import Icon from '../../icons.jsx'
import { useT } from '../../i18n.js'
import { who } from '../../store.js'
import { Field, LangPicker } from './AuthKit.jsx'

const STAFF = ['p.staff.1', '2-5', '6-10', '11-50', '50+']

export default function Onboarding({ state, user, completeOnboarding, lang, setLang, flash }) {
  const { t } = useT()
  const [step, setStep] = useState(1)
  const [busy, setBusy] = useState(false)
  const accountEmail = user?.email || ''
  const [p, setP] = useState(() => ({
    ...state.profile,
    email: state.profile.email || (who({ email: accountEmail }).domain ? accountEmail : ''),
  }))
  const set = (k) => (e) => setP((x) => ({ ...x, [k]: e.target.value }))

  async function finish() {
    setBusy(true)
    try { await completeOnboarding({ ...p, language: lang }) } catch (e) { console.error(e); flash(t('err.generic')); setBusy(false) }
  }

  return (
    <div className="sc authsc">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="t" style={{ fontWeight: 600 }}>{t('ob.step', { n: step })}</span>
        <LangPicker lang={lang} setLang={setLang} />
      </div>
      <div className="obbar"><i style={{ width: step === 1 ? '50%' : '100%' }} /></div>

      {step === 1 ? (
        <>
          <h1 style={{ marginTop: 18 }}>{t('ob.t1')}</h1>
          <p className="t" style={{ fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>{t('ob.s1')}</p>
          <Field label={t('p.f.business')} value={p.business || ''} onChange={set('business')} maxLength={80} />
          <label className="field"><span>{t('p.f.about')}</span><textarea className="inp" rows={3} value={p.about || ''} onChange={set('about')} placeholder={t('p.h.about')} maxLength={240} /></label>
          <Field label={t('p.f.industry')} value={p.industry || ''} onChange={set('industry')} placeholder={t('p.h.industry')} maxLength={60} />
          <Field label={t('p.f.role')} value={p.role || ''} onChange={set('role')} placeholder={t('p.h.role')} maxLength={60} />
          <Field label={t('p.f.email')} type="email" value={p.email || ''} onChange={set('email')} placeholder={t('p.h.email')} maxLength={120} />
          <Field label={t('p.f.bank')} value={p.bank || ''} onChange={set('bank')} placeholder={t('p.h.bank')} maxLength={40} />
          <label className="field"><span>{t('p.f.staff')}</span>
            <select className="inp" value={p.staff || ''} onChange={set('staff')}>
              <option value="">—</option>
              {STAFF.map((o) => <option key={o} value={o}>{o.startsWith('p.') ? t(o) : o}</option>)}
            </select>
          </label>
          <div style={{ height: 18 }} />
          <button className="btn pri" onClick={() => setStep(2)}>{t('continue')}</button>
          <button className="link" style={{ marginTop: 14, alignSelf: 'center', fontWeight: 600 }} onClick={finish} disabled={busy}>{t('ob.skip')}</button>
        </>
      ) : (
        <>
          <h1 style={{ marginTop: 18 }}>{t('ob.t2')}</h1>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[['scan', 'ob.p1'], ['book', 'ob.p2'], ['bell', 'ob.p3']].map(([i, k]) => (
              <div key={k} className="obcard">
                <span className="ico" style={{ width: 48, height: 48 }}><Icon name={i} size={24} color="var(--p)" /></span>
                <div><div style={{ fontWeight: 600, fontSize: 15 }}>{t(k + 't')}</div><div className="t" style={{ fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>{t(k + 'b')}</div></div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, minHeight: 18 }} />
          <button className="btn pri" onClick={finish} disabled={busy}>{busy ? '…' : t('ob.start')}</button>
          <button className="link" style={{ marginTop: 14, alignSelf: 'center', fontWeight: 600 }} onClick={() => setStep(1)}>{t('back')}</button>
        </>
      )}
    </div>
  )
}
