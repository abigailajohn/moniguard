import { useState } from 'react'
import Icon from '../icons.jsx'
import { uid } from '../store.js'

const TYPES = ['Fake invoice', 'Fake bank message', 'Fake grant or offer', 'Suspicious link', 'Other']
const guess = (r) => (!r ? TYPES[0] : r.kind === 'invoice' ? TYPES[0] : r.kind === 'offer' ? TYPES[2] : r.kind === 'link' ? TYPES[3] : r.claimedOrg ? TYPES[1] : TYPES[4])

export default function Report({ current, setState, setLastReport, replace }) {
  const r = current?.result
  const [type, setType] = useState(guess(r))
  const [what, setWhat] = useState(current ? current.input.replace(/\s+/g, ' ').slice(0, 240) : '')
  const [attach, setAttach] = useState(!!r)
  const [contact, setContact] = useState('')

  function submit(e) {
    e.preventDefault()
    const rep = { id: uid(), ref: `MG-2026-${Math.floor(1000 + Math.random() * 9000)}`, ts: new Date().toISOString(), type, what, result: attach && r ? { label: r.label, subtitle: r.subtitle } : null, contact }
    setState((s) => ({ ...s, reports: [rep, ...s.reports] }))
    setLastReport(rep)
    replace('reportSuccess')
  }

  return (
    <form className="sc" onSubmit={submit}>
      <div className="top" style={{ marginTop: 6 }}><h1 className="h1b">Report a scam</h1><Icon name="help" size={28} color="var(--mut)" /></div>
      <p className="t" style={{ fontSize: 14, margin: '8px 0 0', lineHeight: 1.5 }}>You're not alone. Share what happened to help protect other businesses.</p>
      <label className="fl" htmlFor="type">Scam type</label>
      <div style={{ position: 'relative' }}>
        <select id="type" className="sel" value={type} onChange={(e) => setType(e.target.value)}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
        <span style={{ position: 'absolute', right: 16, top: 16, pointerEvents: 'none' }}><Icon name="dn" size={20} color="var(--mut)" /></span>
      </div>
      <label className="fl" htmlFor="what">What happened?</label>
      <textarea id="what" className="ta" style={{ height: 110, marginTop: 0 }} value={what} onChange={(e) => setWhat(e.target.value)} placeholder="Tell us what you received and what it asked for." maxLength={1000} required />
      <label className="check"><input type="checkbox" checked={attach} disabled={!r} onChange={(e) => setAttach(e.target.checked)} /> Include my verification result</label>
      <label className="fl" htmlFor="contact">Contact details (optional)</label>
      <input id="contact" className="inp" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Email or phone number" maxLength={120} />
      <div className="t" style={{ marginTop: 12, lineHeight: 1.5 }}>Your contact details stay private. MoniGuard reports don't replace a report to the authorities.</div>
      <button className="btn pri" type="submit" style={{ marginTop: 16 }}>Submit report <Icon name="ar" size={20} color="#fff" /></button>
    </form>
  )
}
