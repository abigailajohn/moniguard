import { useState } from 'react'
import { useT } from '../../i18n.js'
import { authErrorKey, supabase } from '../../supabase.js'
import { AuthHeader, PasswordField } from './AuthKit.jsx'

// Shown when someone opens the link from a "reset password" email.
export default function ResetPassword({ flash, user }) {
  const { t } = useT()
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (pw.length < 8) return setErr(t('err.pwShort'))
    setErr(''); setBusy(true)
    const { error } = await supabase.auth.updateUser({ password: pw })
    setBusy(false)
    if (error) return setErr(t(authErrorKey(error)))
    flash(t('rp.saved'))
    // Sign out and back in cleanly so the app loads the account fresh.
    await supabase.auth.signOut()
  }

  return (
    <form className="sc authsc" onSubmit={submit} noValidate>
      <AuthHeader title={t('rp.title')} sub={user?.email} />
      <PasswordField label={t('rp.new')} hint={t('f.pwHint')} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" maxLength={72} />
      {err && <div className="err" role="alert">{err}</div>}
      <button className="btn pri" type="submit" style={{ marginTop: 18 }} disabled={busy}>{busy ? '…' : t('rp.save')}</button>
    </form>
  )
}
