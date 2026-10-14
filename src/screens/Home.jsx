import Icon from '../icons.jsx'
import { LABELS } from '../labels.js'
import { ALERTS } from '../alerts.js'
import { kindIcon, needsFollowUp, when, who } from '../store.js'

const TILES = [['chat', 'Message', 'text'], ['mail', 'Email', 'text'], ['link', 'Link', 'link'], ['doc', 'Invoice', 'file'], ['img', 'Screenshot', 'file'], ['qr', 'QR Code', 'qr']]

export default function Home({ state, go, tab, setCurrent, setPending, setAlertId }) {
  const p = state.profile
  const me = who(p)
  const open = (item) => { setCurrent(item); go('result') }
  const verify = (t) => { setPending({ tab: t }); tab('verify') }
  const unread = ALERTS.filter((a) => !state.readAlerts.includes(a.id)).length
  const follow = state.settings.reminders ? state.history.filter(needsFollowUp) : []
  const dot = (state.settings.alerts && unread > 0) || follow.length > 0
  const latest = ALERTS[0]
  const checked = state.history.length
  const flagged = state.history.filter((h) => ['high', 'suspicious'].includes(h.result.label)).length

  return (
    <div className="sc">
      <div className="top">
        <div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Hi, {me.first}</div>
          <div className="t">{p.business}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="iconbtn" aria-label={`Notifications${dot ? ', new' : ''}`} onClick={() => go('alerts')} style={{ position: 'relative' }}>
            <Icon name="bell" size={26} color="var(--ink)" />
            {dot && <i style={{ position: 'absolute', top: 6, right: 7, width: 9, height: 9, borderRadius: 5, background: '#F6B73C', border: '2px solid var(--bg)' }} />}
          </button>
          <button className="av" aria-label="Business profile" onClick={() => go('profile')} style={{ width: 44, height: 44, background: 'var(--lav)', fontSize: 14, border: 0 }}>{me.initials}</button>
        </div>
      </div>
      <h1 style={{ marginTop: 18 }}>What are you checking today?</h1>
      <button className="verifycard" onClick={() => tab('verify')}>
        <span className="big"><Icon name="scan" size={30} color="var(--p)" /></span>
        <span className="flex1"><div style={{ fontSize: 18, fontWeight: 600, color: 'var(--p)' }}>Verify something</div><div className="t" style={{ fontSize: 12.5 }}>Upload, scan or paste. We'll help.</div></span>
        <Icon name="ur" size={22} color="var(--p)" />
      </button>
      <div className="grid3">
        {TILES.map(([i, t, v]) => (
          <button key={t} className="tile" onClick={() => verify(v)}><Icon name={i} size={24} /><span>{t}</span></button>
        ))}
      </div>
      <button className="manage on" onClick={() => go('records')}>
        <div className="ico" style={{ width: 44, height: 44, background: 'var(--lav)' }}><Icon name="book" size={22} color="var(--p)" /></div>
        <div className="flex1"><div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>Manage</div><div className="t">Suppliers and organisations you trust ({state.records.length})</div></div>
        <Icon name="ch" size={18} color="#8A84A3" />
      </button>

      {follow.length > 0 && (
        <button className="alert" style={{ background: 'var(--lav2)' }} onClick={() => go('alerts')}>
          <Icon name="clock" size={24} color="var(--p)" />
          <div className="flex1"><div style={{ fontSize: 13.5, fontWeight: 600 }}>{follow.length} {follow.length === 1 ? 'check needs' : 'checks need'} a follow-up</div><div className="t" style={{ marginTop: 2 }}>Confirm with the sender, then mark it done.</div></div>
          <Icon name="ch" size={18} color="#8A84A3" />
        </button>
      )}

      <div className="sec"><b>Recent checks</b>{checked > 0 && <span className="t">{checked} checked · {flagged} flagged</span>}</div>
      {state.history.length ? (
        <div className="card" style={{ marginTop: 12, padding: '2px 16px' }}>
          {state.history.slice(0, 5).map((h) => (
            <button key={h.id} className="row" onClick={() => open(h)}>
              <span className="ico" style={{ width: 44, height: 44 }}><Icon name={kindIcon(h.source?.type === 'file' && h.source.kind === 'image' ? 'image' : h.result.kind)} size={22} color="var(--p)" /></span>
              <span className="flex1">
                <div className="ttl" style={{ fontSize: 13.5 }}>{h.title}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <span className={`pill ${LABELS[h.result.label].tone}`}><i />{LABELS[h.result.label].chip}</span>
                  <span className="t" style={{ fontSize: 11 }}>{when(h.ts)}</span>
                </div>
              </span>
              <Icon name="ch" size={18} color="#8A84A3" />
            </button>
          ))}
        </div>
      ) : (
        <div className="card empty" style={{ marginTop: 12 }}>Nothing checked yet.<br />Paste a message or invoice to see how it works.<br /><button className="link" style={{ marginTop: 8 }} onClick={() => tab('verify')}>Check something</button></div>
      )}
      {state.settings.alerts && (
        <button className="alert" onClick={() => { setAlertId(latest.id); go('alert') }}>
          <Icon name="warn" size={24} color="#8A5A00" />
          <div className="flex1"><div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.35 }}>Scam alert: {latest.title}</div><div style={{ fontSize: 12.5, fontWeight: 600, color: '#8A5A00', marginTop: 8 }}>See the warning signs</div></div>
          <Icon name="ch" size={18} color="#8A5A00" />
        </button>
      )}
      <div className="sec"><b>Scam tips</b></div>
      <div style={{ marginTop: 12, background: 'var(--lav)', borderRadius: 20, padding: 16 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>Check the sender's domain before you pay</div>
        <div className="t" style={{ marginTop: 4 }}>A near-match address is a common sign of invoice fraud.</div>
      </div>
    </div>
  )
}
