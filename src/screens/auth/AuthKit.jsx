import { useState } from 'react'
import Icon from '../../icons.jsx'
import { LANGS, useT } from '../../i18n.js'

export function Logo({ size = 64, animate = false }) {
  return (
    <svg width={size} height={size * 150 / 140} viewBox="0 0 140 150" aria-hidden="true" className={animate ? 'logo-anim' : undefined}>
      <path d="M10 28C40 28 55 18 70 8c15 10 30 20 60 20v48c0 34-26 56-60 70C36 132 10 110 10 76z" fill="#8B6FE6" />
      <path d="M10 28C40 28 55 18 70 8v128C36 132 10 110 10 76z" fill="#fff" fillOpacity=".1" />
      <path className="tick" d="m44 74 20 20 34-34" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <circle className="badge" cx="108" cy="112" r="17" fill="#F6B73C" />
      <text className="badge"  x="108" y="118" textAnchor="middle" fontFamily="Poppins,sans-serif" fontWeight="700" fontSize="17" fill="#1E1B2E">M</text>
    </svg>
  )
}

export function AuthHeader({ back, title, sub }) {
  const { t } = useT()
  return (
    <>
      {back && <button className="iconbtn" aria-label={t('back')} onClick={back} style={{ marginLeft: -6 }}><Icon name="back" size={28} color="var(--ink)" /></button>}
      <h1 style={{ marginTop: back ? 10 : 0 }}>{title}</h1>
      {sub && <p className="t" style={{ fontSize: 14, margin: '8px 0 0', lineHeight: 1.5 }}>{sub}</p>}
    </>
  )
}

export function Field({ label, hint, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input className="inp" {...props} />
      {hint && <em className="hint">{hint}</em>}
    </label>
  )
}

export function PasswordField({ label, hint, ...props }) {
  const { t } = useT()
  const [show, setShow] = useState(false)
  return (
    <label className="field">
      <span>{label}</span>
      <span className="pwwrap">
        <input className="inp" type={show ? 'text' : 'password'} {...props} />
        <button type="button" className="link pwtoggle" onClick={() => setShow(!show)} aria-pressed={show}>{show ? t('hidePw') : t('showPw')}</button>
      </span>
      {hint && <em className="hint">{hint}</em>}
    </label>
  )
}

export function LangPicker({ lang, setLang }) {
  // A dropdown scales to any number of languages; on phones it opens the native picker.
  return (
    <label className="langsel">
      <Icon name="globe" size={18} color="var(--p)" />
      <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Language / Langue / Lang">
        {LANGS.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
      </select>
      <Icon name="dn" size={16} color="var(--p)" />
    </label>
  )
}

export const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim())
