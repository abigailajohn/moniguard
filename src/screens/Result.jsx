import { useEffect, useState } from 'react'
import Icon from '../icons.jsx'
import { labels } from '../labels.js'
import { useT } from '../i18n.js'
import { uid, when } from '../store.js'

const FICON = { risk: ['exc', 'var(--red)'], ok: ['cc', '#1E7A4A'], info: ['help', 'var(--mut)'] }

// Counts a number up from 0, for the confidence figure.
function useCountUp(target, ms = 1200) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setN(target); return }
    let raf
    const t0 = performance.now() + 350
    const step = (now) => {
      const p = Math.min(1, Math.max(0, (now - t0) / ms))
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return n
}

export default function Result({ current, state, setState, back, go, tab, flash }) {
  const { t, lang } = useT()
  const [open, setOpen] = useState(0)
  const [showRead, setShowRead] = useState(false)
  const shown = useCountUp(current?.result?.confidence?.value || 0)
  useEffect(() => {
    // A short buzz on phones that support it when something is high risk.
    if (current?.result?.label === 'high' && Date.now() - new Date(current.ts).getTime() < 5000) navigator.vibrate?.([40, 60, 40])
  }, [current])
  if (!current) { return <div className="sc"><div className="empty">{t('r.none')}<br /><button className="link" onClick={() => tab('verify')}>{t('home.checkSomething')}</button></div></div> }
  const r = current.result
  const L = labels(lang)[r.label]
  const org = r.claimedOrg
  const domain = r.sender?.domain
  const saved = domain && state.records.some((x) => x.domain === domain)
  const canSave = (r.label === 'safe' || r.label === 'inconclusive') && domain && !saved

  function saveRecord() {
    const name = r.claimedOrg?.name || domain
    setState((s) => ({ ...s, records: [{ id: uid(), name, domain, kind: r.claimedOrg ? 'organisation' : 'supplier', savedAt: new Date().toISOString() }, ...s.records] }))
    flash(t('r.savedRecord'))
    go('records')
  }
  const live = current && state.history.find((h) => h.id === current.id)
  const followUp = ['suspicious', 'inconclusive'].includes(r.label)
  const done = !!live?.done
  function toggleDone() {
    setState((s) => ({ ...s, history: s.history.map((h) => (h.id === current.id ? { ...h, done: !h.done } : h)) }))
    flash(done ? t('r.markedTodo') : t('r.markedDone'))
  }
  const src = current.source || { type: 'text' }
  const srcLine = src.type === 'file' ? src.name : src.type === 'qr' ? t('r.scannedQr') : r.sender?.address || domain || (src.type === 'link' ? t('r.kind.link') : t('r.pasted'))

  async function share() {
    const msg = t('r.shareMsg', { label: L.chip, sub: r.subtitle })
    try { if (navigator.share) await navigator.share({ text: msg }); else { await navigator.clipboard.writeText(msg); flash(t('r.copied')) } } catch { /* cancelled */ }
  }

  let primary, secondary
  if (r.label === 'high' || r.label === 'suspicious') {
    primary = <button className="btn pri" onClick={() => go('report')}>{t('r.report')} <Icon name="flag" size={20} color="#fff" /></button>
    secondary = org ? <a className="btn out" href={org.url} target="_blank" rel="noreferrer noopener" style={{ textDecoration: 'none' }}>{t('r.official')}</a> : <button className="btn out" onClick={() => tab('verify')}>{t('r.another')}</button>
  } else if (r.label === 'safe') {
    primary = canSave ? <button className="btn pri" onClick={saveRecord}><Icon name="book" size={20} color="#fff" /> {t('r.saveRecord')}</button>
      : saved ? <button className="btn pri" onClick={() => go('records')}><Icon name="book" size={20} color="#fff" /> {t('r.inRecords')}</button> : <button className="btn pri" onClick={() => tab('verify')}>{t('r.another')}</button>
    secondary = <button className="btn out" onClick={share}>{t('r.share')}</button>
  } else {
    primary = canSave ? <button className="btn pri" onClick={saveRecord}><Icon name="book" size={20} color="#fff" /> {t('r.confirmSave')}</button> : <button className="btn pri" onClick={() => tab('verify')}>{t('r.another')}</button>
    secondary = canSave ? <button className="btn out" onClick={() => tab('verify')}>{t('r.another')}</button> : org ? <a className="btn out" href={org.url} target="_blank" rel="noreferrer noopener" style={{ textDecoration: 'none' }}>{t('r.official')}</a> : <button className="btn out" onClick={share}>{t('r.share')}</button>
  }

  return (
    <>
      <div className="hdr">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="iconbtn" aria-label="Back" onClick={back}><Icon name="back" size={28} color="var(--ink)" /></button>
          <b>{t('r.title')}</b>
        </div>
      </div>
      <div className="sc" style={{ paddingTop: 16 }}>
        <div className="docrow">
          {src.thumb ? <img className="thumb" src={src.thumb} alt="" style={{ objectFit: 'cover', padding: 0 }} /> : <div className="thumb" aria-hidden="true"><div style={{ fontSize: 5, fontWeight: 700 }}>{r.kind === 'invoice' ? 'INVOICE' : r.kind === 'qr' ? 'QR CODE' : 'MESSAGE'}</div><div style={{ height: 2, width: '70%', background: 'var(--p)', marginTop: 8 }} /><div style={{ height: 2, width: '50%', background: '#C9BDF0', marginTop: 5 }} /><div style={{ height: 2, width: '60%', background: '#C9BDF0', marginTop: 5 }} /></div>}
          <div className="flex1"><div style={{ fontSize: 14, fontWeight: 600 }}>{t('r.kind.' + r.kind)}{r.amount ? ` · ${r.amount}` : ''}</div><div className="t" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{srcLine}</div><div className="t">{when(current.ts, t, lang)}</div></div>
          <button className="link" style={{ textAlign: 'center', lineHeight: 1.3, fontSize: 12, fontWeight: 600 }} onClick={() => tab('verify')}>{t('r.another')}</button>
        </div>

        <div className={`banner ${L.tone}`}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><Icon name={L.icon} size={30} /><div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.2 }}>{L.banner}</div></div>
          <div style={{ fontSize: 13, marginTop: 10 }}>{r.subtitle}</div>
          {r.summary && <div style={{ fontSize: 12.5, marginTop: 8, opacity: 0.85 }}>{t('r.asks', { s: r.summary })}</div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 500, marginTop: 18 }}><span>{t('r.conf')}</span><b style={{ fontSize: 13 }}>{shown}% · {t('r.lvl.' + r.confidence.level)}</b></div>
          <div className="conf"><i style={{ width: `${r.confidence.value}%` }} /></div>
        </div>

        <div className="sec" style={{ marginTop: 22 }}><b style={{ fontSize: 20 }}>{t('r.found')}</b><span className="t">{r.findings.length === 1 ? t('r.det1') : t('r.detN', { n: r.findings.length })}</span></div>
        {r.findings.map((f, i) => {
          const [ico, col] = FICON[f.level]
          const isOpen = open === i
          return (
            <button key={f.id} className="find" style={{ '--i': i }} onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}>
              <div className="h"><Icon name={ico} size={26} color={col} /><div className="flex1" style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.35 }}>{f.title}</div><Icon name={isOpen ? 'up' : 'dn'} size={20} color="var(--mut)" /></div>
              {isOpen && <div className={`d ${f.level}`}>{f.detail}</div>}
            </button>
          )
        })}
        {followUp && (
          <button className={`followup ${done ? 'done' : ''}`} onClick={toggleDone} aria-pressed={done}>
            <Icon name={done ? 'cc' : 'clock'} size={22} color={done ? '#1E7A4A' : 'var(--p)'} />
            <span className="flex1"><div className="ttl">{done ? t('r.followDone') : t('r.followQ')}</div><div className="t">{done ? t('r.undo') : t('r.followQs')}</div></span>
          </button>
        )}
        {r.extractedText && (src.type === 'file') && (
          <button className="find" onClick={() => setShowRead(!showRead)} aria-expanded={showRead} style={{ marginTop: 12 }}>
            <div className="h"><Icon name="doc" size={24} color="var(--p)" /><div className="flex1" style={{ fontSize: 13.5, fontWeight: 500 }}>{t('r.readText')}</div><Icon name={showRead ? 'up' : 'dn'} size={20} color="var(--mut)" /></div>
            {showRead && <div className="d info" style={{ whiteSpace: 'pre-wrap', maxHeight: 240, overflow: 'auto', textAlign: 'left' }}>{r.extractedText}</div>}
          </button>
        )}
        <div className="t" style={{ marginTop: 10 }}>{r.aiUsed ? t('r.ai') : t('r.rules')}</div>

        <div className="next">
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{t('r.next')}</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>{r.nextSteps.map((s) => <li key={s}>{s}</li>)}</ul>
        </div>
        <div className="t" style={{ marginTop: 14 }}><b>{t('r.notVerified')}</b> {r.unverified.join('. ')}. {t('r.wrong')}</div>
      </div>
      <div className="stack">{primary}{secondary}</div>
    </>
  )
}
