import Icon from '../icons.jsx'
import { labels } from '../labels.js'
import { ALERTS } from '../alerts.js'
import { pick, useT } from '../i18n.js'
import { kindIcon, needsFollowUp, when, who } from '../store.js'
import InstallCard from './InstallCard.jsx'
import CheckRow from './CheckRow.jsx'

const TILES = [['chat', 'message', 'text'], ['mail', 'email', 'text'], ['link', 'link', 'link'], ['doc', 'invoice', 'file'], ['img', 'screenshot', 'file'], ['qr', 'qr', 'qr']]

export default function Home({ state, go, tab, setCurrent, setPending, setAlertId, mode, cloud, leaveGuest }) {
  const { t, lang } = useT()
  const L = labels(lang)
  const p = state.profile
  const me = who(p)
  const open = (item) => { setCurrent(item); go('result') }
  const verify = (v) => { setPending({ tab: v }); tab('verify') }
  const unread = ALERTS.filter((a) => !state.readAlerts.includes(a.id)).length
  const follow = state.settings.reminders ? state.history.filter(needsFollowUp) : []
  const dot = (state.settings.alerts && unread > 0) || follow.length > 0
  const latest = ALERTS[0]
  const checked = state.history.length
  const flagged = state.history.filter((h) => ['high', 'suspicious'].includes(h.result.label)).length

  return (
    <div className="sc">
      <div className="top">
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{t('home.hi', { name: me.first })}</div>
          <div className="t" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.business}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="iconbtn" aria-label={t('home.notif')} onClick={() => go('alerts')} style={{ position: 'relative' }}>
            <Icon name="bell" size={26} color="var(--ink)" />
            {dot && <i style={{ position: 'absolute', top: 6, right: 7, width: 9, height: 9, borderRadius: 5, background: '#F6B73C', border: '2px solid var(--bg)' }} />}
          </button>
          <button className="av" aria-label={t('home.profile')} onClick={() => go('profile')} style={{ width: 44, height: 44, background: 'var(--lav)', fontSize: 14, border: 0 }}>{me.initials}</button>
        </div>
      </div>
      {mode === 'guest' && cloud && (
        <div className="guestbar">
          <span className="flex1">{t('g.banner')}</span>
          <button className="link" onClick={() => leaveGuest('login')}>{t('g.login')}</button>
          <button className="link" onClick={() => leaveGuest('signup')}>{t('g.signup')}</button>
        </div>
      )}
      <h1 style={{ marginTop: 18 }}>{t('home.q')}</h1>
      <button className="verifycard" onClick={() => tab('verify')}>
        <span className="big"><Icon name="scan" size={30} color="var(--p)" /></span>
        <span className="flex1"><div style={{ fontSize: 18, fontWeight: 600, color: 'var(--p)' }}>{t('home.vt')}</div><div className="t" style={{ fontSize: 12.5 }}>{t('home.vs')}</div></span>
        <Icon name="ur" size={22} color="var(--p)" />
      </button>
      <div className="grid3">
        {TILES.map(([i, k, v]) => (
          <button key={k} className="tile" onClick={() => verify(v)}><Icon name={i} size={24} /><span>{t('tile.' + k)}</span></button>
        ))}
      </div>
      <button className="manage on" onClick={() => go('records')}>
        <div className="ico" style={{ width: 44, height: 44, background: 'var(--lav)' }}><Icon name="book" size={22} color="var(--p)" /></div>
        <div className="flex1"><div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{t('home.manage')}</div><div className="t">{t('home.manageSub', { n: state.records.length })}</div></div>
        <Icon name="ch" size={18} color="#8A84A3" />
      </button>

      {follow.length > 0 && (
        <button className="alert" style={{ background: 'var(--lav2)' }} onClick={() => go('alerts')}>
          <Icon name="clock" size={24} color="var(--p)" />
          <div className="flex1"><div style={{ fontSize: 13.5, fontWeight: 600 }}>{follow.length === 1 ? t('home.follow1') : t('home.followN', { n: follow.length })}</div><div className="t" style={{ marginTop: 2 }}>{t('home.followSub')}</div></div>
          <Icon name="ch" size={18} color="#8A84A3" />
        </button>
      )}

      <InstallCard compact />

      <div className="sec"><b>{t('home.recent')}</b>{checked > 3 && <button className="link" style={{ fontWeight: 600 }} onClick={() => go('history')}>{t('home.seeAll')}</button>}</div>
      {state.history.length ? (
        <div className="card" style={{ marginTop: 12, padding: '2px 16px' }}>
          {state.history.slice(0, 3).map((h) => <CheckRow key={h.id} h={h} onClick={() => open(h)} />)}
        </div>
      ) : (
        <div className="card empty" style={{ marginTop: 12 }}>{t('home.empty1')}<br />{t('home.empty2')}<br /><button className="link" style={{ marginTop: 8 }} onClick={() => tab('verify')}>{t('home.checkSomething')}</button></div>
      )}
      {state.settings.alerts && (
        <button className="alert" onClick={() => { setAlertId(latest.id); go('alert') }}>
          <Icon name="warn" size={24} color="#8A5A00" />
          <div className="flex1"><div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.35 }}>{t('home.alert', { t: pick(latest.title, lang) })}</div><div style={{ fontSize: 12.5, fontWeight: 600, color: '#8A5A00', marginTop: 8 }}>{t('home.alertCta')}</div></div>
          <Icon name="ch" size={18} color="#8A5A00" />
        </button>
      )}
      <div className="sec"><b>{t('home.tips')}</b></div>
      <div style={{ marginTop: 12, background: 'var(--lav)', borderRadius: 20, padding: 16 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{t('home.tip1t')}</div>
        <div className="t" style={{ marginTop: 4 }}>{t('home.tip1b')}</div>
      </div>
    </div>
  )
}
