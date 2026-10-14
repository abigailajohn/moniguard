import { useState } from 'react'
import { useT } from '../../i18n.js'
import { authErrorKey, supabase } from '../../supabase.js'
import { AuthHeader, Field, PasswordField, validEmail } from './AuthKit.jsx'

export default function Login({ back, replace, go, authEmail, setAuthEmail, flash }) {
  const { t } = useT()
  const [email, setEmail] = useState(authEmail || '')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [errKey, setErrKey] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!email.trim() || !password) return setErrKey('err.required')
    if (!validEmail(email)) return setErrKey('err.email')
    setErrKey(''); setBusy(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
    setBusy(false)
    if (error) setErrKey(authErrorKey(error))
    // On success the app hears the SIGNED_IN event and opens the account.
  }

  async function resendConfirm() {
    const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim().toLowerCase(), options: { emailRedirectTo: window.location.origin } })
    if (error) return setErrKey(authErrorKey(error))
    setAuthEmail(email.trim().toLowerCase())
    replace('checkEmail')
  }

  return (
    <form className="sc authsc" onSubmit={submit} noValidate>
      <AuthHeader back={back} title={t('li.title')} sub={t('li.sub')} />
      <Field label={t('f.email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" maxLength={120} />
      <PasswordField label={t('f.password')} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" maxLength={72} />
      <button type="button" className="link" style={{ marginTop: 10, fontWeight: 600, alignSelf: 'flex-end' }} onClick={() => { setAuthEmail(email); go('forgot') }}>{t('li.forgot')}</button>
      {errKey && (
        <div className="err" role="alert">
          {t(errKey)}
          {errKey === 'err.notConfirmed' && <div><button type="button" className="link" style={{ fontWeight: 600, marginTop: 6 }} onClick={resendConfirm}>{t('li.resend')}</button></div>}
        </div>
      )}
      <button className="btn pri" type="submit" style={{ marginTop: 18 }} disabled={busy}>{busy ? '…' : t('li.submit')}</button>
      <div className="t" style={{ textAlign: 'center', marginTop: 14, fontSize: 13 }}>{t('li.no')} <button type="button" className="link" style={{ fontWeight: 600 }} onClick={() => replace('signup')}>{t('li.create')}</button></div>
    </form>
  )
}
