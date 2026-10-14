import Icon from '../icons.jsx'
import { who } from '../store.js'

function Row({ icon, title, sub, onClick, isNew }) {
  return (
    <button className="row" onClick={onClick}>
      <span className="ico"><Icon name={icon} size={20} color="var(--p)" /></span>
      <span className="flex1"><div className="ttl">{title}{isNew && <span className="new">New</span>}</div>{sub && <div className="t" style={{ fontSize: 11 }}>{sub}</div>}</span>
      <Icon name="ch" size={18} color="#8A84A3" />
    </button>
  )
}
function Toggle({ icon, title, sub, on, set }) {
  return (
    <div className="row">
      <span className="ico"><Icon name={icon} size={20} color="var(--p)" /></span>
      <span className="flex1"><div className="ttl">{title}</div>{sub && <div className="t" style={{ fontSize: 11 }}>{sub}</div>}</span>
      <button className={`sw ${on ? 'on' : ''}`} role="switch" aria-checked={on} aria-label={title} onClick={() => set(!on)}><i /></button>
    </div>
  )
}

export default function Settings({ state, setState, reset, go, flash }) {
  const p = state.profile
  const me = who(p)
  const setS = (k) => (v) => setState((s) => ({ ...s, settings: { ...s.settings, [k]: v } }))
  return (
    <div className="sc">
      <div className="top" style={{ marginTop: 6 }}><h1 className="h1b">Settings</h1></div>
      <button className="me" onClick={() => go('profile')}>
        <span className="av" style={{ width: 54, height: 54 }}>{me.initials}</span>
        <span className="flex1"><div style={{ fontSize: 15, fontWeight: 600 }}>{p.business}</div><div className="t">{[p.name, p.role].filter(Boolean).join(' · ')}</div></span>
        <Icon name="ch" size={20} color="var(--p)" />
      </button>
      <div className="lbl">Account</div>
      <div className="card">
        <Row icon="bld" title="Business profile" sub={p.industry || 'Add what your business does'} onClick={() => go('profile')} />
        <Row icon="bank" title="Main bank" sub={p.bank || 'Not set'} onClick={() => go('profile')} />
        <Row icon="book" title="Trusted records" sub="Suppliers and organisations you have verified" isNew onClick={() => go('records')} />
      </div>
      <div className="lbl">Notifications</div>
      <div className="card">
        <Toggle icon="bell" title="Scam alerts" sub="Badge on the bell for new alerts" on={state.settings.alerts} set={setS('alerts')} />
        <Toggle icon="clock" title="Follow-up reminders" sub="Remind me about checks I still need to confirm" on={state.settings.reminders} set={setS('reminders')} />
      </div>
      <div className="lbl">Privacy &amp; Data</div>
      <div className="card">
        <Row icon="lock" title="Your data" sub={`${state.history.length} checks and ${state.records.length} records, on this device only`} onClick={() => go('privacy')} />
      </div>
      <div className="lbl">Language</div>
      <div className="card"><div className="row"><span className="ico"><Icon name="globe" size={20} color="var(--p)" /></span><span className="flex1 ttl">English</span><Icon name="chk" size={20} color="var(--p)" /></div></div>
      <button className="link" style={{ marginTop: 24, display: 'block', width: '100%', textAlign: 'center', color: 'var(--mut)', fontSize: 12 }} onClick={() => { reset(); flash('Demo data reset') }}>Reset demo data</button>
    </div>
  )
}
