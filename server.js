// Local dev API + production static server (use this on Render/Railway; on Vercel the api/ folder is used instead).
import express from 'express'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import handler from './lib/handler.js'

const here = path.dirname(fileURLToPath(import.meta.url))

// Tiny .env loader so you don't need another package.
const envFile = path.join(here, '.env')
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

const app = express()
app.use(express.json({ limit: '6mb' }))
app.post('/api/analyse', handler)
app.get('/api/health', (_req, res) => res.json({ ok: true, ai: !!process.env.ANTHROPIC_API_KEY, accounts: !!(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL) }))

const dist = path.join(here, 'dist')
if (existsSync(dist)) {
  app.use(express.static(dist, { setHeaders: (res, p) => { if (p.endsWith('.mjs')) res.setHeader('Content-Type', 'text/javascript') } }))
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')))
}

const port = process.env.PORT || 8787
app.listen(port, () => console.log(`MoniGuard API on http://localhost:${port}  (AI layer: ${process.env.ANTHROPIC_API_KEY ? 'on' : 'off, rule-based only'})`))
