import { useState } from 'react'
import Icon from '../icons.jsx'
import { useT } from '../i18n.js'
import { Header } from './Alerts.jsx'

export default function Records({ state, setState, back, tab }) {
  const { t, lang } = useT()
  const [q, setQ] = useState('')
  const [kind, setKind] = useState('all')
  const list = state.records.filter((r) => (kind === 'all' || r.kind === kind) && (`${r.name} ${r.domain}`).toLowerCase().includes(q.toLowerCase()))
  const remove = (id) => setState((s) => ({ ...s, records: s.records.filter((r) => r.id !== id) }))
  const fmt = (iso) => new Date(iso).toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'short' })
  return (
    <>
      <Header title={t('rec.title')} back={back} />
      <div className="sc" style={{ paddingTop: 12 }}>
        <p className="t" style={{ fontSize: 13.5, margin: '4px 0 14px', lineHeight: 1.5 }}>{t('rec.intro')}</p>
        <label className="search"><Icon name="srch" size={20} color="#8A84A3" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('rec.search')} aria-label={t('rec.search')} /></label>
        <div className="chips">
          {[['all', 'rec.all'], ['supplier', 'rec.suppliers'], ['organisation', 'rec.orgs']].map(([k, l]) => <button key={k} className={`chip ${kind === k ? 'on' : ''}`} onClick={() => setKind(k)}>{t(l)}</button>)}
        </div>
        {list.length ? list.map((r) => (
          <div className="rec" key={r.id}>
            <span className="av" style={{ width: 46, height: 46, background: 'var(--lav)', fontSize: 14 }}>{r.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}</span>
            <span className="flex1">
              <div style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</div>
              <div className="t">{r.domain} · {r.kind === 'supplier' ? t('rec.supplier') : t('rec.org')}</div>
              <div style={{ marginTop: 6 }}>{r.sample ? <span className="pill grey"><i />{t('rec.sample')}</span> : <span className="pill green"><i />{t('rec.verified', { d: fmt(r.savedAt) })}</span>}</div>
            </span>
            <button className="iconbtn" aria-label={t('rec.remove', { n: r.name })} onClick={() => remove(r.id)}><Icon name="trash" size={20} color="#8A84A3" /></button>
          </div>
        )) : <div className="empty">{t('rec.empty1')}<br />{t('rec.empty2')}<br /><button className="link" onClick={() => tab('verify')}>{t('home.checkSomething')}</button></div>}
        <div style={{ marginTop: 16, background: 'var(--abg)', borderRadius: 18, padding: 14, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Icon name="warn" size={22} color="#8A5A00" />
          <div><div style={{ fontSize: 13, fontWeight: 600 }}>{t('rec.howT')}</div><div className="t" style={{ color: '#5A4200', marginTop: 2 }}>{t('rec.howB')}</div></div>
        </div>
      </div>
    </>
  )
}
