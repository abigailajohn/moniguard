import { useState } from 'react'
import Icon from '../../icons.jsx'
import { useT } from '../../i18n.js'
import { authErrorKey, supabase } from '../../supabase.js'
import { AuthHeader, Field, validEmail } from './AuthKit.jsx'

export default function Forgot({ back, authEmail }) {
  const { t } = useT()
  const [email, setEmail] = useState(authEmail || '')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!validEmail(email)) return setErr(t('err.email'))
    setErr(''); setBusy(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: window.location.origin })
    setBusy(false)
    if (error) return setErr(t(authErrorKey(error)))
    setSent(true)
  }

  return (
    <form className="sc authsc" onSubmit={submit} noValidate>
      <AuthHeader back={back} title={t('fp.title')} sub={t('fp.body')} />
      {sent ? (
        <div className="okbox" role="status"><Icon name="cc" size={22} color="#1E7A4A" /><span>{t('fp.sent', { email: email.trim() })}</span></div>
      ) : (
        <>
          <Field label={t('f.email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" />
          {err && <div className="err" role="alert">{err}</div>}
          <button className="btn pri" type="submit" style={{ marginTop: 18 }} disabled={busy}>{busy ? '…' : t('fp.send')}</button>
        </>
      )}
      <button type="button" className="link" style={{ marginTop: 18, fontWeight: 600, alignSelf: 'center' }} onClick={back}>{t('fp.back')}</button>
    </form>
  )
}
