import { useState } from 'react'
import Icon from '../icons.jsx'

export default function Records({ state, setState, back, tab }) {
  const [q, setQ] = useState('')
  const [kind, setKind] = useState('all')
  const list = state.records.filter((r) => (kind === 'all' || r.kind === kind) && (`${r.name} ${r.domain}`).toLowerCase().includes(q.toLowerCase()))
  const remove = (id) => setState((s) => ({ ...s, records: s.records.filter((r) => r.id !== id) }))
  return (
    <>
      <div className="hdr">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="iconbtn" aria-label="Back" onClick={back}><Icon name="back" size={28} color="var(--ink)" /></button>
          <b>Trusted records</b>
        </div>
      </div>
      <div className="sc" style={{ paddingTop: 12 }}>
        <p className="t" style={{ fontSize: 13.5, margin: '4px 0 14px', lineHeight: 1.5 }}>Suppliers and organisations you have verified. Entries marked Sample are demo data.</p>
        <label className="search"><Icon name="srch" size={20} color="#8A84A3" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or domain" aria-label="Search records" /></label>
        <div className="chips">
          {[['all', 'All'], ['supplier', 'Suppliers'], ['organisation', 'Organisations']].map(([k, l]) => <button key={k} className={`chip ${kind === k ? 'on' : ''}`} onClick={() => setKind(k)}>{l}</button>)}
        </div>
        {list.length ? list.map((r) => (
          <div className="rec" key={r.id}>
            <span className="av" style={{ width: 46, height: 46, background: 'var(--lav)', fontSize: 14 }}>{r.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}</span>
            <span className="flex1">
              <div style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</div>
              <div className="t">{r.domain} · {r.kind === 'supplier' ? 'Supplier' : 'Organisation'}</div>
              <div style={{ marginTop: 6 }}>{r.sample ? <span className="pill grey"><i />Sample</span> : <span className="pill green"><i />Verified {new Date(r.savedAt).toLocaleDateString([], { day: 'numeric', month: 'short' })}</span>}</div>
            </span>
            <button className="iconbtn" aria-label={`Remove ${r.name}`} onClick={() => remove(r.id)}><Icon name="trash" size={20} color="#8A84A3" /></button>
          </div>
        )) : <div className="empty">No records yet.<br />Save a supplier from a Looks Safe result.<br /><button className="link" onClick={() => tab('verify')}>Check something</button></div>}
        <div style={{ marginTop: 16, background: 'var(--abg)', borderRadius: 18, padding: 14, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Icon name="warn" size={22} color="#8A5A00" />
          <div><div style={{ fontSize: 13, fontWeight: 600 }}>How these are used</div><div className="t" style={{ color: '#5A4200', marginTop: 2 }}>The next message from a saved supplier is compared with its saved domain. A near-match with a different domain is flagged.</div></div>
        </div>
      </div>
    </>
  )
}
