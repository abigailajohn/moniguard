import Icon from '../icons.jsx'
import { labels } from '../labels.js'
import { useT } from '../i18n.js'
import { kindIcon, when } from '../store.js'

// One line per check: what it was (and amount), then the verdict and when.
export default function CheckRow({ h, onClick }) {
  const { t, lang } = useT()
  const L = labels(lang)[h.result.label]
  const r = h.result
  const isImage = h.source?.type === 'file' && h.source.kind === 'image'
  const title = [t('r.kind.' + r.kind), r.amount].filter(Boolean).join(' · ')
  return (
    <button className="row" onClick={onClick}>
      <span className="ico" style={{ width: 44, height: 44 }}><Icon name={kindIcon(isImage ? 'image' : r.kind)} size={22} color="var(--p)" /></span>
      <span className="flex1">
        <div className="ttl" style={{ fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, gap: 8 }}>
          <span className={`pill ${L.tone}`}><i />{L.chip}</span>
          <span className="t" style={{ fontSize: 11 }}>{when(h.ts, t, lang)}</span>
        </div>
      </span>
      <Icon name="ch" size={18} color="#8A84A3" />
    </button>
  )
}
