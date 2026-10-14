// MoniGuard rule-based verification engine.
// Pure JavaScript with no dependencies, so it runs on the server AND in the
// browser (offline fallback). The AI layer (ai.js) can only ADD evidence on top
// of this; it can never turn a result into "safe".

// ---- Official sources ------------------------------------------------------
// TODO(you): verify every domain here against the organisation's own website
// before the demo, and add more (your banks, MRA, etc). Wrong entries here
// would make a fake address look official.
export const ORGS = [
  { key: 'mcb', name: 'Mauritius Commercial Bank', url: 'https://www.mcb.mu', domains: ['mcb.mu'], words: [/\bmcb\b/i, /mauritius commercial bank/i], tokens: ['mcb'] },
  { key: 'sbm', name: 'SBM Bank', url: 'https://www.sbmgroup.mu', domains: ['sbmgroup.mu'], words: [/\bsbm\b/i], tokens: ['sbm'] },
  { key: 'bom', name: 'Bank of Mauritius', url: 'https://www.bom.mu', domains: ['bom.mu'], words: [/bank of mauritius/i], tokens: ['bom'] },
  { key: 'mcci', name: 'MCCI', url: 'https://www.mcci.org', domains: ['mcci.org'], words: [/\bmcci\b/i, /chamber of commerce and industry/i], tokens: ['mcci'] },
  { key: 'mra', name: 'Mauritius Revenue Authority', url: 'https://www.mra.mu', domains: ['mra.mu'], words: [/\bmra\b/i, /revenue authority/i], tokens: ['mra'] },
  { key: 'certmu', name: 'CERT-MU', url: 'https://cert-mu.govmu.org', domains: ['cert-mu.govmu.org'], words: [/cert-mu/i], tokens: ['certmu'] },
  { key: 'fsc', name: 'Financial Services Commission', url: 'https://www.fscmauritius.org', domains: ['fscmauritius.org'], words: [/\bfsc\b/i], tokens: ['fsc'] },
  { key: 'post', name: 'Mauritius Post', url: 'https://www.mauritiuspost.mu', domains: ['mauritiuspost.mu'], words: [/mauritius post/i], tokens: ['mauritiuspost', 'maupost'] },
  { key: 'maubank', name: 'MauBank', url: 'https://www.maubank.mu', domains: ['maubank.mu'], words: [/\bmaubank\b/i], tokens: ['maubank'] },
  { key: 'afrasia', name: 'AfrAsia Bank', url: 'https://www.afrasiabank.com', domains: ['afrasiabank.com'], words: [/afrasia/i], tokens: ['afrasia'] },
  { key: 'bankone', name: 'Bank One', url: 'https://bankone.mu', domains: ['bankone.mu'], words: [/\bbank one\b/i], tokens: ['bankone'] },
  { key: 'gov', name: 'Government of Mauritius', url: 'https://www.govmu.org', domains: ['govmu.org'], words: [/government of mauritius/i], tokens: [] },
]

import { msgs } from './messages.js'

const MULTI_PART = ['co.mu', 'com.mu', 'org.mu', 'gov.mu', 'ac.mu', 'govmu.org', 'co.uk', 'com.au']
const SHORTENERS = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'cutt.ly', 'rb.gy', 'shorturl.at', 'tiny.cc']
const RISKY_TLDS = ['xyz', 'top', 'click', 'work', 'support', 'site', 'icu', 'buzz', 'loan', 'online', 'cfd', 'live']
const FILE_EXT = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg', 'txt', 'zip', 'csv']

// ---- Scam wording (English, French, Kreol Morisien) ------------------------
const BANK_RE = new RegExp([
  String.raw`(new|changed?|updated?|different|revised|alternative)\s+(bank|banking|account)`,
  String.raw`bank (details|account)s?\s+(have\s+)?(changed|updated)`, String.raw`change of (bank|account)`,
  String.raw`(nouveaux?|nouvelles?)\s+(compte|coordonn[ée]es bancaires|rib|iban)`, String.raw`coordonn[ée]es bancaires\s+(ont\s+)?(chang[ée]|[ée]t[ée] modifi[ée]es|modifi[ée]es)`,
  String.raw`changement de (compte|coordonn[ée]es bancaires|rib|banque)`, String.raw`(nouvo|lot)\s+kont`, String.raw`sanz(e|man)?\s+(nou\s+|so\s+)?kont`,
].join('|'), 'i')
const CREDS_RE = new RegExp([
  String.raw`password|passcode|\botp\b|one[- ]time (code|password)|\bpin\b|card number|\bcvv\b|login details|log ?in to`,
  String.raw`verify your (details|account|identity|information)|confirm your (details|account|identity)|(send|submit|provide|confirm|update|enter|share)\b[^.\n]{0,30}\b(bank|banking|account|business|card) details`,
  String.raw`mot de passe|code (secret|pin|otp|de v[ée]rification)|num[ée]ro de (carte|compte)|identifiants`, String.raw`(v[ée]rifie[rz]?|confirme[rz]?|mettre à jour|mettez à jour) vos (informations|donn[ée]es|coordonn[ée]es|identifiants)`,
  String.raw`(envoye[rz]|fournisse[rz]|fournir|confirme[rz]|communique[rz]|transmet(tez|tre)|saisi(sse)?[rz]?)\b[^.\n]{0,30}coordonn[ée]es bancaires`, String.raw`modpas|\bkod\b|verifie (ou|to) (detay|kont|linformasion)|detay (ou|to) kont`,
].join('|'), 'i')
const CREDS_STRONG_RE = /password|passcode|\botp\b|one[- ]time (code|password)|\bcvv\b|verify your (details|account|identity|information)|confirm your (details|account|identity)|submit your .*details|mot de passe|code (secret|pin|otp)|identifiants|modpas/i
const URGENT_RE = new RegExp([
  String.raw`within (\d+ ?(hours?|minutes?|h\b)|[1-3] days?)|immediately|urgent(ly)?|today only|before (friday|monday|tuesday|wednesday|thursday|saturday|sunday|midnight)|final notice|act now`,
  String.raw`will be (suspended|closed|blocked)|account (suspended|closure|closed)|last chance|expires?\b|failure to`,
  String.raw`imm[ée]diatement|urgent(e)?|sous \d+ ?(h|heures?|jours?)|dans les \d+ ?(h|heures?)|dernier (avertissement|rappel)|sera (suspendu|ferm[ée]|bloqu[ée])`,
  String.raw`compte (suspendu|bloqu[ée]|ferm[ée])|avant (vendredi|lundi|mardi|mercredi|jeudi|samedi|dimanche|minuit)|aujourd'hui m[êe]me|d[èe]s aujourd'hui|derni[èe]re chance|faute de`,
  String.raw`zordi mem|tousuit|dan \d+ ?(er|ler|zour)|pou (bloke|ferme|aret)|avan (vandredi|lindi|mardi|merkredi|zedi|samdi|dimans)|si ou pa (pey|reponn|verifie)`,
].join('|'), 'i')
const OFFER_RE = new RegExp([
  String.raw`grant|pre-?selected|prize|you have won|guaranteed returns?|double your|risk[- ]free|investment opportunity|exclusive offer|allocation|lottery`,
  String.raw`subvention|pr[ée]s[ée]lectionn[ée]|vous avez gagn[ée]|gagnant|rendement garanti|loterie|offre exclusive|sans risque`,
  String.raw`sibvansion|ou finn gagn|lotri|profi garanti|doub ou larzan`,
  String.raw`selected to (receive|benefit)|financial (support|assistance) programme|claim your (prize|reward|funds|refund)|s[ée]lectionn[ée] pour (recevoir|b[ée]n[ée]ficier)|aide financi[èe]re`,
].join('|'), 'i')

const FEE_RE = /(pay|settle|send)\b[^.\n]{0,40}\b(fee|charge)\b[^.\n]{0,60}\b(receive|release|claim|refund|funds|parcel|delivery|interview|prize|reward|allocation)|(processing|administrative|admin|clearance|release|registration|delivery) fee|frais (administratifs|de dossier|de livraison|de d[ée]douanement)|pey (enn )?fre/i
const CONTACT_RE = /(changed|new) (my )?(phone )?number|(don't|do not|cannot|can't) call|nouveau num[ée]ro|ne m'appelle pas|nouvo nimero|pa apel mwa/i
const MONEY_ASK_RE = /(send|transfer|pay|lend|envoy|vir|transf[ée]r|pey|avoy)\w*\b[^.\n]{0,40}(rs\.?\s?\d|mur\s?\d|\d[\d,\s]*\s?(rs|roupies|rupees))/i

// ---- Helpers ---------------------------------------------------------------
export function regDomain(host) {
  const h = String(host).toLowerCase().replace(/^www\./, '').replace(/\.$/, '')
  const parts = h.split('.')
  if (parts.length <= 2) return h
  const last2 = parts.slice(-2).join('.')
  return MULTI_PART.includes(last2) ? parts.slice(-3).join('.') : last2
}

const tldOf = (reg) => reg.split('.').pop()
const labelOf = (reg) => {
  const p = reg.split('.')
  return (MULTI_PART.includes(p.slice(-2).join('.')) ? p.slice(0, -2) : p.slice(0, -1)).join('.') || p[0]
}

function lcs(a, b) {
  let best = 0
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0))
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
        if (dp[i][j] > best) best = dp[i][j]
      }
  return best
}

function lev(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return dp[a.length][b.length]
}

function looksSimilar(regA, regB) {
  const a = labelOf(regA).replace(/[^a-z0-9]/g, '')
  const b = labelOf(regB).replace(/[^a-z0-9]/g, '')
  if (!a || !b) return false
  if (lcs(a, b) >= 5) return true
  return 1 - lev(a, b) / Math.max(a.length, b.length) >= 0.75
}

export function extract(text) {
  const emails = []
  const links = []
  const seenE = new Set()
  const seenL = new Set()
  for (const m of text.matchAll(/[a-z0-9._%+-]+@([a-z0-9-]+(?:\.[a-z0-9-]+)+)/gi)) {
    const host = m[1].toLowerCase()
    if (seenE.has(m[0].toLowerCase())) continue
    seenE.add(m[0].toLowerCase())
    emails.push({ addr: m[0], host, reg: regDomain(host) })
  }
  const urlRe = /\b(?:https?:\/\/)?(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,24}(?::\d+)?(?:\/[^\s<>"')]*)?/gi
  for (const m of text.matchAll(urlRe)) {
    if (m.index > 0 && text[m.index - 1] === '@') continue
    const raw = m[0].replace(/[.,;:!?]+$/, '')
    const noProto = raw.replace(/^https?:\/\//i, '')
    const host = noProto.split(/[/:?#]/)[0].toLowerCase()
    const tld = host.split('.').pop()
    if (FILE_EXT.includes(tld)) continue
    if (seenL.has(host)) continue
    seenL.add(host)
    links.push({ raw, host, reg: regDomain(host), secure: !/^http:\/\//i.test(raw), hasProto: /^https?:\/\//i.test(raw) })
  }
  // Bare IPs used as links
  for (const m of text.matchAll(/\bhttps?:\/\/(\d{1,3}(?:\.\d{1,3}){3})\b/gi)) {
    if (!seenL.has(m[1])) { seenL.add(m[1]); links.push({ raw: m[0], host: m[1], reg: m[1], secure: !/^http:\/\//i.test(m[0]), ip: true, hasProto: true }) }
  }
  return { emails, links }
}

const orgOfDomain = (reg) => ORGS.find((o) => o.domains.includes(reg))
const detectOrgs = (text) => ORGS.filter((o) => o.words.some((w) => w.test(text)))

// ---- Collect evidence ------------------------------------------------------
export function collect(rawText, { trusted = [], own = null, source = 'text', lang = 'en' } = {}) {
  const M = msgs(lang)
  const text = String(rawText || '').slice(0, 5000)
  const lower = text.toLowerCase()
  const { emails, links } = extract(text)
  const state = { text, lang, findings: [], score: 0, strong: 0, emails, links, trusted, claimed: null, mismatch: false, matched: null, flags: {} }
  const risk = (id, [title, detail], pts) => { state.findings.push({ id, level: 'risk', title, detail }); state.score += pts }
  const ok = (id, [title, detail], strong = false) => { state.findings.push({ id, level: 'ok', title, detail }); if (strong) state.strong += 1 }
  const info = (id, [title, detail]) => state.findings.push({ id, level: 'info', title, detail })

  const domains = [...emails.map((e) => ({ ...e, from: 'email' })), ...links.map((l) => ({ ...l, from: 'link' }))]
  const seenReg = new Set()
  const uniqueDomains = domains.filter((d) => (seenReg.has(d.reg) ? false : seenReg.add(d.reg)))

  // 1. Brand impersonation: org name inside a domain that is not that org's own
  let impersonated = 0
  for (const d of uniqueDomains) {
    if (orgOfDomain(d.reg)) continue
    const lab = labelOf(d.reg).replace(/[^a-z0-9]/g, '')
    for (const o of ORGS) {
      if (o.tokens.some((t) => t && lab.includes(t))) {
        risk('imp-' + d.reg, M.imp({ reg: d.reg, org: o.name, domains: o.domains.join(', ') }), impersonated === 0 ? 35 : 10)
        impersonated += 1
        state.flags.impersonation = true
        state.claimed = state.claimed || o
        break
      }
    }
  }

  // 2a. Someone imitating the user's OWN business domain (common in payment-diversion fraud)
  const ownReg = own?.domain ? regDomain(own.domain) : null
  const ownLookalike = new Set()
  if (ownReg) {
    for (const d of uniqueDomains) {
      if (d.reg === ownReg) { info('own-' + d.reg, M.own({ own: ownReg })); continue }
      if (!orgOfDomain(d.reg) && looksSimilar(d.reg, ownReg)) {
        ownLookalike.add(d.reg)
        risk('ownfake-' + d.reg, M.ownfake({ reg: d.reg, own: ownReg }), 35)
        state.flags.ownFake = true
      }
    }
  }

  // 2b. Compare with the business's own trusted records
  for (const d of uniqueDomains) {
    if (d.from !== 'email' || ownLookalike.has(d.reg)) continue
    const exact = trusted.find((t) => regDomain(t.domain) === d.reg)
    if (exact) {
      state.matched = exact
      ok('trusted-' + d.reg, M.trusted({ name: exact.name, addr: d.addr, reg: d.reg }), true)
      continue
    }
    const near = trusted.find((t) => looksSimilar(d.reg, regDomain(t.domain)))
    if (near) {
      state.mismatch = true
      risk('mismatch-' + d.reg, M.mismatch({ name: near.name, addr: d.addr, saved: regDomain(near.domain) }), 35)
    }
  }

  // 3. Official domains
  for (const d of uniqueDomains) {
    const o = orgOfDomain(d.reg)
    if (o) {
      state.claimed = state.claimed || o
      // A link to the official site is strong. A sender address alone is not: it can be forged.
      if (d.from === 'link') ok('official-' + d.reg, M.officialLink({ org: o.name, reg: d.reg }), true)
      else info('official-' + d.reg, M.officialAddr({ org: o.name, reg: d.reg }))
    }
  }

  // 4. Claims an organisation but no address of theirs is present
  const named = detectOrgs(text)
  if (named.length) state.claimed = state.claimed || named[0]
  if (named.length && uniqueDomains.length && !impersonated && !state.matched) {
    const claimsOrg = named.find((o) => !uniqueDomains.some((d) => o.domains.includes(d.reg)))
    if (claimsOrg && !uniqueDomains.some((d) => orgOfDomain(d.reg))) {
      risk('claim-' + claimsOrg.key, M.claim({ org: claimsOrg.name }), 15)
    }
  }

  // 5. Money and credential requests (English, French, Kreol Morisien)
  const changedBank = BANK_RE.test(text)
  if (changedBank) { risk('bank', M.bank(), 25); state.flags.bank = true }
  if (!changedBank && CREDS_RE.test(text)) { risk('creds', M.creds(), 25); state.flags.creds = true }
  else if (changedBank && CREDS_STRONG_RE.test(text)) { risk('creds', M.creds2(), 15); state.flags.creds = true }

  // 6. Pressure tactics
  if (URGENT_RE.test(text)) { risk('urgency', M.urgency(), 10); state.flags.urgency = true }

  // 7. Unsolicited offers
  if (OFFER_RE.test(text)) { risk('offer', M.offer(), 20); state.flags.offer = true }
  if (FEE_RE.test(text)) { risk('fee', M.fee(), 20); state.flags.fee = true }
  if (CONTACT_RE.test(text) && MONEY_ASK_RE.test(text)) { risk('contact', M.contact(), 25); state.flags.contact = true }

  // 8. Link hygiene
  for (const l of links) {
    if (l.ip) risk('ip-' + l.host, M.ip({ host: l.host }), 20)
    else if (SHORTENERS.includes(l.reg)) risk('short-' + l.reg, M.short({ reg: l.reg }), 15)
    else {
      if (RISKY_TLDS.includes(tldOf(l.reg))) risk('tld-' + l.reg, M.tld({ tld: tldOf(l.reg), reg: l.reg }), 10)
      if (l.hasProto && !l.secure) risk('http-' + l.reg, M.http({ reg: l.reg }), 10)
    }
  }

  // 8b. Where the content came from
  if (source === 'qr') info('qr', M.qr())

  // 9. Weak positive and gaps
  if (!state.flags.urgency && !state.flags.creds && !state.flags.bank && !state.flags.offer && !state.flags.fee && !state.flags.contact && text.trim().length > 20)
    ok('clean', M.clean())
  if (!uniqueDomains.length) info('noaddr', M.noaddr())

  state.kind = source === 'qr' ? 'qr' : /invoice|facture|\bfakir\b/i.test(text) ? 'invoice' : state.flags.offer ? 'offer' : links.length && text.trim().split(/\s+/).length <= 3 ? 'link' : 'message'
  const amt = text.match(/\b(?:Rs|MUR)\.?\s?\d[\d,\s]*\d(?:\.\d+)?|\b(?:Rs|MUR)\.?\s?\d/i)
  state.amount = amt ? amt[0].replace(/^(rs|mur)\.?\s?/i, 'Rs ').trim() : null
  const primary = emails[0] || links[0]
  state.sender = primary ? { address: emails[0]?.addr || null, domain: primary.reg } : null
  return state
}

// ---- Optional AI evidence (see ai.js) --------------------------------------
export function applyAi(state, ai) {
  if (!ai) return state
  const M = msgs(state.lang)
  const risk = (id, title, detail, pts) => { state.findings.push({ id, level: 'risk', title, detail }); state.score += pts }
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
  ;(ai.socialEngineering || []).slice(0, 2).forEach((s, i) => risk('ai-se-' + i, cap(s), M.aiSe(), 6))
  ;(ai.inconsistencies || []).slice(0, 2).forEach((s, i) => risk('ai-inc-' + i, cap(s), M.aiInc(), 8))
  if (ai.paymentOrCredentialRequest && !state.flags.bank && !state.flags.creds) { const [a, b] = M.aiAsk(); risk('ai-ask', a, b, 10) }
  if (ai.riskHint === 'high') state.score += 10
  if (ai.claimedOrganisation && !state.claimed) state.aiClaimed = ai.claimedOrganisation
  state.summary = ai.plainSummary || null
  state.aiUsed = true
  return state
}

// ---- Decide ----------------------------------------------------------------
export function buildResult(state) {
  const { score, strong } = state
  let label
  if (score >= 55) label = 'high'
  else if (score >= 20) label = 'suspicious'
  else if (strong > 0) label = 'safe'
  else label = 'inconclusive'

  let conf
  if (label === 'high') conf = Math.min(95, 60 + Math.round(score / 3))
  else if (label === 'suspicious') conf = 55 + Math.round(score / 5)
  else if (label === 'safe') conf = Math.min(92, 70 + strong * 10)
  else conf = 40
  const level = conf >= 75 ? 'High' : conf >= 55 ? 'Medium' : 'Low'

  const order = { risk: 0, ok: 1, info: 2 }
  const findings = [...state.findings].sort((a, b) => order[a.level] - order[b.level])
  const M = msgs(state.lang)
  const subtitle = {
    high: state.flags.ownFake ? M.sub.highOwn : state.mismatch ? M.sub.highMismatch : M.sub.high,
    suspicious: M.sub.suspicious,
    safe: state.matched ? M.sub.safeMatched : M.sub.safe,
    inconclusive: M.sub.inconclusive,
  }[label]

  const steps = [...M.steps[label]]
  if (label !== 'safe' && state.flags.bank) steps.splice(1, 0, M.bankStep)

  const unverified = []
  if (!strong) unverified.push(M.unvSender)
  unverified.push(M.unvLive)

  return {
    label, score, confidence: { value: conf, level }, subtitle, summary: state.summary || null,
    findings, unverified, nextSteps: steps.slice(0, 4),
    claimedOrg: state.claimed ? { name: state.claimed.name, url: state.claimed.url } : null,
    sender: state.sender, amount: state.amount, kind: state.kind, aiUsed: !!state.aiUsed, lang: state.lang,
  }
}

export const analyseRules = (text, opts) => buildResult(collect(text, opts))
