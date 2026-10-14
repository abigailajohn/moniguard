import Icon from '../icons.jsx'
import { ALERTS } from '../alerts.js'
import { LABELS } from '../labels.js'
import { needsFollowUp, when } from '../store.js'

export function Header({ title, back, right }) {
  return (
    <div className="hdr">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="iconbtn" aria-label="Back" onClick={back}><Icon name="back" size={28} color="var(--ink)" /></button>
        <b>{title}</b>
      </div>
      {right}
    </div>
  )
}

export default function Alerts({ state, setState, back, go, setAlertId, setCurrent }) {
  const read = state.readAlerts
  const follow = state.settings.reminders ? state.history.filter(needsFollowUp) : []
  const unread = ALERTS.filter((a) => !read.includes(a.id))
  const markAll = () => setState((s) => ({ ...s, readAlerts: ALERTS.map((a) => a.id) }))
  const openAlert = (a) => { setAlertId(a.id); go('alert') }

  return (
    <>
      <Header title="Notifications" back={back} right={unread.length > 0 && <button className="link" style={{ fontSize: 13, fontWeight: 600 }} onClick={markAll}>Mark all read</button>} />
      <div className="sc" style={{ paddingTop: 12 }}>
        {follow.length > 0 && (
          <>
            <div className="lbl" style={{ marginTop: 8 }}>Needs your follow-up</div>
            <div className="card">
              {follow.map((h) => (
                <button key={h.id} className="row" onClick={() => { setCurrent(h); go('result') }}>
                  <span className="ico"><Icon name="clock" size={20} color="var(--p)" /></span>
                  <span className="flex1"><div className="ttl">{h.title}</div><div style={{ marginTop: 4, display: 'flex', gap: 8, alignItems: 'center' }}><span className={`pill ${LABELS[h.result.label].tone}`}><i />{LABELS[h.result.label].chip}</span><span className="t" style={{ fontSize: 11 }}>{when(h.ts)}</span></div></span>
                  <Icon name="ch" size={18} color="#8A84A3" />
                </button>
              ))}
            </div>
          </>
        )}

        <div className="lbl">Scam alerts</div>
        {!state.settings.alerts && <div className="t" style={{ marginBottom: 8 }}>Scam alerts are turned off in Settings, so you won't see a badge for new ones.</div>}
        {ALERTS.map((a) => {
          const isNew = !read.includes(a.id)
          return (
            <button key={a.id} className="notif" onClick={() => openAlert(a)}>
              <span className="ico" style={{ background: a.level === 'high' ? 'var(--pink)' : 'var(--abg)' }}><Icon name="warn" size={20} color={a.level === 'high' ? 'var(--red)' : '#8A5A00'} /></span>
              <span className="flex1">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div className="ttl" style={{ fontWeight: isNew ? 600 : 500 }}>{a.title}</div>
                  {isNew && <i className="udot" aria-label="Unread" />}
                </div>
                <div className="t" style={{ marginTop: 3, lineHeight: 1.45 }}>{a.short}</div>
                <div className="t" style={{ fontSize: 11, marginTop: 6 }}>{when(a.ts)}</div>
              </span>
            </button>
          )
        })}
        <p className="t" style={{ fontSize: 11, marginTop: 14, lineHeight: 1.5 }}>Demo alerts based on common scam patterns. In the full version, alerts come from verified sources.</p>
      </div>
    </>
  )
}
