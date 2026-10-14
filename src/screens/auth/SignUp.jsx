import { useState } from 'react'
import Icon from '../../icons.jsx'
import { useT } from '../../i18n.js'
import { authErrorKey, supabase } from '../../supabase.js'
import { AuthHeader, Field, PasswordField, validEmail } from './AuthKit.jsx'

export default function SignUp({ back, replace, go, lang, setAuthEmail }) {
  const { t } = useT()
  const [f, setF] = useState({ name: '', business: '', email: '', password: '' })
  const [agree, setAgree] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    const v = { name: f.name.trim(), business: f.business.trim(), email: f.email.trim().toLowerCase(), password: f.password }
    if (!v.name || !v.business || !v.email || !v.password) return setErr(t('err.required'))
    if (!validEmail(v.email)) return setErr(t('err.email'))
    if (v.password.length < 8) return setErr(t('err.pwShort'))
    if (!agree) return setErr(t('err.agree'))
    setErr(''); setBusy(true)
    const { data, error } = await supabase.auth.signUp({
      email: v.email,
      password: v.password,
      options: { data: { name: v.name, business: v.business, language: lang }, emailRedirectTo: window.location.origin },
    })
    setBusy(false)
    if (error) return setErr(t(authErrorKey(error)))
    // Supabase hides whether an email is already registered; an empty identities list means it is.
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) return setErr(t('err.exists'))
    setAuthEmail(v.email)
    if (!data.session) replace('checkEmail') // email confirmation is on
  }

  return (
    <form className="sc authsc" onSubmit={submit} noValidate>
      <AuthHeader back={back} title={t('su.title')} sub={t('su.sub')} />
      <Field label={t('f.name')} value={f.name} onChange={set('name')} autoComplete="name" maxLength={80} />
      <Field label={t('f.business')} value={f.business} onChange={set('business')} autoComplete="organization" maxLength={80} />
      <Field label={t('f.email')} type="email" value={f.email} onChange={set('email')} autoComplete="email" inputMode="email" maxLength={120} />
      <PasswordField label={t('f.password')} hint={t('f.pwHint')} value={f.password} onChange={set('password')} autoComplete="new-password" maxLength={72} />

      <details className="whatwe">
        <summary><Icon name="lock" size={18} color="var(--p)" /> {t('su.whatTitle')}</summary>
        <ul>{['su.what1', 'su.what2', 'su.what3', 'su.what4'].map((k) => <li key={k}>{t(k)}</li>)}</ul>
      </details>
      <label className="check" style={{ marginTop: 14 }}><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> {t('su.agree')}</label>

      {err && <div className="err" role="alert">{err}{err === t('err.exists') && <> <button type="button" className="link" style={{ fontWeight: 600 }} onClick={() => { setAuthEmail(f.email.trim()); replace('login') }}>{t('li.submit')}</button></>}</div>}
      <button className="btn pri" type="submit" style={{ marginTop: 18 }} disabled={busy}>{busy ? '…' : t('su.submit')}</button>
      <div className="t" style={{ textAlign: 'center', marginTop: 14, fontSize: 13 }}>{t('su.have')} <button type="button" className="link" style={{ fontWeight: 600 }} onClick={() => replace('login')}>{t('li.submit')}</button></div>
    </form>
  )
}
