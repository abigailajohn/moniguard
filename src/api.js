import { analyseRules } from '../lib/engine.js'
import { accessToken } from './supabase.js'

// Errors carry an i18n key in .code so the screen can show them in the right language.
const userError = (code, msg) => Object.assign(new Error(msg || code), { user: true, code })

// Calls the server (rules + AI). If the server is unreachable, falls back to the
// same rule-based engine in the browser so the demo never dead-ends.
//   input: { text, source: 'text'|'link'|'qr'|'file', file?: { mediaType, data } }
export async function analyse(input, { trusted = [], profile = null, lang = 'en' } = {}) {
  const { text = '', source = 'text', file = null } = input
  const own = profile ? { domain: profile.domain || null, business: profile.business, industry: profile.industry, about: profile.about } : null
  const slimTrusted = trusted.map((t) => ({ name: t.name, domain: t.domain }))
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), file ? 60000 : 25000)
  try {
    const token = await accessToken().catch(() => null)
    const r = await fetch('/api/analyse', {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ text, source, file, trusted: slimTrusted, own, lang }),
    })
    if ([400, 413, 422, 429].includes(r.status)) {
      const j = await r.json().catch(() => ({}))
      throw userError('err.api.' + (j.code || (r.status === 413 ? 'fileSize' : r.status === 429 ? 'rate' : 'empty')), j.error)
    }
    if (!r.ok) throw new Error('server')
    return await r.json()
  } catch (e) {
    if (e.user) throw e
    // Offline / no server: rules only, in the browser.
    if (!text.trim()) throw userError('err.api.needsAi')
    const res = analyseRules(text, { trusted: slimTrusted, own, source, lang })
    if (file) res.extractedText = text.slice(0, 3000)
    return { ...res, aiUsed: false }
  } finally {
    clearTimeout(timer)
  }
}
