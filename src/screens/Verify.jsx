import { useEffect, useRef, useState } from 'react'
import Icon from '../icons.jsx'
import { analyse } from '../api.js'
import { SAMPLES } from '../samples.js'
import { ACCEPT, prepareFile } from '../files.js'
import { decodeQrFile, decodeQrVideo } from '../qr.js'
import { titleFor, uid, who } from '../store.js'
import { pick, useT } from '../i18n.js'

const TABS = ['text', 'file', 'link', 'qr']
const STEPS = ['v.s1', 'v.s2', 'v.s3', 'v.s4']
const FILE_EXAMPLES = [['/samples/invoice-1048.pdf', 'v.exPdf']]
const QR_EXAMPLES = [['/samples/parking-qr.png', 'v.exQr']]

async function fetchAsFile(url) {
  const r = await fetch(url)
  if (!r.ok) throw new Error('Example not found')
  const b = await r.blob()
  return new File([b], url.split('/').pop(), { type: b.type })
}

function Camera({ onCode, onError }) {
  const video = useRef(null)
  useEffect(() => {
    let stream, raf, stopped = false, last = 0
    ;(async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
        if (stopped) return stream.getTracks().forEach((t) => t.stop())
        video.current.srcObject = stream
        await video.current.play()
        const tick = (t) => {
          if (stopped) return
          if (t - last > 180) {
            last = t
            const v = decodeQrVideo(video.current)
            if (v) { onCode(v); return }
          }
          raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      } catch (e) {
        onError(e.name === 'NotAllowedError' ? 'v.camBlocked' : 'v.camNone')
      }
    })()
    return () => { stopped = true; cancelAnimationFrame(raf); stream?.getTracks().forEach((t) => t.stop()) }
  }, [onCode, onError])
  return (
    <div className="cam">
      <video ref={video} playsInline muted />
      <div className="frame" aria-hidden="true" />
    </div>
  )
}

export default function Verify({ state, setState, setCurrent, go, pending, setPending }) {
  const { t, lang } = useT()
  const [tab, setTab] = useState(pending?.tab || 'text')
  const [text, setText] = useState(pending?.text || '')
  const [link, setLink] = useState('')
  const [upload, setUpload] = useState(null)
  const [qr, setQr] = useState(null)
  const [camera, setCamera] = useState(false)
  const [preparing, setPreparing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [aiOn, setAiOn] = useState(null)
  const fileInput = useRef(null)
  const qrInput = useRef(null)

  useEffect(() => { if (pending) setPending(null) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetch('/api/health').then((r) => r.json()).then((j) => setAiOn(!!j.ai)).catch(() => setAiOn(false))
  }, [])

  const switchTab = (id) => { setTab(id); setError(''); setCamera(false) }

  async function paste() {
    try { const s = await navigator.clipboard.readText(); if (s) setText(s.slice(0, 5000)) } catch { setError(t('v.pasteBlocked')) }
  }

  async function pickFile(f) {
    if (!f) return
    setError(''); setPreparing(true)
    try {
      const prepared = await prepareFile(f)
      setUpload({ ...prepared, size: f.size })
    } catch (e) {
      setUpload(null)
      setError(t(e.code || 'v.fileOpen'))
    } finally { setPreparing(false) }
  }

  async function pickQrImage(f) {
    if (!f) return
    setError(''); setPreparing(true)
    try {
      const v = await decodeQrFile(f)
      if (v) setQr({ value: v.slice(0, 2000), from: 'image' })
      else setError(t('v.qrNotFound'))
    } catch { setError(t('v.imgOpen')) } finally { setPreparing(false) }
  }

  const onCode = (v) => { setQr({ value: v.slice(0, 2000), from: 'camera' }); setCamera(false) }
  const onCamError = (k) => { setCamera(false); setError(t(k)) }

  function buildInput() {
    if (tab === 'text') return text.trim() ? { text: text.trim(), source: 'text' } : null
    if (tab === 'link') return link.trim() ? { text: link.trim(), source: 'link' } : null
    if (tab === 'qr') return qr ? { text: qr.value, source: 'qr' } : null
    if (tab === 'file' && upload) return { text: upload.text || '', source: 'file', file: upload.kind === 'text' ? null : upload.file }
    return null
  }
  const ready = !!buildInput()
  const prompt = t('v.need.' + tab)

  async function run() {
    const input = buildInput()
    if (!input) { setError(prompt); return }
    setError(''); setBusy(true); setStep(0)
    const t0 = Date.now()
    const timers = [550, 1100, 1650].map((ms, i) => setTimeout(() => setStep(i + 1), ms))
    try {
      const r = await analyse(input, { trusted: state.records, profile: { ...state.profile, domain: who(state.profile).domain }, lang })
      await new Promise((ok) => setTimeout(ok, Math.max(0, 2200 - (Date.now() - t0))))
      setStep(4) // all four steps ticked
      await new Promise((ok) => setTimeout(ok, 450))
      const readText = r.extractedText || input.text
      const source = tab === 'file' ? { type: 'file', name: upload.name, kind: upload.kind, thumb: upload.thumb || null } : { type: tab }
      const title = tab === 'file' && !readText.trim() ? upload.name : titleFor(r, readText, t)
      const item = { id: uid(), ts: new Date().toISOString(), input: readText.slice(0, 5000), title, result: r, source }
      setState((s) => ({ ...s, history: [item, ...s.history].slice(0, 50) }))
      setCurrent(item)
      go('result')
    } catch (e) {
      setError(e.code ? t(e.code) : t('err.generic'))
    } finally {
      timers.forEach(clearTimeout)
      setBusy(false)
    }
  }

  async function example(url, isQr) {
    try { const f = await fetchAsFile(url); isQr ? await pickQrImage(f) : await pickFile(f) } catch { setError(t('v.exFail')) }
  }

  const imageNeedsAi = tab === 'file' && upload?.kind === 'image' && aiOn === false

  return (
    <div className="sc">
      <div className="top" style={{ marginTop: 6 }}><h1 className="h1b">{t('v.title')}</h1></div>
      <p className="t" style={{ fontSize: 14, margin: '8px 0 0' }}>{t('v.sub')}</p>
      <div className="tabs" role="tablist">
        {TABS.map((id) => <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => switchTab(id)} disabled={busy}>{t('v.tab.' + id)}</button>)}
      </div>

      {tab === 'text' && (
        <div className="taw">
          <textarea className="ta" value={text} onChange={(e) => setText(e.target.value)} placeholder={t('v.textPh')} aria-label={t('v.tab.text')} disabled={busy} maxLength={5000} />
          <button className="iconbtn paste" aria-label={t('v.paste')} onClick={paste} disabled={busy}><Icon name="clipb" size={24} color="var(--p)" /></button>
        </div>
      )}

      {tab === 'text' && <div className="t" style={{ marginTop: 8 }}>{t('v.textMeta')}</div>}

      {tab === 'link' && (
        <div style={{ marginTop: 14 }}>
          <input className="inp" value={link} onChange={(e) => setLink(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && run()} placeholder={t('v.linkPh')} aria-label={t('v.tab.link')} disabled={busy} maxLength={2000} inputMode="url" />
          <div className="t" style={{ marginTop: 8 }}>{t('v.linkNote')}</div>
        </div>
      )}

      {tab === 'file' && (
        <>
          <input ref={fileInput} type="file" accept={ACCEPT} hidden onChange={(e) => { pickFile(e.target.files[0]); e.target.value = '' }} />
          {upload ? (
            <div className="filecard">
              {upload.thumb ? <img src={upload.thumb} alt="" className="fthumb" /> : <span className="fthumb ico"><Icon name="doc" size={26} color="var(--p)" /></span>}
              <div className="flex1" style={{ minWidth: 0 }}>
                <div className="ttl" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{upload.name}</div>
                <div className="t">{t('v.kind.' + upload.kind)} · {Math.max(1, Math.round(upload.size / 1024))} KB{upload.kind !== 'image' && upload.text ? ' · ' + t('v.textFound') : ''}</div>
              </div>
              <button className="link" style={{ fontWeight: 600, fontSize: 13 }} onClick={() => fileInput.current.click()} disabled={busy}>{t('v.change')}</button>
            </div>
          ) : (
            <button className="dash drop" onClick={() => fileInput.current.click()} disabled={busy || preparing}
              onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); pickFile(e.dataTransfer.files[0]) }}>
              <Icon name="cloud" size={32} color="var(--p)" />
              <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--p)', marginTop: 8 }}>{preparing ? t('v.fileOpening') : t('v.fileChoose')}</div>
              <div className="t" style={{ marginTop: 4 }}>{t('v.fileHint')}</div>
            </button>
          )}
          {imageNeedsAi && <div className="note">{t('v.imageNeedsAi')}</div>}
        </>
      )}

      {tab === 'qr' && (
        <>
          <input ref={qrInput} type="file" accept="image/*" hidden onChange={(e) => { pickQrImage(e.target.files[0]); e.target.value = '' }} />
          {camera ? (
            <>
              <Camera onCode={onCode} onError={onCamError} />
              <button className="btn out" style={{ marginTop: 10 }} onClick={() => setCamera(false)}>{t('cancel')}</button>
            </>
          ) : qr ? (
            <div className="filecard" style={{ alignItems: 'flex-start' }}>
              <span className="fthumb ico"><Icon name="qr" size={26} color="var(--p)" /></span>
              <div className="flex1" style={{ minWidth: 0 }}>
                <div className="t" style={{ fontSize: 11 }}>{t('v.qrContains')}</div>
                <div className="mono">{qr.value}</div>
              </div>
              <button className="link" style={{ fontWeight: 600, fontSize: 13 }} onClick={() => setQr(null)} disabled={busy}>{t('v.clear')}</button>
            </div>
          ) : (
            <div className="dash" style={{ padding: '24px 18px' }}>
              <Icon name="qr" size={32} color="var(--p)" />
              <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--p)', marginTop: 8 }}>{preparing ? t('v.qrReading') : t('v.qrTitle')}</div>
              <div className="t" style={{ marginTop: 4 }}>{t('v.qrSub')}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button className="btn pri sm" onClick={() => { setError(''); setCamera(true) }} disabled={preparing}><Icon name="scan" size={18} color="#fff" /> {t('v.scan')}</button>
                <button className="btn out sm" onClick={() => qrInput.current.click()} disabled={preparing}>{t('v.uploadImage')}</button>
              </div>
            </div>
          )}
        </>
      )}

      {!busy && (
        <>
          <div className="t" style={{ marginTop: 14, fontWeight: 600 }}>{t('v.try')}</div>
          <div className="chips" style={{ marginTop: 8 }}>
            {(tab === 'text' || tab === 'link') && SAMPLES.map((s) => <button key={s.id} className="chip" onClick={() => { switchTab('text'); setText(s.text) }}>{pick(s.chip, lang)}</button>)}
            {tab === 'file' && FILE_EXAMPLES.map(([u, k]) => <button key={u} className="chip" onClick={() => example(u, false)}>{t(k)}</button>)}
            {tab === 'qr' && QR_EXAMPLES.map(([u, k]) => <button key={u} className="chip" onClick={() => { setCamera(false); example(u, true) }}>{t(k)}</button>)}
          </div>
        </>
      )}

      {error && <div className="err" role="alert">{error}</div>}
      <button className="btn pri" style={{ marginTop: 18 }} onClick={run} disabled={busy || preparing || camera || (tab !== 'text' && tab !== 'link' && !ready) || imageNeedsAi}>{busy ? t('v.checking') : t('v.check')}</button>
      <div className="t" style={{ textAlign: 'center', marginTop: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}><Icon name="lock" size={14} color="var(--mut)" />{t('v.privacy')}</div>

      {busy && (
        <div className="prog" aria-live="polite">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Icon name="spark" size={26} color="var(--p)" />
            <div><div style={{ fontSize: 14.5, fontWeight: 600 }}>{tab === 'file' && upload?.kind !== 'text' ? t('v.busyFile') : t('v.busy')}</div><div className="t">{t('v.busySub')}</div></div>
          </div>
          <div className="bar"><i style={{ width: `${Math.min(100, (step + 1) * 25)}%` }} /></div>
          <div className="steps">
            {STEPS.map((s, i) => (
              <div key={s} className={`step ${i < step ? 'done' : i === step ? 'now' : ''}`}>
                <span className="dot">{i < step ? <Icon name="chk" size={16} color="var(--p)" sw={2.6} /> : <i style={{ width: 9, height: 9, borderRadius: 5, background: i === step ? '#fff' : '#8F86AE' }} />}</span>
                {t(s)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
