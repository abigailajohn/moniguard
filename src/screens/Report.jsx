import { useState } from 'react'
import Icon from '../icons.jsx'
import { useT } from '../i18n.js'
import { uid } from '../store.js'

const TYPES = ['invoice', 'bank', 'offer', 'link', 'other']
const guess = (r) => (!r ? 'invoice' : r.kind === 'invoice' ? 'invoice' : r.kind === 'offer' ? 'offer' : r.kind === 'link' || r.kind === 'qr' ? 'link' : r.claimedOrg ? 'bank' : 'other')

export default function Report({ current, setState, setLastReport, replace, user }) {
  const { t } = useT()
  const r = current?.result
  const [type, setType] = useState(guess(r))
  const [what, setWhat] = useState(current ? current.input.replace(/\s+/g, ' ').slice(0, 240) : '')
  const [attach, setAttach] = useState(!!r)
  const [contact, setContact] = useState(user?.email || '')

  function submit(e) {
    e.preventDefault()
    const rep = { id: uid(), ref: `MG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`, ts: new Date().toISOString(), type, what, result: attach && r ? { label: r.label, subtitle: r.subtitle } : null, contact }
    setState((s) => ({ ...s, reports: [rep, ...s.reports] }))
    setLastReport(rep)
    replace('reportSuccess')
  }

  return (
    <form className="sc" onSubmit={submit}>
      <div className="top" style={{ marginTop: 6 }}><h1 className="h1b">{t('rep.title')}</h1></div>
      <p className="t" style={{ fontSize: 14, margin: '8px 0 0', lineHeight: 1.5 }}>{t('rep.sub')}</p>
      <label className="fl" htmlFor="type">{t('rep.type')}</label>
      <div style={{ position: 'relative' }}>
        <select id="type" className="sel" value={type} onChange={(e) => setType(e.target.value)}>{TYPES.map((k) => <option key={k} value={k}>{t('rep.t.' + k)}</option>)}</select>
        <span style={{ position: 'absolute', right: 16, top: 16, pointerEvents: 'none' }}><Icon name="dn" size={20} color="var(--mut)" /></span>
      </div>
      <label className="fl" htmlFor="what">{t('rep.what')}</label>
      <textarea id="what" className="ta" style={{ height: 110, marginTop: 0, paddingBottom: 16 }} value={what} onChange={(e) => setWhat(e.target.value)} placeholder={t('rep.whatPh')} maxLength={1000} required />
      <label className="check"><input type="checkbox" checked={attach} disabled={!r} onChange={(e) => setAttach(e.target.checked)} /> {t('rep.include')}</label>
      <label className="fl" htmlFor="contact">{t('rep.contact')}</label>
      <input id="contact" className="inp" value={contact} onChange={(e) => setContact(e.target.value)} placeholder={t('rep.contactPh')} maxLength={120} />
      <div className="t" style={{ marginTop: 12, lineHeight: 1.5 }}>{t('rep.note')}</div>
      <button className="btn pri" type="submit" style={{ marginTop: 16 }}>{t('rep.submit')} <Icon name="ar" size={20} color="#fff" /></button>
    </form>
  )
}
