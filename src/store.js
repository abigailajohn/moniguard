import { useEffect, useState } from 'react'
import { SEED_RECORDS } from './samples.js'

const KEY = 'moniguard:v1'
// Sample persona from the design. Everything here is editable in Business profile.
export const DEFAULT_PROFILE = {
  name: 'Aisha Patel', role: 'Owner', business: 'Port Louis Traders Ltd', industry: 'Wholesale & retail',
  about: 'Family-run wholesaler supplying stationery and packaging to shops across Port Louis.',
  location: 'Port Louis, Mauritius', email: 'aisha@pltltd.mu', phone: '', bank: 'MCB', staff: '6-10',
  sample: true,
}
const fresh = () => ({ history: [], records: SEED_RECORDS, reports: [], readAlerts: [], profile: DEFAULT_PROFILE, settings: { alerts: true, reminders: true } })

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY))
    if (s && s.history && s.records) { const f = fresh(); return { ...f, ...s, profile: { ...f.profile, ...(s.profile || {}) }, settings: { ...f.settings, ...(s.settings || {}) } } }
  } catch { /* private mode or bad data */ }
  return fresh()
}

export function useStore() {
  const [state, setState] = useState(load)
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* ignore */ }
  }, [state])
  return [state, setState, () => setState(fresh())]
}

export function when(iso) {
  const d = new Date(iso)
  const now = new Date()
  const t = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  const same = d.toDateString() === now.toDateString()
  const y = new Date(now.getTime() - 86400000).toDateString() === d.toDateString()
  if (same) return `Today · ${t}`
  if (y) return 'Yesterday'
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' })
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

export function titleFor(r, text) {
  const org = r.claimedOrg?.name
  if (r.kind === 'invoice') return `Invoice${r.sender?.domain ? ' from ' + r.sender.domain : ''}${r.amount ? ' – ' + r.amount : ''}`
  if (r.kind === 'offer') return org ? `${org} offer` : 'Offer or grant message'
  if (r.kind === 'qr') return `QR code${r.sender?.domain ? ' – ' + r.sender.domain : ''}`
  if (r.kind === 'link') return r.sender?.domain || 'Link check'
  if (org) return `${org} message`
  const t = text.replace(/\s+/g, ' ').trim()
  return t.length > 34 ? t.slice(0, 34) + '…' : t
}
export const kindIcon = (k) => ({ invoice: 'doc', offer: 'doc', link: 'link', message: 'chat', qr: 'qr', image: 'img' }[k] || 'chat')
