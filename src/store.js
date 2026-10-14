import { SEED_RECORDS } from './samples.js'

const KEY = 'moniguard:v1'
const GUEST = 'moniguard:guest'
export const DEFAULT_SETTINGS = { alerts: true, reminders: true }
// Sample persona used in guest mode. Everything here is editable in Business profile.
export const DEFAULT_PROFILE = {
  name: 'Aisha Patel', role: 'Owner', business: 'Port Louis Traders Ltd', industry: 'Wholesale & retail',
  about: 'Family-run wholesaler supplying stationery and packaging to shops across Port Louis.',
  location: 'Port Louis, Mauritius', email: 'aisha@pltltd.mu', phone: '', bank: 'MCB', staff: '6-10',
  language: 'en', sample: true,
}
export const freshGuest = (lang = 'en') => ({ history: [], records: SEED_RECORDS, reports: [], readAlerts: [], profile: { ...DEFAULT_PROFILE, language: lang }, settings: DEFAULT_SETTINGS })

export function loadGuest(lang) {
  try {
    const s = JSON.parse(localStorage.getItem(KEY))
    if (s && s.history && s.records) { const f = freshGuest(lang); return { ...f, ...s, profile: { ...f.profile, ...(s.profile || {}) }, settings: { ...f.settings, ...(s.settings || {}) } } }
  } catch { /* private mode or bad data */ }
  return freshGuest(lang)
}
export function saveGuest(state) { try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* ignore */ } }
export const isGuest = () => { try { return localStorage.getItem(GUEST) === '1' } catch { return false } }
export const setGuest = (on) => { try { on ? localStorage.setItem(GUEST, '1') : localStorage.removeItem(GUEST) } catch { /* ignore */ } }

const LOCALE = { en: 'en-GB', fr: 'fr-FR', mcr: 'fr-FR' }
export function when(iso, t, lang = 'en') {
  const d = new Date(iso)
  const now = new Date()
  const time = d.toLocaleTimeString(LOCALE[lang], { hour: '2-digit', minute: '2-digit', hour12: false })
  if (d.toDateString() === now.toDateString()) return t ? t('when.today', { t: time }) : `Today · ${time}`
  if (new Date(now.getTime() - 86400000).toDateString() === d.toDateString()) return t ? t('when.yesterday') : 'Yesterday'
  return d.toLocaleDateString(LOCALE[lang], { day: 'numeric', month: 'short' })
}

// Derived bits of the profile used around the app.
export function who(p) {
  const name = (p.name || '').trim()
  const first = name.split(/\s+/)[0] || 'there'
  const initials = (name || p.business || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  const m = String(p.email || '').toLowerCase().match(/@([a-z0-9.-]+\.[a-z]{2,})$/)
  const free = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'live.com', 'intnet.mu', 'orange.mu', 'myt.mu']
  const domain = m && !free.includes(m[1]) ? m[1] : null
  return { first, initials, domain }
}

// Checks that still need a follow-up from the user (used for reminders)
export const needsFollowUp = (h) => ['suspicious', 'inconclusive'].includes(h.result.label) && !h.done

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

export function titleFor(r, text, t = (k) => k) {
  const org = r.claimedOrg?.name
  const dom = r.sender?.domain
  if (r.kind === 'invoice') return [t('r.kind.invoice'), dom, r.amount].filter(Boolean).join(' · ')
  if (r.kind === 'qr') return [t('r.kind.qr'), dom].filter(Boolean).join(' · ')
  if (r.kind === 'offer') return [org, t('r.kind.offer')].filter(Boolean).join(' · ')
  if (r.kind === 'link') return dom || t('r.kind.link')
  if (org) return `${org} · ${t('r.kind.message')}`
  const s = text.replace(/\s+/g, ' ').trim()
  return s.length > 34 ? s.slice(0, 34) + '…' : s
}
export const kindIcon = (k) => ({ invoice: 'doc', offer: 'doc', link: 'link', message: 'chat', qr: 'qr', image: 'img' }[k] || 'chat')
