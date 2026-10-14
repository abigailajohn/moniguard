// One handler, used by both Vercel (api/analyse.js) and the local/Render server (server.js).
import { collect, applyAi, buildResult } from './engine.js'
import { aiExtract } from './ai.js'

const FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
const MAX_B64 = 4_200_000 // about 3 MB of file
const SOURCES = ['text', 'link', 'qr', 'file']
const LANGS = ['en', 'fr', 'mcr']
const WINDOW = 10 * 60 * 1000
const LIMIT_USER = 40 // checks per 10 minutes for a signed-in user
const LIMIT_GUEST = 12 // checks per 10 minutes per IP without an account
const AI_DAILY = Number(process.env.AI_DAILY_LIMIT || 400) // protects your API credit

const hits = new Map()
function limited(key, max) {
  const now = Date.now()
  const recent = (hits.get(key) || []).filter((t) => now - t < WINDOW)
  recent.push(now)
  hits.set(key, recent)
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW)) hits.delete(k)
  return recent.length > max
}

let aiDay = ''
let aiCount = 0
function aiBudgetLeft() {
  const d = new Date().toISOString().slice(0, 10)
  if (d !== aiDay) { aiDay = d; aiCount = 0 }
  return aiCount < AI_DAILY
}

// Checks the Supabase login token, so only real users get the higher limits.
const SB_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SB_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
const tokenCache = new Map()
async function userFromToken(token) {
  if (!token || !SB_URL || !SB_KEY) return null
  const c = tokenCache.get(token)
  if (c && c.exp > Date.now()) return c.user
  try {
    const r = await fetch(`${SB_URL}/auth/v1/user`, { headers: { apikey: SB_KEY, Authorization: `Bearer ${token}` } })
    const user = r.ok ? await r.json() : null
    const out = user?.id ? { id: user.id } : null
    tokenCache.set(token, { user: out, exp: Date.now() + 5 * 60 * 1000 })
    if (tokenCache.size > 2000) tokenCache.clear()
    return out
  } catch {
    return null
  }
}

const str = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '')
const fail = (res, status, code, error) => res.status(status).json({ code, error })

export default async function handler(req, res) {
  if (req.method !== 'POST') return fail(res, 405, 'method', 'POST only')
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'x').split(',')[0].trim()
  const auth = String(req.headers.authorization || '')
  const user = auth.startsWith('Bearer ') ? await userFromToken(auth.slice(7)) : null
  if (user ? limited('u:' + user.id, LIMIT_USER) : limited('ip:' + ip, LIMIT_GUEST)) return fail(res, 429, 'rate', 'Too many checks. Please wait a few minutes.')

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {}
  const text = typeof body.text === 'string' ? body.text.trim() : ''
  if (text.length > 5000) return fail(res, 400, 'tooLong', 'That is longer than 5,000 characters.')

  let file = null
  if (body.file) {
    const { mediaType, data } = body.file
    if (!FILE_TYPES.includes(mediaType) || typeof data !== 'string' || !/^[A-Za-z0-9+/=]+$/.test(data.slice(0, 200)))
      return fail(res, 400, 'fileType', 'That file type is not supported. Use a photo, screenshot or PDF.')
    if (data.length > MAX_B64) return fail(res, 400, 'fileSize', 'That file is too large. Keep it under 3 MB.')
    file = { mediaType, data }
  }
  if (!text && !file) return fail(res, 400, 'empty', 'Nothing to check.')

  const source = SOURCES.includes(body.source) ? body.source : 'text'
  const lang = LANGS.includes(body.lang) ? body.lang : 'en'
  const trusted = (Array.isArray(body.trusted) ? body.trusted : [])
    .slice(0, 50)
    .filter((t) => t && typeof t.domain === 'string' && typeof t.name === 'string')
    .map((t) => ({ name: t.name.slice(0, 80), domain: t.domain.slice(0, 120).toLowerCase() }))
  const own = body.own && typeof body.own === 'object' ? { domain: str(body.own.domain, 120).toLowerCase() || null, bank: str(body.own.bank, 40) || null } : null
  const business = body.own ? [str(body.own.business, 80), str(body.own.industry, 60), str(body.own.about, 240)].filter(Boolean).join('. ') : ''

  const apiKey = aiBudgetLeft() ? process.env.ANTHROPIC_API_KEY : null
  const model = process.env.ANTHROPIC_MODEL || undefined
  if (apiKey) aiCount += 1
  const ai = await aiExtract(text, { apiKey, model, file, business, lang })

  // For files, the rules run on the text the browser pulled from a PDF, or else on what Claude read.
  let checkText = text
  if (file) {
    checkText = text.trim().length > 40 ? text : [text, ai?.transcript].filter(Boolean).join('\n\n')
    if (!checkText.trim()) return apiKey ? fail(res, 422, 'noText', 'We could not read any text in that file.') : fail(res, 422, 'needsAi', 'Reading images needs AI reading.')
  }

  const state = collect(checkText, { trusted, own, source, lang })
  applyAi(state, ai)
  const result = buildResult(state)
  if (file) result.extractedText = checkText.slice(0, 3000)
  return res.status(200).json(result)
}

function safeParse(s) {
  try { return JSON.parse(s) } catch { return {} }
}
