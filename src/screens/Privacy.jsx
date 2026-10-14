import { useState } from 'react'
import Icon from '../icons.jsx'
import { Header } from './Alerts.jsx'

export default function Privacy({ state, setState, back, flash }) {
  const [confirm, setConfirm] = useState(false)
  const kb = Math.max(1, Math.round(new Blob([JSON.stringify(state)]).size / 1024))
  function download() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'moniguard-data.json'
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }
  const items = [
    ['clock', 'Checks', `${state.history.length} saved`],
    ['book', 'Trusted records', `${state.records.length} saved`],
    ['flag', 'Reports', `${state.reports.length} sent`],
    ['bld', 'Business profile', state.profile.business],
  ]
  return (
    <>
      <Header title="Your data" back={back} />
      <div className="sc" style={{ paddingTop: 12 }}>
        <div className="lbl" style={{ marginTop: 8 }}>Stored on this device ({kb} KB)</div>
        <div className="card">{items.map(([i, t, v]) => <div className="row" key={t}><span className="ico"><Icon name={i} size={20} color="var(--p)" /></span><span className="flex1 ttl">{t}</span><span className="t">{v}</span></div>)}</div>
        <div className="lbl">What happens when you check something</div>
        <div className="card" style={{ padding: 16, fontSize: 13.5, lineHeight: 1.6 }}>
          <p style={{ margin: 0 }}>What you paste or upload is sent over an encrypted connection to the MoniGuard checker. If AI reading is switched on, it is passed to our AI provider (Anthropic) to read it. MoniGuard does not keep it on a server.</p>
          <p style={{ margin: '10px 0 0' }}>Your history, records and profile stay in this browser. Clearing your browser data removes them.</p>
        </div>
        <div className="card" style={{ marginTop: 16 }}>
          <button className="row" onClick={download}><span className="ico"><Icon name="doc" size={20} color="var(--p)" /></span><span className="flex1 ttl">Download my data</span><Icon name="ch" size={18} color="#8A84A3" /></button>
          {confirm ? (
            <div className="row" style={{ gap: 8 }}>
              <span className="flex1 ttl">Delete all checks and reports?</span>
              <button className="chip" onClick={() => setConfirm(false)}>Cancel</button>
              <button className="chip on" onClick={() => { setState((s) => ({ ...s, history: [], reports: [] })); setConfirm(false); flash('History deleted') }}>Delete</button>
            </div>
          ) : <button className="row" onClick={() => setConfirm(true)}><span className="ico"><Icon name="trash" size={20} color="var(--red)" /></span><span className="flex1 ttl" style={{ color: 'var(--red)' }}>Delete history</span></button>}
        </div>
      </div>
    </>
  )
}
