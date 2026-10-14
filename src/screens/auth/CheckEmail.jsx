import { useEffect, useState } from 'react'
import Icon from '../../icons.jsx'
import { useT } from '../../i18n.js'
import { authErrorKey, supabase } from '../../supabase.js'

export default function CheckEmail({ authEmail, replace, flash }) {
  const { t } = useT()
  const [wait, setWait] = useState(60)
  const [err, setErr] = useState('')
  useEffect(() => { if (wait <= 0) return; const id = setTimeout(() => setWait(wait - 1), 1000); return () => clearTimeout(id) }, [wait])

  const [before, after] = t('ce.body', { email: '\u0000' }).split('\u0000')

  async function resend() {
    setErr('')
    const { error } = await supabase.auth.resend({ type: 'signup', email: authEmail, options: { emailRedirectTo: window.location.origin } })
    if (error) return setErr(t(authErrorKey(error)))
    flash(t('ce.resent')); setWait(60)
  }

  return (
    <div className="sc authsc" style={{ alignItems: 'center', textAlign: 'center' }}>
      <div style={{ flex: 1 }} />
      <div className="bigico"><Icon name="mail" size={40} color="var(--p)" /></div>
      <h1 style={{ marginTop: 22 }}>{t('ce.title')}</h1>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--mut)', marginTop: 10 }}>{before}<b style={{ color: 'var(--ink)', wordBreak: 'break-all' }}>{authEmail}</b>{after}</p>
      <div className="note" style={{ marginTop: 6 }}>{t('ce.tip')}</div>
      {err && <div className="err" role="alert">{err}</div>}
      <div style={{ flex: 1 }} />
      <button className="btn pri" style={{ marginTop: 24 }} onClick={() => replace('login')}>{t('ce.already')}</button>
      <button className="btn out" style={{ marginTop: 10 }} onClick={resend} disabled={wait > 0}>{wait > 0 ? t('ce.resendIn', { s: wait }) : t('ce.resend')}</button>
      <button className="link" style={{ marginTop: 16, fontWeight: 600 }} onClick={() => replace('signup')}>{t('ce.wrong')}</button>
    </div>
  )
}
