import { useState } from 'react'
import { useStore } from './store.js'
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

const TABS = [['home', 'Home', 'home'], ['verify', 'Verify', 'verify'], ['report', 'Report', 'flag'], ['learn', 'Learn', 'learn'], ['settings', 'Settings', 'set']]
const ACTIVE = { home: 'home', alerts: 'home', alert: 'home', verify: 'verify', result: 'verify', report: 'report', learn: 'learn', settings: 'settings', records: 'settings', profile: 'settings', privacy: 'settings' }
const SCREENS = { splash: Splash, home: Home, verify: Verify, result: Result, report: Report, reportSuccess: ReportSuccess, settings: Settings, records: Records, learn: Learn, alerts: Alerts, alert: AlertDetail, profile: Profile, privacy: Privacy }

export default function App() {
  const [state, setState, reset] = useStore()
  const [stack, setStack] = useState(['splash'])
  const [current, setCurrent] = useState(null)
  const [lastReport, setLastReport] = useState(null)
  const [pending, setPending] = useState(null) // { tab, text } to pre-fill the Verify screen
  const [alertId, setAlertId] = useState(null)
  const [toast, setToast] = useState('')
  const screen = stack[stack.length - 1]

  const nav = {
    go: (s) => setStack((st) => [...st, s]),
    replace: (s) => setStack((st) => [...st.slice(0, -1), s]),
    back: () => setStack((st) => (st.length > 1 ? st.slice(0, -1) : st)),
    tab: (s) => setStack([s]),
  }
  const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 1900) }
  const ctx = { state, setState, reset, ...nav, current, setCurrent, lastReport, setLastReport, pending, setPending, alertId, setAlertId, flash }
  const Screen = SCREENS[screen]
  const active = ACTIVE[screen]

  return (
    <div className="app">
      <Screen key={stack.length + screen} {...ctx} />
      {active && (
        <nav className="nav" aria-label="Main">
          {TABS.map(([id, label, icon]) => (
            <button key={id} className={active === id ? 'on' : ''} onClick={() => nav.tab(id)} aria-current={active === id ? 'page' : undefined}>
              <span className="pillbg"><Icon name={icon} size={22} /></span>
              {label}
            </button>
          ))}
        </nav>
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}
