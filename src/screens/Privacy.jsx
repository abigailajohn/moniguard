import { useState } from 'react'
import Icon from '../icons.jsx'
import { useT } from '../i18n.js'
import { Header } from './Alerts.jsx'

export default function Privacy({ state, setState, back, flash, mode }) {
  const { t } = useT()
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
    ['clock', 'd.checks', t('d.nSaved', { n: state.history.length })],
    ['book', 'd.records', t('d.nSaved', { n: state.records.length })],
    ['flag', 'd.reports', t('d.nSent', { n: state.reports.length })],
    ['bld', 'd.profile', state.profile.business],
  ]
  return (
    <>
      <Header title={t('d.title')} back={back} />
      <div className="sc" style={{ paddingTop: 12 }}>
        <div className="lbl" style={{ marginTop: 8 }}>{mode === 'user' ? t('d.cloud') : t('d.local', { kb })}</div>
        <div className="card">{items.map(([i, k, v]) => <div className="row" key={k}><span className="ico"><Icon name={i} size={20} color="var(--p)" /></span><span className="flex1 ttl">{t(k)}</span><span className="t" style={{ maxWidth: 140, textAlign: 'right' }}>{v}</span></div>)}</div>
        <div className="lbl">{t('d.what')}</div>
        <div className="card" style={{ padding: 16, fontSize: 13.5, lineHeight: 1.6 }}>
          <p style={{ margin: 0 }}>{t('d.p1')}</p>
          <p style={{ margin: '10px 0 0' }}>{mode === 'user' ? t('d.p2cloud') : t('d.p2local')}</p>
        </div>
        <div className="card" style={{ marginTop: 16 }}>
          <button className="row" onClick={download}><span className="ico"><Icon name="doc" size={20} color="var(--p)" /></span><span className="flex1 ttl">{t('d.download')}</span><Icon name="ch" size={18} color="#8A84A3" /></button>
          {confirm ? (
            <div className="row" style={{ gap: 8 }}>
              <span className="flex1 ttl">{t('d.delQ')}</span>
              <button className="chip" onClick={() => setConfirm(false)}>{t('cancel')}</button>
              <button className="chip on" onClick={() => { setState((s) => ({ ...s, history: [], reports: [] })); setConfirm(false); flash(t('d.deleted')) }}>{t('delete')}</button>
            </div>
          ) : <button className="row" onClick={() => setConfirm(true)}><span className="ico"><Icon name="trash" size={20} color="var(--red)" /></span><span className="flex1 ttl" style={{ color: 'var(--red)' }}>{t('d.delHist')}</span></button>}
        </div>
      </div>
    </>
  )
}
