import Icon from '../icons.jsx'
import { ALERTS } from '../alerts.js'
import { labels } from '../labels.js'
import { pick, useT } from '../i18n.js'
import { needsFollowUp, when } from '../store.js'

export function Header({ title, back, right }) {
  const { t } = useT()
  return (
    <div className="hdr">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <button className="iconbtn" aria-label={t('back')} onClick={back}><Icon name="back" size={28} color="var(--ink)" /></button>
        <b>{title}</b>
      </div>
      {right}
    </div>
  )
}

export default function Alerts({ state, setState, back, go, setAlertId, setCurrent }) {
  const { t, lang } = useT()
  const L = labels(lang)
  const read = state.readAlerts
  const follow = state.settings.reminders ? state.history.filter(needsFollowUp) : []
  const unread = ALERTS.filter((a) => !read.includes(a.id))
  const markAll = () => setState((s) => ({ ...s, readAlerts: ALERTS.map((a) => a.id) }))
  const openAlert = (a) => { setAlertId(a.id); go('alert') }

  return (
    <>
      <Header title={t('al.title')} back={back} right={unread.length > 0 && <button className="link" style={{ fontSize: 13, fontWeight: 600 }} onClick={markAll}>{t('al.markAll')}</button>} />
      <div className="sc" style={{ paddingTop: 12 }}>
        {follow.length > 0 && (
          <>
            <div className="lbl" style={{ marginTop: 8 }}>{t('al.follow')}</div>
            <div className="card">
              {follow.map((h) => (
                <button key={h.id} className="row" onClick={() => { setCurrent(h); go('result') }}>
                  <span className="ico"><Icon name="clock" size={20} color="var(--p)" /></span>
                  <span className="flex1"><div className="ttl">{h.title}</div><div style={{ marginTop: 4, display: 'flex', gap: 8, alignItems: 'center' }}><span className={`pill ${L[h.result.label].tone}`}><i />{L[h.result.label].chip}</span><span className="t" style={{ fontSize: 11 }}>{when(h.ts, t, lang)}</span></div></span>
                  <Icon name="ch" size={18} color="#8A84A3" />
                </button>
              ))}
            </div>
          </>
        )}

        <div className="lbl">{t('al.alerts')}</div>
        {!state.settings.alerts && <div className="t" style={{ marginBottom: 8 }}>{t('al.off')}</div>}
        {ALERTS.map((a) => {
          const isNew = !read.includes(a.id)
          return (
            <button key={a.id} className="notif" onClick={() => openAlert(a)}>
              <span className="ico" style={{ background: a.level === 'high' ? 'var(--pink)' : 'var(--abg)' }}><Icon name="warn" size={20} color={a.level === 'high' ? 'var(--red)' : '#8A5A00'} /></span>
              <span className="flex1">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div className="ttl" style={{ fontWeight: isNew ? 600 : 500 }}>{pick(a.title, lang)}</div>
                  {isNew && <i className="udot" aria-label={t('al.unread')} />}
                </div>
                <div className="t" style={{ marginTop: 3, lineHeight: 1.45 }}>{pick(a.short, lang)}</div>
                <div className="t" style={{ fontSize: 11, marginTop: 6 }}>{when(a.ts, t, lang)}</div>
              </span>
            </button>
          )
        })}
        <p className="t" style={{ fontSize: 11, marginTop: 14, lineHeight: 1.5 }}>{t('al.demo')}</p>
      </div>
    </>
  )
}
