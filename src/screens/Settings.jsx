import { useState } from 'react'
import Icon from '../icons.jsx'
import { LANGS, useT } from '../i18n.js'
import { who } from '../store.js'
import InstallCard from './InstallCard.jsx'

function Row({ icon, title, sub, onClick, isNew, danger }) {
  const { t } = useT()
  return (
    <button className="row" onClick={onClick}>
      <span className="ico"><Icon name={icon} size={20} color={danger ? 'var(--red)' : 'var(--p)'} /></span>
      <span className="flex1"><div className="ttl" style={danger ? { color: 'var(--red)' } : null}>{title}{isNew && <span className="new">{t('new')}</span>}</div>{sub && <div className="t" style={{ fontSize: 11 }}>{sub}</div>}</span>
      {!danger && <Icon name="ch" size={18} color="#8A84A3" />}
    </button>
  )
}
function Toggle({ icon, title, sub, on, set }) {
  return (
    <div className="row">
      <span className="ico"><Icon name={icon} size={20} color="var(--p)" /></span>
      <span className="flex1"><div className="ttl">{title}</div>{sub && <div className="t" style={{ fontSize: 11 }}>{sub}</div>}</span>
      <button className={`sw ${on ? 'on' : ''}`} role="switch" aria-checked={on} aria-label={title} onClick={() => set(!on)}><i /></button>
    </div>
  )
}

export default function Settings({ state, setState, reset, go, flash, mode, user, cloud, logout, deleteAccount, leaveGuest, setLang }) {
  const { t, lang } = useT()
  const [confirmDel, setConfirmDel] = useState(false)
  const [busy, setBusy] = useState(false)
  const p = state.profile
  const me = who(p)
  const setS = (k) => (v) => setState((s) => ({ ...s, settings: { ...s.settings, [k]: v } }))
  const staff = p.staff?.startsWith('p.') ? t(p.staff) : p.staff

  return (
    <div className="sc">
      <div className="top" style={{ marginTop: 6 }}><h1 className="h1b">{t('s.title')}</h1></div>
      <button className="me" onClick={() => go('profile')}>
        <span className="av" style={{ width: 54, height: 54 }}>{me.initials}</span>
        <span className="flex1"><div style={{ fontSize: 15, fontWeight: 600 }}>{p.business}</div><div className="t">{[p.name, p.role].filter(Boolean).join(' · ') || staff}</div></span>
        <Icon name="ch" size={20} color="var(--p)" />
      </button>

      {mode === 'guest' && cloud && (
        <>
          <div className="lbl">{t('g.banner')}</div>
          <div className="card">
            <Row icon="lock" title={t('s.guestT')} sub={t('s.guestS')} onClick={() => leaveGuest('signup')} />
            <Row icon="ar" title={t('g.login')} onClick={() => leaveGuest('login')} />
            <Row icon="back" title={t('g.exit')} onClick={() => leaveGuest('welcome')} />
          </div>
        </>
      )}

      <div className="lbl">{t('s.account')}</div>
      <div className="card">
        <Row icon="bld" title={t('s.profile')} sub={p.industry || t('s.addWhat')} onClick={() => go('profile')} />
        <Row icon="bank" title={t('s.bank')} sub={p.bank || t('s.notSet')} onClick={() => go('profile')} />
        <Row icon="book" title={t('s.records')} sub={t('s.recordsSub')} isNew onClick={() => go('records')} />
      </div>
      <div className="lbl">{t('s.notifs')}</div>
      <div className="card">
        <Toggle icon="bell" title={t('s.alerts')} sub={t('s.alertsSub')} on={state.settings.alerts} set={setS('alerts')} />
        <Toggle icon="clock" title={t('s.reminders')} sub={t('s.remindersSub')} on={state.settings.reminders} set={setS('reminders')} />
      </div>
      <div className="lbl">{t('s.app')}</div>
      <div className="card"><InstallCard /></div>
      <div className="lbl">{t('s.privacy')}</div>
      <div className="card">
        <Row icon="lock" title={t('s.data')} sub={t('s.dataSub', { a: state.history.length, b: state.records.length })} onClick={() => go('privacy')} />
      </div>
      <div className="lbl">{t('s.language')}</div>
      <div className="card">
        {LANGS.map(([id, name]) => (
          <button key={id} className="row" onClick={() => setLang(id)} aria-pressed={lang === id}>
            <span className="ico"><Icon name="globe" size={20} color="var(--p)" /></span>
            <span className="flex1 ttl">{name}</span>
            {lang === id && <Icon name="chk" size={20} color="var(--p)" />}
          </button>
        ))}
      </div>

      {mode === 'user' && (
        <>
          <div className="t" style={{ marginTop: 22, textAlign: 'center' }}>{t('s.signedIn', { email: user?.email || '' })}</div>
          <div className="card" style={{ marginTop: 8 }}>
            <Row icon="ar" title={t('s.logout')} onClick={logout} />
            {confirmDel ? (
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                <span className="flex1 ttl" style={{ minWidth: 180 }}>{t('s.deleteQ')}</span>
                <button className="chip" onClick={() => setConfirmDel(false)} disabled={busy}>{t('cancel')}</button>
                <button className="chip on" style={{ background: 'var(--red)', borderColor: 'var(--red)' }} disabled={busy} onClick={async () => { setBusy(true); const ok = await deleteAccount(); if (!ok) setBusy(false) }}>{t('delete')}</button>
              </div>
            ) : <Row icon="trash" title={t('s.deleteAcc')} danger onClick={() => setConfirmDel(true)} />}
          </div>
        </>
      )}
      {mode === 'guest' && (
        <button className="link" style={{ marginTop: 24, display: 'block', width: '100%', textAlign: 'center', color: 'var(--mut)', fontSize: 12 }} onClick={() => { reset(); flash(t('s.resetDone')) }}>{t('s.reset')}</button>
      )}
      <div style={{ height: 12 }} />
    </div>
  )
}
