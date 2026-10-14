import { analyseRules } from '../lib/engine.js'

const userError = (msg) => Object.assign(new Error(msg), { user: true })

// Calls the server (rules + AI). If the server is unreachable, falls back to the
// same rule-based engine in the browser so the demo never dead-ends.
//   input: { text, source: 'text'|'link'|'qr'|'file', file?: { mediaType, data } }
export async function analyse(input, { trusted = [], profile = null } = {}) {
  const { text = '', source = 'text', file = null } = input
  const own = profile ? { domain: profile.domain || null, business: profile.business, industry: profile.industry, about: profile.about } : null
  const slimTrusted = trusted.map((t) => ({ name: t.name, domain: t.domain }))
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), file ? 60000 : 25000)
  try {
    const r = await fetch('/api/analyse', {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text, source, file, trusted: slimTrusted, own }),
    })
    if ([400, 413, 422, 429].includes(r.status)) {
      const j = await r.json().catch(() => ({}))
      throw userError(j.error || (r.status === 413 ? 'That file is too large. Keep it under 3 MB.' : 'Could not check that.'))
    }
    if (!r.ok) throw new Error('server')
    return await r.json()
  } catch (e) {
    if (e.user) throw e
    // Offline / no server: rules only, in the browser.
    if (!text.trim()) throw userError('Reading screenshots and photos needs the online checker, which is not reachable right now. Paste the text instead.')
    const res = analyseRules(text, { trusted: slimTrusted, own, source })
    if (file) res.extractedText = text.slice(0, 3000)
    return { ...res, aiUsed: false }
  } finally {
    clearTimeout(timer)
  }
}
