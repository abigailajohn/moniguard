import { useEffect } from 'react'
import Icon from '../icons.jsx'
import { ALERTS } from '../alerts.js'
import { SAMPLES } from '../samples.js'
import { pick, useT } from '../i18n.js'
import { when } from '../store.js'
import { Header } from './Alerts.jsx'

export default function AlertDetail({ alertId, setState, back, tab, setPending }) {
  const { t, lang } = useT()
  const a = ALERTS.find((x) => x.id === alertId) || ALERTS[0]
  useEffect(() => {
    setState((s) => (s.readAlerts.includes(a.id) ? s : { ...s, readAlerts: [...s.readAlerts, a.id] }))
  }, [a.id, setState])
  const sample = a.sample && SAMPLES.find((s) => s.id === a.sample)

  return (
    <>
      <Header title={t('al.one')} back={back} />
      <div className="sc" style={{ paddingTop: 14 }}>
        <div className={`banner ${a.level === 'high' ? 'red' : 'amber'}`}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Icon name="warn" size={26} /><span style={{ fontSize: 12, fontWeight: 600 }}>{a.level === 'high' ? t('al.high') : t('al.medium')} · {when(a.ts, t, lang)}</span></div>
          <div style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.25, marginTop: 10 }}>{pick(a.title, lang)}</div>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.6, marginTop: 16 }}>{pick(a.body, lang)}</p>
        <div className="lbl">{t('al.signs')}</div>
        <div className="card" style={{ padding: '4px 16px' }}>
          {pick(a.signs, lang).map((s) => <div className="row" key={s}><Icon name="exc" size={20} color="var(--red)" /><span className="flex1" style={{ fontSize: 13.5 }}>{s}</span></div>)}
        </div>
        <div className="next">
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{t('al.todo')}</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>{pick(a.todo, lang).map((s) => <li key={s}>{s}</li>)}</ul>
        </div>
        <p className="t" style={{ fontSize: 11, marginTop: 14 }}>{t('al.demoOne')}</p>
      </div>
      <div className="stack">
        <button className="btn pri" onClick={() => { setPending({ tab: a.id === 'qr-sticker' ? 'qr' : 'text' }); tab('verify') }}>{t('al.checkMine')}</button>
        {sample && <button className="btn out" onClick={() => { setPending({ tab: 'text', text: sample.text }); tab('verify') }}>{t('al.example')}</button>}
      </div>
    </>
  )
}
