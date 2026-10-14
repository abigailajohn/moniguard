import { useEffect } from 'react'
import Icon from '../icons.jsx'
import { ALERTS } from '../alerts.js'
import { SAMPLES } from '../samples.js'
import { when } from '../store.js'
import { Header } from './Alerts.jsx'

export default function AlertDetail({ alertId, setState, back, tab, setPending }) {
  const a = ALERTS.find((x) => x.id === alertId) || ALERTS[0]
  useEffect(() => {
    setState((s) => (s.readAlerts.includes(a.id) ? s : { ...s, readAlerts: [...s.readAlerts, a.id] }))
  }, [a.id, setState])
  const sample = a.sample && SAMPLES.find((s) => s.id === a.sample)

  return (
    <>
      <Header title="Scam alert" back={back} />
      <div className="sc" style={{ paddingTop: 14 }}>
        <div className={`banner ${a.level === 'high' ? 'red' : 'amber'}`}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Icon name="warn" size={26} /><span style={{ fontSize: 12, fontWeight: 600 }}>{a.level === 'high' ? 'High risk' : 'Be careful'} · {when(a.ts)}</span></div>
          <div style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.25, marginTop: 10 }}>{a.title}</div>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.6, marginTop: 16 }}>{a.body}</p>
        <div className="lbl">Warning signs</div>
        <div className="card" style={{ padding: '4px 16px' }}>
          {a.signs.map((s) => <div className="row" key={s}><Icon name="exc" size={20} color="var(--red)" /><span className="flex1" style={{ fontSize: 13.5 }}>{s}</span></div>)}
        </div>
        <div className="next">
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>What to do</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>{a.todo.map((s) => <li key={s}>{s}</li>)}</ul>
        </div>
        <p className="t" style={{ fontSize: 11, marginTop: 14 }}>Demo alert based on a common scam pattern.</p>
      </div>
      <div className="stack">
        <button className="btn pri" onClick={() => { setPending({ tab: a.id === 'qr-sticker' ? 'qr' : 'text' }); tab('verify') }}>Check one I received</button>
        {sample && <button className="btn out" onClick={() => { setPending({ tab: 'text', text: sample.text }); tab('verify') }}>See an example checked</button>}
      </div>
    </>
  )
}
