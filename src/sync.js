// Saves the app's state to Supabase and loads it back.
// The app keeps working with one plain state object; after every change we
// compare it with what was last saved and send only the differences.
import { supabase } from './supabase.js'
import { SEED_RECORDS } from './samples.js'
import { DEFAULT_SETTINGS } from './store.js'

const TABLES = [['history', 'checks'], ['records', 'records'], ['reports', 'reports']]

const toProfile = (row, email) => ({
  name: row?.name || '', role: row?.role || '', business: row?.business || '', industry: row?.industry || '',
  about: row?.about || '', location: row?.location || '', email: row?.business_email || '', phone: row?.phone || '',
  bank: row?.bank || '', staff: row?.staff || '', language: row?.language || 'en', accountEmail: email || '',
})
const fromProfile = (p) => ({
  name: p.name || null, role: p.role || null, business: p.business || null, industry: p.industry || null, about: p.about || null,
  location: p.location || null, business_email: p.email || null, phone: p.phone || null, bank: p.bank || null, staff: p.staff || null,
  language: p.language || 'en',
})

export async function loadCloud(user) {
  const uid = user.id
  let { data: prof, error } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle()
  if (error) throw error
  if (!prof) {
    // Trigger normally creates it; this is a fallback.
    const meta = user.user_metadata || {}
    const ins = await supabase.from('profiles').insert({ id: uid, name: meta.name || null, business: meta.business || null, language: meta.language || 'en' }).select().single()
    if (ins.error) throw ins.error
    prof = ins.data
  }
  const lists = await Promise.all(TABLES.map(([, table]) => supabase.from(table).select('data').eq('user_id', uid).order('created_at', { ascending: false }).limit(200)))
  for (const l of lists) if (l.error) throw l.error
  const [history, records, reports] = lists.map((l) => l.data.map((r) => r.data))
  return {
    history, records, reports,
    profile: toProfile(prof, user.email),
    settings: { ...DEFAULT_SETTINGS, ...(prof.settings || {}) },
    readAlerts: prof.read_alerts || [],
    onboarded: !!prof.onboarded,
  }
}

// First-time setup: sample trusted records so the demo examples work, plus the profile.
export async function finishOnboarding(uid, profile) {
  const { error } = await supabase.from('profiles').update({ ...fromProfile(profile), onboarded: true, updated_at: new Date().toISOString() }).eq('id', uid)
  if (error) throw error
  const seeds = SEED_RECORDS.map((r) => ({ user_id: uid, id: r.id, data: r }))
  await supabase.from('records').upsert(seeds, { onConflict: 'user_id,id', ignoreDuplicates: true })
  return SEED_RECORDS
}

function diffList(prev = [], next = []) {
  const before = new Map(prev.map((x) => [x.id, x]))
  const after = new Map(next.map((x) => [x.id, x]))
  const upserts = next.filter((x) => before.get(x.id) !== x)
  const deletes = prev.filter((x) => !after.has(x.id)).map((x) => x.id)
  return { upserts, deletes }
}

export async function pushDiff(uid, prev, next) {
  const jobs = []
  for (const [key, table] of TABLES) {
    if (prev[key] === next[key]) continue
    const { upserts, deletes } = diffList(prev[key], next[key])
    if (upserts.length) jobs.push(supabase.from(table).upsert(upserts.map((x) => ({ user_id: uid, id: x.id, data: x, ...(x.ts ? { created_at: x.ts } : x.savedAt ? { created_at: x.savedAt } : {}) })), { onConflict: 'user_id,id' }))
    if (deletes.length) jobs.push(supabase.from(table).delete().eq('user_id', uid).in('id', deletes))
  }
  if (prev.profile !== next.profile || prev.settings !== next.settings || prev.readAlerts !== next.readAlerts) {
    jobs.push(supabase.from('profiles').update({ ...fromProfile(next.profile), settings: next.settings, read_alerts: next.readAlerts, updated_at: new Date().toISOString() }).eq('id', uid))
  }
  const results = await Promise.all(jobs)
  const err = results.find((r) => r.error)?.error
  if (err) throw err
}
