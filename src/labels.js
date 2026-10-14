// The ONE place the result wording lives. Change the words here and the whole app follows.
const BASE = { high: { tone: 'red', icon: 'shx' }, suspicious: { tone: 'amber', icon: 'shx' }, safe: { tone: 'green', icon: 'shok' }, inconclusive: { tone: 'grey', icon: 'shq' } }
const WORDS = {
  en: {
    high: ['High risk — do not proceed', 'High Risk'], suspicious: ['Suspicious — check before you act', 'Suspicious'],
    safe: ['Looks safe — details match', 'Looks Safe'], inconclusive: ['Inconclusive — not enough to tell', 'Inconclusive'],
  },
  fr: {
    high: ['Risque élevé — ne continuez pas', 'Risque élevé'], suspicious: ['Suspect — vérifiez avant d’agir', 'Suspect'],
    safe: ['Semble sûr — les détails correspondent', 'Semble sûr'], inconclusive: ['Incertain — pas assez d’éléments', 'Incertain'],
  },
  mcr: {
    high: ['Gran risk — pa kontinye', 'Gran risk'], suspicious: ['Sispe — verifie avan ou azir', 'Sispe'],
    safe: ['Paret sir — detay koresponn', 'Paret sir'], inconclusive: ['Pa kler — pa ase pou dir', 'Pa kler'],
  },
}
export function labels(lang = 'en') {
  const w = WORDS[lang] || WORDS.en
  return Object.fromEntries(Object.entries(BASE).map(([k, v]) => [k, { ...v, banner: w[k][0], chip: w[k][1] }]))
}
export const LABELS = labels('en')
