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
  { key: 'gov', name: 'Government of Mauritius', url: 'https://www.govmu.org', domains: ['govmu.org'], words: [/government of mauritius/i], tokens: [] },
]

const MULTI_PART = ['co.mu', 'com.mu', 'org.mu', 'gov.mu', 'ac.mu', 'govmu.org', 'co.uk', 'com.au']
const SHORTENERS = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'cutt.ly', 'rb.gy', 'shorturl.at', 'tiny.cc']
const RISKY_TLDS = ['xyz', 'top', 'click', 'work', 'support', 'site', 'icu', 'buzz', 'loan', 'online', 'cfd', 'live']
const FILE_EXT = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg', 'txt', 'zip', 'csv']

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
export function collect(rawText, { trusted = [], own = null, source = 'text' } = {}) {
  const text = String(rawText || '').slice(0, 5000)
  const lower = text.toLowerCase()
  const { emails, links } = extract(text)
  const state = { text, findings: [], score: 0, strong: 0, emails, links, trusted, claimed: null, mismatch: false, matched: null, flags: {} }
  const risk = (id, title, detail, pts) => { state.findings.push({ id, level: 'risk', title, detail }); state.score += pts }
  const ok = (id, title, detail, strong = false) => { state.findings.push({ id, level: 'ok', title, detail }); if (strong) state.strong += 1 }
  const info = (id, title, detail) => state.findings.push({ id, level: 'info', title, detail })

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
        risk('imp-' + d.reg, `${d.reg} imitates ${o.name} but is not their address`, `${o.name} only uses ${o.domains.join(', ')}. Addresses that add words to a real name are a common scam trick.`, impersonated === 0 ? 35 : 10)
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
      if (d.reg === ownReg) { info('own-' + d.reg, 'Uses your own business domain', `@${ownReg} is your domain. Sender addresses can be faked, so still confirm unusual payment requests in person.`); continue }
      if (!orgOfDomain(d.reg) && looksSimilar(d.reg, ownReg)) {
        ownLookalike.add(d.reg)
        risk('ownfake-' + d.reg, 'Address imitates your own business domain', `${d.reg} looks like your domain ${ownReg} but is different. Scammers copy a company's own address to request payments from staff.`, 35)
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
      ok('trusted-' + d.reg, `Sender domain matches your saved record for ${exact.name}`, `${d.addr} uses @${d.reg}, the domain you saved.`, true)
      continue
    }
    const near = trusted.find((t) => looksSimilar(d.reg, regDomain(t.domain)))
    if (near) {
      state.mismatch = true
      risk('mismatch-' + d.reg, `Domain looks like your saved supplier ${near.name}, but doesn't match`, `Message: ${d.addr}. Saved record: @${regDomain(near.domain)}. A domain mismatch is a warning, not proof of fraud.`, 35)
    }
  }

  // 3. Official domains
  for (const d of uniqueDomains) {
    const o = orgOfDomain(d.reg)
    if (o) {
      state.claimed = state.claimed || o
      ok('official-' + d.reg, `${d.from === 'link' ? 'Link goes' : 'Address belongs'} to ${o.name}'s official domain`, `${d.reg} is listed as an official ${o.name} domain.`, true)
    }
  }

  // 4. Claims an organisation but no address of theirs is present
  const named = detectOrgs(text)
  if (named.length) state.claimed = state.claimed || named[0]
  if (named.length && uniqueDomains.length && !impersonated) {
    const claimsOrg = named.find((o) => !uniqueDomains.some((d) => o.domains.includes(d.reg)))
    if (claimsOrg && !uniqueDomains.some((d) => orgOfDomain(d.reg))) {
      risk('claim-' + claimsOrg.key, `Mentions ${claimsOrg.name}, but no address from them`, `The links or addresses in the message do not belong to ${claimsOrg.name}.`, 15)
    }
  }

  // 5. Money and credential requests
  const changedBank = /(new|changed?|updated?|different|revised|alternative)\s+(bank|banking|account)|bank (details|account)s?\s+(have\s+)?(changed|updated)|change of (bank|account)/i.test(text)
  if (changedBank) { risk('bank', 'Asks you to pay into new or changed bank details', 'Fraudsters often alter bank details on real-looking invoices. Always confirm a change by phone, using a number you already have.', 25); state.flags.bank = true }
  if (/(password|passcode|\botp\b|one[- ]time (code|password)|\bpin\b|card number|\bcvv\b|login details|log ?in to|verify your (details|account|identity|information)|confirm your (details|account|identity)|(bank|banking|account|business) details)/i.test(text) && !changedBank) {
    risk('creds', 'Asks for sensitive or banking information', 'Real organisations do not ask for passwords, codes or bank details by message.', 25); state.flags.creds = true
  } else if (/(password|passcode|\botp\b|one[- ]time (code|password)|\bcvv\b|verify your (details|account|identity|information)|confirm your (details|account|identity)|submit your .*details)/i.test(text) && changedBank) {
    risk('creds', 'Also asks for sensitive information', 'Real organisations do not ask for passwords, codes or full details by message.', 15); state.flags.creds = true
  }

  // 6. Pressure tactics
  if (/(within \d+ (hours?|days?|minutes?)|immediately|urgent(ly)?|today only|before (friday|monday|tuesday|wednesday|thursday|saturday|sunday|midnight)|final notice|act now|will be (suspended|closed|blocked)|account (suspended|closure|closed)|last chance|expires?\b|failure to)/i.test(text)) {
    risk('urgency', 'Uses urgent or threatening language to rush you', 'Scammers create time pressure so you act before you check.', 10); state.flags.urgency = true
  }

  // 7. Unsolicited offers
  if (/(grant|pre-?selected|prize|you have won|guaranteed returns?|double your|risk[- ]free|investment opportunity|exclusive offer|allocation|lottery)/i.test(text)) {
    risk('offer', 'Offers money or an opportunity you did not ask for', 'Unexpected grants, prizes and guaranteed returns are common bait.', 20); state.flags.offer = true
  }

  // 8. Link hygiene
  for (const l of links) {
    if (l.ip) risk('ip-' + l.host, 'Link uses a raw IP address', `${l.host} is not a normal website name.`, 20)
    else if (SHORTENERS.includes(l.reg)) risk('short-' + l.reg, 'Link is shortened, so the real site is hidden', `${l.reg} hides the destination. Open the real address yourself instead.`, 15)
    else {
      if (RISKY_TLDS.includes(tldOf(l.reg))) risk('tld-' + l.reg, `Link ends in .${tldOf(l.reg)}, often used in scams`, `${l.reg} uses an address ending that is cheap and frequently abused.`, 10)
      if (l.hasProto && !l.secure) risk('http-' + l.reg, 'Link is not secure (http, not https)', `${l.reg} does not use an encrypted connection.`, 10)
    }
  }

  // 8b. Where the content came from
  if (source === 'qr') info('qr', 'This came from a QR code', 'Fake QR stickers placed over real ones are a known trick. Only scan codes from a source you trust.')

  // 9. Weak positive and gaps
  if (!state.flags.urgency && !state.flags.creds && !state.flags.bank && !state.flags.offer && text.trim().length > 20)
    ok('clean', 'No urgent wording or requests for sensitive details found', 'This is a weak signal on its own.')
  if (!uniqueDomains.length) info('noaddr', 'No sender address or link found to check', 'Paste the full message including the sender address or link for a stronger check.')

  state.kind = source === 'qr' ? 'qr' : /invoice/i.test(text) ? 'invoice' : state.flags.offer ? 'offer' : links.length && text.trim().split(/\s+/).length <= 3 ? 'link' : 'message'
  const amt = text.match(/\bRs\.?\s?\d[\d,]*(?:\.\d+)?/i)
  state.amount = amt ? amt[0].replace(/^rs\.?\s?/i, 'Rs ') : null
  const primary = emails[0] || links[0]
  state.sender = primary ? { address: emails[0]?.addr || null, domain: primary.reg } : null
  return state
}

// ---- Optional AI evidence (see ai.js) --------------------------------------
export function applyAi(state, ai) {
  if (!ai) return state
  const risk = (id, title, detail, pts) => { state.findings.push({ id, level: 'risk', title, detail }); state.score += pts }
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
  ;(ai.socialEngineering || []).slice(0, 2).forEach((s, i) => risk('ai-se-' + i, cap(s), 'Pressure tactic spotted by the AI reading. Scammers rush people so they act before checking.', 6))
  ;(ai.inconsistencies || []).slice(0, 2).forEach((s, i) => risk('ai-inc-' + i, cap(s), 'A detail that does not add up, spotted by the AI reading.', 8))
  if (ai.paymentOrCredentialRequest && !state.flags.bank && !state.flags.creds) risk('ai-ask', 'Asks for money or sensitive details', 'The AI reading of the message found a request for payment or personal information.', 10)
  if (ai.riskHint === 'high') state.score += 10
  if (ai.claimedOrganisation && !state.claimed) state.aiClaimed = ai.claimedOrganisation
  state.summary = ai.plainSummary || null
  state.aiUsed = true
  return state
}

// ---- Decide ----------------------------------------------------------------
const STEPS = {
  high: ['Do not click links, reply or pay.', 'Check with the organisation using a website or number you already trust.', 'Report it so other businesses are warned.'],
  suspicious: ['Pause before you pay or share anything.', 'Confirm with the sender through a channel you already trust.', 'Report it if it claims to be from an official body.'],
  safe: ['Safe to continue with your usual approval steps.', 'Save the supplier so future invoices are compared with these details.', 'A match is not a guarantee. Stay alert to changes.'],
  inconclusive: ['There is not enough here to judge.', 'Confirm with the sender through a channel you trust.', 'Check again with the full message and sender address.'],
}

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
  const subtitle = {
    high: state.flags.ownFake ? 'Someone appears to be imitating your business.' : state.mismatch ? 'Supplied records show mismatched details.' : 'Several signs match known scam patterns.',
    suspicious: 'Some warning signs. Confirm before you act.',
    safe: state.matched ? 'Key details match your saved records.' : 'The address matches an official source.',
    inconclusive: 'Not enough evidence either way.',
  }[label]

  const steps = [...STEPS[label]]
  if (label !== 'safe' && state.flags.bank) steps.splice(1, 0, 'Never change bank details because of a message. Phone the supplier on a number you already have.')

  const unverified = []
  if (!strong) unverified.push('Whether the sender is who they say they are')
  unverified.push('Live checks against registries and blocklists are not part of this version')

  return {
    label, score, confidence: { value: conf, level }, subtitle, summary: state.summary || null,
    findings, unverified, nextSteps: steps.slice(0, 4),
    claimedOrg: state.claimed ? { name: state.claimed.name, url: state.claimed.url } : null,
    sender: state.sender, amount: state.amount, kind: state.kind, aiUsed: !!state.aiUsed,
  }
}

export const analyseRules = (text, opts) => buildResult(collect(text, opts))
