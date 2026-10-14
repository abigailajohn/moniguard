import { useState } from 'react'
import Icon from '../icons.jsx'
import { who } from '../store.js'
import { Header } from './Alerts.jsx'

const FIELDS = [
  ['business', 'Business name', 'text', 'e.g. Port Louis Traders Ltd'],
  ['about', 'What your business does', 'area', 'One or two sentences'],
  ['industry', 'Industry', 'text', 'e.g. Retail, Hospitality, Services'],
  ['location', 'Location', 'text', 'e.g. Port Louis, Mauritius'],
  ['staff', 'Team size', 'select', ['Just me', '2-5', '6-10', '11-50', '50+']],
  ['name', 'Your name', 'text', ''],
  ['role', 'Your role', 'text', 'e.g. Owner, Accountant'],
  ['email', 'Business email', 'email', 'you@yourbusiness.mu'],
  ['phone', 'Phone', 'tel', 'Optional'],
  ['bank', 'Main bank', 'text', 'e.g. MCB, SBM'],
]

export default function Profile({ state, setState, back, flash }) {
  const p = state.profile
  const me = who(p)
  const [edit, setEdit] = useState(false)
  const [draft, setDraft] = useState(p)
  const [err, setErr] = useState('')
  const set = (k) => (e) => setDraft((d) => ({ ...d, [k]: e.target.value }))

  function save() {
    if (!draft.business.trim()) { setErr('Add your business name.'); return }
    if (draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) { setErr('That email address does not look right.'); return }
    const clean = Object.fromEntries(Object.entries(draft).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]))
    setState((s) => ({ ...s, profile: { ...clean, sample: false } }))
    setEdit(false); setErr(''); flash('Profile saved')
  }

  if (edit) {
    return (
      <>
        <Header title="Edit profile" back={() => { setEdit(false); setDraft(p); setErr('') }} />
        <div className="sc" style={{ paddingTop: 12 }}>
          {FIELDS.map(([k, label, type, hint]) => (
            <label key={k} className="field">
              <span>{label}</span>
              {type === 'area' ? <textarea className="inp" rows={3} value={draft[k] || ''} onChange={set(k)} placeholder={hint} maxLength={240} />
                : type === 'select' ? <select className="inp" value={draft[k] || ''} onChange={set(k)}>{hint.map((o) => <option key={o}>{o}</option>)}</select>
                  : <input className="inp" type={type} value={draft[k] || ''} onChange={set(k)} placeholder={hint} maxLength={120} />}
            </label>
          ))}
          {err && <div className="err" role="alert">{err}</div>}
          <p className="t" style={{ fontSize: 11.5, marginTop: 12, lineHeight: 1.5 }}>Saved on this device only. Your business name, industry and description are sent with each check so the AI can judge whether a request makes sense for you.</p>
        </div>
        <div className="stack"><button className="btn pri" onClick={save}>Save profile</button></div>
      </>
    )
  }

  const rows = [['bld', 'Industry', p.industry], ['globe', 'Location', p.location], ['mail', 'Business email', p.email], ['chat', 'Phone', p.phone], ['bank', 'Main bank', p.bank], ['clock', 'Team size', p.staff]].filter((r) => r[2])
  return (
    <>
      <Header title="Business profile" back={back} right={<button className="link" style={{ fontWeight: 600, fontSize: 14 }} onClick={() => { setDraft(p); setEdit(true) }}>Edit</button>} />
      <div className="sc" style={{ paddingTop: 14 }}>
        <div className="me" style={{ marginTop: 0, flexDirection: 'column', textAlign: 'center', padding: '24px 16px' }}>
          <span className="av" style={{ width: 72, height: 72, fontSize: 22 }}>{me.initials}</span>
          <div style={{ fontSize: 19, fontWeight: 600, marginTop: 12 }}>{p.business}</div>
          <div className="t">{[p.name, p.role].filter(Boolean).join(' · ')}</div>
          {p.sample && <span className="pill grey" style={{ marginTop: 10 }}><i />Sample profile, tap Edit to make it yours</span>}
        </div>
        {p.about && (<><div className="lbl">About</div><div className="card" style={{ padding: 16, fontSize: 14, lineHeight: 1.55 }}>{p.about}</div></>)}
        <div className="lbl">Details</div>
        <div className="card">
          {rows.map(([i, l, v]) => (
            <div className="row" key={l}><span className="ico"><Icon name={i} size={20} color="var(--p)" /></span><span className="flex1"><div className="t" style={{ fontSize: 11 }}>{l}</div><div className="ttl" style={{ wordBreak: 'break-word' }}>{v}</div></span></div>
          ))}
        </div>
        <div style={{ marginTop: 16, background: 'var(--lav2)', borderRadius: 18, padding: 14, display: 'flex', gap: 12 }}>
          <Icon name="shok" size={22} color="var(--p)" />
          <div className="t" style={{ color: 'var(--ink)', lineHeight: 1.5 }}>
            {me.domain ? <>Messages from addresses that imitate <b>@{me.domain}</b> are flagged, because scammers copy a business's own address to trick staff into paying.</> : <>Add a business email on your own domain (not Gmail) and MoniGuard will flag addresses that imitate it.</>}
          </div>
        </div>
      </div>
    </>
  )
}
