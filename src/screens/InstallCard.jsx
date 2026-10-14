import { useState } from 'react'
import Icon from '../icons.jsx'
import { useT } from '../i18n.js'
import { useInstall } from '../install.js'

const KEY = 'moniguard:installDismissed'
const dismissed = () => { try { return localStorage.getItem(KEY) === '1' } catch { return false } }

// compact: the Home card (can be dismissed). Otherwise: the Settings row.
export default function InstallCard({ compact = false }) {
  const { t } = useT()
  const ins = useInstall()
  const [hide, setHide] = useState(dismissed)
  const [showHow, setShowHow] = useState(false)
  if (ins.installed) return compact ? null : <div className="row"><span className="ico"><Icon name="cc" size={20} color="#1E7A4A" /></span><span className="flex1 ttl">{t('inst.done')}</span></div>
  if (compact && (hide || (!ins.canPrompt && !ins.ios))) return null

  const install = async () => { if (ins.canPrompt) await ins.prompt(); else setShowHow(true) }
  const how = showHow && <div className="t" style={{ marginTop: 8, lineHeight: 1.5, color: 'var(--ink)' }}>{ins.ios ? t('inst.ios') : t('inst.other')}</div>

  if (compact) {
    return (
      <div className="installcard">
        <img src="/icons/icon-192.png" alt="" width="44" height="44" style={{ borderRadius: 12, flex: 'none' }} />
        <div className="flex1">
          <div style={{ fontSize: 13.5, fontWeight: 600 }}>{t('inst.title')}</div>
          <div className="t" style={{ marginTop: 2 }}>{t('inst.sub')}</div>
          {how}
          <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
            <button className="link" style={{ fontWeight: 600 }} onClick={install}>{ins.canPrompt ? t('inst.btn') : t('inst.how')}</button>
            <button className="link" style={{ color: 'var(--mut)' }} onClick={() => { try { localStorage.setItem(KEY, '1') } catch { /* ignore */ } setHide(true) }}>{t('inst.later')}</button>
          </div>
        </div>
      </div>
    )
  }
  return (
    <button className="row" onClick={install} style={{ alignItems: 'flex-start' }}>
      <span className="ico"><Icon name="dn" size={20} color="var(--p)" /></span>
      <span className="flex1"><div className="ttl">{t('inst.title')}</div><div className="t" style={{ fontSize: 11 }}>{t('inst.sub')}</div>{how}</span>
      <Icon name="ch" size={18} color="#8A84A3" />
    </button>
  )
}
