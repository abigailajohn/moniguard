import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { freshGuest, isGuest, loadGuest, saveGuest, setGuest } from './store.js'
import { LangContext, rememberLang, savedLang, translate } from './i18n.js'
import { cloud, supabase } from './supabase.js'
import { finishOnboarding, loadCloud, pushDiff } from './sync.js'
import Icon from './icons.jsx'
import Splash from './screens/Splash.jsx'
import Home from './screens/Home.jsx'
import Verify from './screens/Verify.jsx'
import Result from './screens/Result.jsx'
import Report from './screens/Report.jsx'
import ReportSuccess from './screens/ReportSuccess.jsx'
import Settings from './screens/Settings.jsx'
import Records from './screens/Records.jsx'
import Learn from './screens/Learn.jsx'
import Alerts from './screens/Alerts.jsx'
import AlertDetail from './screens/AlertDetail.jsx'
import Profile from './screens/Profile.jsx'
import Privacy from './screens/Privacy.jsx'
import Welcome from './screens/auth/Welcome.jsx'
import SignUp from './screens/auth/SignUp.jsx'
import CheckEmail from './screens/auth/CheckEmail.jsx'
import Login from './screens/auth/Login.jsx'
import Forgot from './screens/auth/Forgot.jsx'
import ResetPassword from './screens/auth/ResetPassword.jsx'
import Onboarding from './screens/auth/Onboarding.jsx'

const TABS = [['home', 'home'], ['verify', 'verify'], ['report', 'flag'], ['learn', 'learn'], ['settings', 'set']]
const ACTIVE = { home: 'home', alerts: 'home', alert: 'home', verify: 'verify', result: 'verify', report: 'report', learn: 'learn', settings: 'settings', records: 'settings', profile: 'settings', privacy: 'settings' }
const SCREENS = {
  splash: Splash, home: Home, verify: Verify, result: Result, report: Report, reportSuccess: ReportSuccess, settings: Settings, records: Records, learn: Learn,
  alerts: Alerts, alert: AlertDetail, profile: Profile, privacy: Privacy,
  welcome: Welcome, signup: SignUp, checkEmail: CheckEmail, login: Login, forgot: Forgot, resetPassword: ResetPassword, onboarding: Onboarding,
}
const AUTH_SCREENS = ['welcome', 'signup', 'checkEmail', 'login', 'forgot']

export default function App() {
  const [preLang, setPreLang] = useState(savedLang) // language before sign-in
  const [mode, setMode] = useState('boot') // boot | out | guest | user | loading | error
  const [user, setUser] = useState(null)
  const [state, setStateRaw] = useState(null)
  const synced = useRef(null)
  const modeRef = useRef('boot')
  const [stack, setStack] = useState(['splash'])
  const [current, setCurrent] = useState(null)
  const [lastReport, setLastReport] = useState(null)
  const [pending, setPending] = useState(null) // { tab, text } to pre-fill the Verify screen
  const [alertId, setAlertId] = useState(null)
  const [authEmail, setAuthEmail] = useState('') // carried between sign-up / check-email / login
  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)

  const lang = state?.profile?.language || preLang
  const t = useCallback((k, p) => translate(lang, k, p), [lang])
  const i18n = useMemo(() => ({ lang, t }), [lang, t])
  useEffect(() => { document.documentElement.lang = lang === 'mcr' ? 'mfe' : lang }, [lang])

  const go = (s) => setStack((st) => [...st, s])
  const replace = (s) => setStack((st) => [...st.slice(0, -1), s])
  const back = () => setStack((st) => (st.length > 1 ? st.slice(0, -1) : st))
  const tab = (s) => setStack([s])
  const flash = useCallback((m) => { setToast(m); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(''), 2200) }, [])
  const setModeBoth = (m) => { modeRef.current = m; setMode(m) }

  // ---- Sessions -------------------------------------------------------------
  const enterUser = useCallback(async (u) => {
    setUser(u)
    setModeBoth('loading')
    if (window.location.hash.includes('access_token') || window.location.hash === '#') window.history.replaceState(null, '', window.location.pathname)
    try {
      const data = await loadCloud(u)
      const { onboarded, ...rest } = data
      synced.current = rest
      setStateRaw(rest)
      rememberLang(rest.profile.language)
      setModeBoth('user')
      setStack([onboarded ? 'home' : 'onboarding'])
    } catch (e) {
      console.error('Could not load account', e)
      setModeBoth('error')
    }
  }, [])

  const enterGuest = useCallback(() => {
    setGuest(true)
    const s = loadGuest(preLang)
    setStateRaw(s)
    setModeBoth('guest')
    setStack(['home'])
  }, [preLang])

  const toWelcome = useCallback((screen = 'welcome') => {
    setUser(null); setStateRaw(null); synced.current = null; setCurrent(null)
    setModeBoth('out')
    setStack([screen])
  }, [])

  useEffect(() => {
    let alive = true
    const minSplash = new Promise((ok) => setTimeout(ok, 1300))
    ;(async () => {
      if (!cloud) { await minSplash; if (alive) enterGuest(); return }
      const { data } = await supabase.auth.getSession()
      await minSplash
      if (!alive || modeRef.current !== 'boot') return
      if (data.session?.user) enterUser(data.session.user)
      else if (isGuest()) enterGuest()
      else toWelcome()
    })()
    if (!cloud) return () => { alive = false }
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      // Defer: Supabase recommends not calling other Supabase methods inside this callback.
      setTimeout(() => {
        if (event === 'PASSWORD_RECOVERY') { setUser(session?.user || null); setModeBoth('out'); setStack(['resetPassword']); return }
        if (event === 'SIGNED_IN' && session?.user && !['user', 'loading'].includes(modeRef.current) && modeRef.current !== 'boot') { setGuest(false); enterUser(session.user) }
        if (event === 'SIGNED_OUT') toWelcome()
      }, 0)
    })
    return () => { alive = false; sub.subscription.unsubscribe() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Saving ---------------------------------------------------------------
  useEffect(() => {
    if (!state) return
    if (mode === 'guest') saveGuest(state)
    if (mode === 'user' && user && synced.current && state !== synced.current) {
      const prev = synced.current
      synced.current = state
      pushDiff(user.id, prev, state).catch((e) => { console.error(e); flash(t('sync.fail')) })
    }
  }, [state, mode, user, flash, t])

  const setState = setStateRaw

  const setLang = (l) => {
    rememberLang(l)
    setPreLang(l)
    if (state) setStateRaw((s) => ({ ...s, profile: { ...s.profile, language: l } }))
  }

  const actions = {
    startGuest: enterGuest,
    leaveGuest: (screen = 'signup') => { setGuest(false); toWelcome(screen) },
    logout: async () => { await supabase?.auth.signOut(); flash(t('s.loggedOut')) },
    deleteAccount: async () => {
      const { error } = await supabase.rpc('delete_my_account')
      if (error) { flash(t('err.generic')); return false }
      await supabase.auth.signOut()
      flash(t('s.deleted'))
      return true
    },
    completeOnboarding: async (profile) => {
      const records = await finishOnboarding(user.id, profile)
      const next = { ...state, profile, records: state.records.length ? state.records : records }
      synced.current = next
      setStateRaw(next)
      setStack(['home'])
    },
    reset: () => setStateRaw(freshGuest(lang)),
  }

  const ctx = {
    state, setState, user, mode, cloud, lang, setLang, t, go, replace, back, tab,
    current, setCurrent, lastReport, setLastReport, pending, setPending, alertId, setAlertId, flash,
    authEmail, setAuthEmail, ...actions,
  }

  let screen = stack[stack.length - 1]
  if (mode === 'boot' || mode === 'loading') screen = 'splash'
  const needsState = !AUTH_SCREENS.includes(screen) && !['splash', 'resetPassword'].includes(screen)
  const Screen = SCREENS[screen]
  const active = ACTIVE[screen]

  return (
    <LangContext.Provider value={i18n}>
      <div className="app">
        {mode === 'error' ? (
          <div className="sc center">
            <Icon name="warn" size={40} color="var(--red)" />
            <p style={{ textAlign: 'center', marginTop: 12 }}>{t('err.generic')}</p>
            <button className="btn pri" style={{ marginTop: 12 }} onClick={() => user && enterUser(user)}>{t('continue')}</button>
            <button className="btn out" style={{ marginTop: 10 }} onClick={actions.logout}>{t('s.logout')}</button>
          </div>
        ) : needsState && !state ? null : (
          <Screen key={stack.length + screen} {...ctx} loading={mode === 'loading'} />
        )}
        {active && state && (
          <nav className="nav" aria-label="Main">
            {TABS.map(([id, icon]) => (
              <button key={id} className={active === id ? 'on' : ''} onClick={() => tab(id)} aria-current={active === id ? 'page' : undefined}>
                <span className="pillbg"><Icon name={icon} size={22} /></span>
                {t('nav.' + id)}
              </button>
            ))}
          </nav>
        )}
        {toast && <div className="toast" role="status">{toast}</div>}
      </div>
    </LangContext.Provider>
  )
}

