// One handler, used by both Vercel (api/analyse.js) and the local/Render server (server.js).
import { collect, applyAi, buildResult } from './engine.js'
import { aiExtract } from './ai.js'

const FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
const MAX_B64 = 4_200_000 // about 3 MB of file
const SOURCES = ['text', 'link', 'qr', 'file']

const hits = new Map()
function limited(ip) {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > 40
}

const str = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '')

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'x').split(',')[0].trim()
  if (limited(ip)) return res.status(429).json({ error: 'Too many checks. Please wait a few minutes.' })

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {}
  const text = typeof body.text === 'string' ? body.text.trim() : ''
  if (text.length > 5000) return res.status(400).json({ error: 'That is longer than 5,000 characters.' })

  let file = null
  if (body.file) {
    const { mediaType, data } = body.file
    if (!FILE_TYPES.includes(mediaType) || typeof data !== 'string' || !/^[A-Za-z0-9+/=]+$/.test(data.slice(0, 200)))
      return res.status(400).json({ error: 'That file type is not supported. Use a photo, screenshot or PDF.' })
    if (data.length > MAX_B64) return res.status(400).json({ error: 'That file is too large. Keep it under 3 MB.' })
    file = { mediaType, data }
  }
  if (!text && !file) return res.status(400).json({ error: 'Nothing to check.' })

  const source = SOURCES.includes(body.source) ? body.source : 'text'
  const trusted = (Array.isArray(body.trusted) ? body.trusted : [])
    .slice(0, 50)
    .filter((t) => t && typeof t.domain === 'string' && typeof t.name === 'string')
    .map((t) => ({ name: t.name.slice(0, 80), domain: t.domain.slice(0, 120).toLowerCase() }))
  const own = body.own && typeof body.own === 'object' ? { domain: str(body.own.domain, 120).toLowerCase() || null } : null
  const business = body.own ? [str(body.own.business, 80), str(body.own.industry, 60), str(body.own.about, 240)].filter(Boolean).join('. ') : ''

  const apiKey = process.env.ANTHROPIC_API_KEY
  const model = process.env.ANTHROPIC_MODEL || undefined
  const ai = await aiExtract(text, { apiKey, model, file, business })

  // For files, the rules run on the text Claude read from the file (plus any text the browser extracted).
  let checkText = text
  if (file) {
    // Prefer the exact text the browser pulled from a PDF; otherwise use what Claude read.
    checkText = text.trim().length > 40 ? text : [text, ai?.transcript].filter(Boolean).join('\n\n')
    if (!checkText.trim())
      return res.status(422).json({ error: apiKey ? 'We could not read any text in that file. Try a clearer screenshot, or paste the text instead.' : 'Reading screenshots and photos needs the AI layer, which is not switched on. Paste the text instead.' })
  }

  const state = collect(checkText, { trusted, own, source })
  applyAi(state, ai)
  const result = buildResult(state)
  if (file) result.extractedText = checkText.slice(0, 3000)
  return res.status(200).json(result)
}

function safeParse(s) {
  try { return JSON.parse(s) } catch { return {} }
}
