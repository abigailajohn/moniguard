import { useState } from 'react'
import Icon from '../icons.jsx'
import { LABELS } from '../labels.js'
import { uid, when } from '../store.js'

const KIND = { invoice: 'Supplier invoice', offer: 'Offer or grant', link: 'Link', message: 'Message', qr: 'QR code' }
const FICON = { risk: ['exc', 'var(--red)'], ok: ['cc', '#1E7A4A'], info: ['help', 'var(--mut)'] }

export default function Result({ current, state, setState, back, go, tab, flash }) {
  const [open, setOpen] = useState(0)
  const [showRead, setShowRead] = useState(false)
  if (!current) { return <div className="sc"><div className="empty">No result to show.<br /><button className="link" onClick={() => tab('verify')}>Check something</button></div></div> }
  const r = current.result
  const L = LABELS[r.label]
  const org = r.claimedOrg
  const domain = r.sender?.domain
  const saved = domain && state.records.some((x) => x.domain === domain)
  const canSave = (r.label === 'safe' || r.label === 'inconclusive') && domain && !saved

  function saveRecord() {
    const name = r.claimedOrg?.name || domain
    setState((s) => ({ ...s, records: [{ id: uid(), name, domain, kind: r.claimedOrg ? 'organisation' : 'supplier', savedAt: new Date().toISOString() }, ...s.records] }))
    flash('Saved to trusted records')
    go('records')
  }
  const live = current && state.history.find((h) => h.id === current.id)
  const followUp = ['suspicious', 'inconclusive'].includes(r.label)
  const done = !!live?.done
  function toggleDone() {
    setState((s) => ({ ...s, history: s.history.map((h) => (h.id === current.id ? { ...h, done: !h.done } : h)) }))
    flash(done ? 'Marked as still to check' : 'Marked as confirmed')
  }
  const src = current.source || { type: 'text' }
  const srcLine = src.type === 'file' ? src.name : src.type === 'qr' ? 'Scanned QR code' : r.sender?.address || domain || (src.type === 'link' ? 'Link' : 'Pasted text')

  async function share() {
    const msg = `MoniGuard check: ${L.chip}. ${r.subtitle}`
    try { if (navigator.share) await navigator.share({ text: msg }); else { await navigator.clipboard.writeText(msg); flash('Result copied') } } catch { /* cancelled */ }
  }

  let primary, secondary
  if (r.label === 'high' || r.label === 'suspicious') {
    primary = <button className="btn pri" onClick={() => go('report')}>Report scam <Icon name="flag" size={20} color="#fff" /></button>
    secondary = org ? <a className="btn out" href={org.url} target="_blank" rel="noreferrer noopener" style={{ textDecoration: 'none' }}>Contact official channel</a> : <button className="btn out" onClick={() => tab('verify')}>Check another</button>
  } else if (r.label === 'safe') {
    primary = canSave ? <button className="btn pri" onClick={saveRecord}><Icon name="book" size={20} color="#fff" /> Save to trusted records</button>
      : saved ? <button className="btn pri" onClick={() => go('records')}><Icon name="book" size={20} color="#fff" /> In your trusted records</button> : <button className="btn pri" onClick={() => tab('verify')}>Check another</button>
    secondary = <button className="btn out" onClick={share}>Share result</button>
  } else {
    primary = canSave ? <button className="btn pri" onClick={saveRecord}><Icon name="book" size={20} color="#fff" /> Confirmed it? Save sender</button> : <button className="btn pri" onClick={() => tab('verify')}>Check another</button>
    secondary = canSave ? <button className="btn out" onClick={() => tab('verify')}>Check another</button> : org ? <a className="btn out" href={org.url} target="_blank" rel="noreferrer noopener" style={{ textDecoration: 'none' }}>Contact official channel</a> : <button className="btn out" onClick={share}>Share result</button>
  }

  return (
    <>
      <div className="hdr">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="iconbtn" aria-label="Back" onClick={back}><Icon name="back" size={28} color="var(--ink)" /></button>
          <b>Check complete</b>
        </div>
        <button className="link" style={{ fontWeight: 600, fontSize: 14 }} onClick={() => flash('Saved to history')}>Save</button>
      </div>
      <div className="sc" style={{ paddingTop: 16 }}>
        <div className="docrow">
          {src.thumb ? <img className="thumb" src={src.thumb} alt="" style={{ objectFit: 'cover', padding: 0 }} /> : <div className="thumb" aria-hidden="true"><div style={{ fontSize: 5, fontWeight: 700 }}>{r.kind === 'invoice' ? 'INVOICE' : r.kind === 'qr' ? 'QR CODE' : 'MESSAGE'}</div><div style={{ height: 2, width: '70%', background: 'var(--p)', marginTop: 8 }} /><div style={{ height: 2, width: '50%', background: '#C9BDF0', marginTop: 5 }} /><div style={{ height: 2, width: '60%', background: '#C9BDF0', marginTop: 5 }} /></div>}
          <div className="flex1"><div style={{ fontSize: 14, fontWeight: 600 }}>{KIND[r.kind]}{r.amount ? ` · ${r.amount}` : ''}</div><div className="t" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{srcLine}</div><div className="t">{when(current.ts)}</div></div>
          <button className="link" style={{ textAlign: 'center', lineHeight: 1.3, fontSize: 12, fontWeight: 600 }} onClick={() => tab('verify')}>Check<br />another</button>
        </div>

        <div className={`banner ${L.tone}`}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><Icon name={L.icon} size={30} /><div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.2 }}>{L.banner}</div></div>
          <div style={{ fontSize: 13, marginTop: 10 }}>{r.subtitle}</div>
          {r.summary && <div style={{ fontSize: 12.5, marginTop: 8, opacity: 0.85 }}>It asks you to: {r.summary}</div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 500, marginTop: 18 }}><span>Confidence in this assessment</span><b style={{ fontSize: 13 }}>{r.confidence.value}% · {r.confidence.level}</b></div>
          <div className="conf"><i style={{ width: `${r.confidence.value}%` }} /></div>
        </div>

        <div className="sec" style={{ marginTop: 22 }}><b style={{ fontSize: 20 }}>What we found</b><span className="t">{r.findings.length} {r.findings.length === 1 ? 'detection' : 'detections'}</span></div>
        {r.findings.map((f, i) => {
          const [ico, col] = FICON[f.level]
          const isOpen = open === i
          return (
            <button key={f.id} className="find" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}>
              <div className="h"><Icon name={ico} size={26} color={col} /><div className="flex1" style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.35 }}>{f.title}</div><Icon name={isOpen ? 'up' : 'dn'} size={20} color="var(--mut)" /></div>
              {isOpen && <div className={`d ${f.level}`}>{f.detail}</div>}
            </button>
          )
        })}
        {followUp && (
          <button className={`followup ${done ? 'done' : ''}`} onClick={toggleDone} aria-pressed={done}>
            <Icon name={done ? 'cc' : 'clock'} size={22} color={done ? '#1E7A4A' : 'var(--p)'} />
            <span className="flex1"><div className="ttl">{done ? 'You confirmed this with the sender' : 'Confirmed it with the sender?'}</div><div className="t">{done ? 'Tap to undo' : 'Mark it done to clear the reminder'}</div></span>
          </button>
        )}
        {r.extractedText && (src.type === 'file') && (
          <button className="find" onClick={() => setShowRead(!showRead)} aria-expanded={showRead} style={{ marginTop: 12 }}>
            <div className="h"><Icon name="doc" size={24} color="var(--p)" /><div className="flex1" style={{ fontSize: 13.5, fontWeight: 500 }}>Text we read from your file</div><Icon name={showRead ? 'up' : 'dn'} size={20} color="var(--mut)" /></div>
            {showRead && <div className="d info" style={{ whiteSpace: 'pre-wrap', maxHeight: 240, overflow: 'auto', textAlign: 'left' }}>{r.extractedText}</div>}
          </button>
        )}
        <div className="t" style={{ marginTop: 10 }}>{r.aiUsed ? 'AI-assisted reading plus rule-based checks.' : 'Rule-based checks only (AI reading was not available).'}</div>

        <div className="next">
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>What to do next</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>{r.nextSteps.map((s) => <li key={s}>{s}</li>)}</ul>
        </div>
        <div className="t" style={{ marginTop: 14 }}><b>Not verified:</b> {r.unverified.join('. ')}. MoniGuard can be wrong and is never a guarantee.</div>
      </div>
      <div className="stack">{primary}{secondary}</div>
    </>
  )
}
