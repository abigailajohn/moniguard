import assert from 'node:assert/strict'
import { analyseRules } from '../lib/engine.js'
import { SAMPLES, SEED_RECORDS } from '../src/samples.js'

const trusted = SEED_RECORDS
const cases = [
  ['invoice', 'high'],
  ['grant', 'high'],
  ['sms', 'high'],
  ['real', 'safe'],
  ['new', 'inconclusive'],
]
for (const [id, expected] of cases) {
  const s = SAMPLES.find((x) => x.id === id)
  const r = analyseRules(s.text, { trusted })
  console.log(id.padEnd(8), '->', r.label.padEnd(12), 'score', String(r.score).padStart(3), '| findings:', r.findings.map((f) => f.level[0]).join(''))
  assert.equal(r.label, expected, `${id}: expected ${expected}, got ${r.label}`)
}

const neutral = analyseRules('Hi, are we still on for Tuesday at 10?', { trusted })
console.log('neutral  ->', neutral.label)
assert.equal(neutral.label, 'inconclusive')

const official = analyseRules('Please see our rates at https://www.mcb.mu/en/personal', { trusted })
console.log('official ->', official.label)
assert.equal(official.label, 'safe')

const mismatch = analyseRules('From: accounts@portlouis-traders.net\nPlease pay Rs 10,000.', { trusted })
assert.ok(mismatch.findings.some((f) => f.id.startsWith('mismatch-')), 'lookalike supplier domain should be flagged')

const changedBank = analyseRules('From: accounts@pltraders.mu\nOur bank details have changed, please pay into the new account.', { trusted })
console.log('legit sender + changed bank ->', changedBank.label)
assert.equal(changedBank.label, 'suspicious')

const ownFake = analyseRules('From: accounts@pltltd-mu.com\nPlease pay Rs 20,000 into this account.', { trusted, own: { domain: 'pltltd.mu' } })
console.log('own-domain lookalike ->', ownFake.label)
assert.ok(ownFake.findings.some((f) => f.id.startsWith('ownfake-')), 'lookalike of own domain should be flagged')
assert.notEqual(ownFake.label, 'safe')

const fromOwn = analyseRules('From: aisha@pltltd.mu\nLunch at 1?', { trusted, own: { domain: 'pltltd.mu' } })
assert.notEqual(fromOwn.label, 'safe', 'own domain alone must never mean safe (it can be spoofed)')

const qr = analyseRules('http://mcb-payments.top/parking?zone=PL-04', { trusted, source: 'qr' })
console.log('qr sticker ->', qr.label, qr.kind)
assert.equal(qr.kind, 'qr')
assert.equal(qr.label, 'high')

console.log('\nAll engine checks passed.')
