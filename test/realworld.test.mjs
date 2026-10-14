import { analyseRules } from '../lib/engine.js'
import { SEED_RECORDS } from '../src/samples.js'
import { PACK } from './realworld.mjs'

let fails = 0
for (const c of PACK) {
  const r = analyseRules(c.text, { trusted: SEED_RECORDS })
  const ok = c.expect.includes(r.label)
  if (!ok) fails++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${c.id.padEnd(16)} ${r.label.padEnd(12)} score ${String(r.score).padStart(3)}  [${r.findings.filter((f) => f.level === 'risk').map((f) => f.id).join(', ')}]`)
}
console.log(fails ? `\n${fails} case(s) need attention` : '\nAll real-world cases behave as expected.')
process.exitCode = fails ? 1 : 0
