import { useState } from 'react'
import Icon from '../icons.jsx'
import { useT } from '../i18n.js'
import { who } from '../store.js'
import { Header } from './Alerts.jsx'

const STAFF = ['p.staff.1', '2-5', '6-10', '11-50', '50+']
const FIELDS = [
  ['business', 'text'], ['about', 'area'], ['industry', 'text'], ['location', 'text'], ['staff', 'select'],
  ['name', 'text'], ['role', 'text'], ['email', 'email'], ['phone', 'tel'], ['bank', 'text'],
]

export default function Profile({ state, setState, back, flash, user }) {
  const { t } = useT()
  const p = state.profile
  const me = who(p)
  const [edit, setEdit] = useState(false)
  const [draft, setDraft] = useState(p)
  const [err, setErr] = useState('')
  const set = (k) => (e) => setDraft((d) => ({ ...d, [k]: e.target.value }))
  const show = (v) => (typeof v === 'string' && v.startsWith('p.') ? t(v) : v)

  function save() {
    if (!String(draft.business || '').trim()) { setErr(t('p.errBusiness')); return }
    if (draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) { setErr(t('p.errEmail')); return }
    const clean = Object.fromEntries(Object.entries(draft).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]))
    setState((s) => ({ ...s, profile: { ...clean, sample: false } }))
    setEdit(false); setErr(''); flash(t('p.saved'))
  }

  if (edit) {
    return (
      <>
        <Header title={t('p.editTitle')} back={() => { setEdit(false); setDraft(p); setErr('') }} />
        <div className="sc" style={{ paddingTop: 12 }}>
          {FIELDS.map(([k, type]) => (
            <label key={k} className="field">
              <span>{t('p.f.' + k)}</span>
              {type === 'area' ? <textarea className="inp" rows={3} value={draft[k] || ''} onChange={set(k)} placeholder={t('p.h.' + k)} maxLength={240} />
                : type === 'select' ? <select className="inp" value={draft[k] || ''} onChange={set(k)}><option value="">—</option>{STAFF.map((o) => <option key={o} value={o}>{show(o)}</option>)}</select>
                  : <input className="inp" type={type} value={draft[k] || ''} onChange={set(k)} placeholder={t('p.h.' + k) === 'p.h.' + k ? '' : t('p.h.' + k)} maxLength={120} />}
            </label>
          ))}
          {err && <div className="err" role="alert">{err}</div>}
          <p className="t" style={{ fontSize: 11.5, marginTop: 12, lineHeight: 1.5 }}>{t('p.note')}</p>
        </div>
        <div className="stack"><button className="btn pri" onClick={save}>{t('p.save')}</button></div>
      </>
    )
  }

  const rows = [['bld', 'industry'], ['globe', 'location'], ['mail', 'email'], ['chat', 'phone'], ['bank', 'bank'], ['clock', 'staff']].filter(([, k]) => p[k])
  return (
    <>
      <Header title={t('p.title')} back={back} right={<button className="link" style={{ fontWeight: 600, fontSize: 14 }} onClick={() => { setDraft(p); setEdit(true) }}>{t('edit')}</button>} />
      <div className="sc" style={{ paddingTop: 14 }}>
        <div className="me" style={{ marginTop: 0, flexDirection: 'column', textAlign: 'center', padding: '24px 16px' }}>
          <span className="av" style={{ width: 72, height: 72, fontSize: 22 }}>{me.initials}</span>
          <div style={{ fontSize: 19, fontWeight: 600, marginTop: 12 }}>{p.business}</div>
          <div className="t">{[p.name, p.role].filter(Boolean).join(' · ')}</div>
          {user?.email && <div className="t" style={{ marginTop: 2 }}>{user.email}</div>}
          {p.sample && <span className="pill grey" style={{ marginTop: 10, whiteSpace: 'normal' }}><i />{t('p.sample')}</span>}
        </div>
        {p.about && (<><div className="lbl">{t('p.about')}</div><div className="card" style={{ padding: 16, fontSize: 14, lineHeight: 1.55 }}>{p.about}</div></>)}
        {rows.length > 0 && <div className="lbl">{t('p.details')}</div>}
        {rows.length > 0 && (
          <div className="card">
            {rows.map(([i, k]) => (
              <div className="row" key={k}><span className="ico"><Icon name={i} size={20} color="var(--p)" /></span><span className="flex1"><div className="t" style={{ fontSize: 11 }}>{t('p.f.' + k)}</div><div className="ttl" style={{ wordBreak: 'break-word' }}>{show(p[k])}</div></span></div>
            ))}
          </div>
        )}
        <div style={{ marginTop: 16, background: 'var(--lav2)', borderRadius: 18, padding: 14, display: 'flex', gap: 12 }}>
          <Icon name="shok" size={22} color="var(--p)" />
          <div className="t" style={{ color: 'var(--ink)', lineHeight: 1.5 }}>{me.domain ? t('p.protectYes', { domain: me.domain }) : t('p.protectNo')}</div>
        </div>
      </div>
    </>
  )
}
