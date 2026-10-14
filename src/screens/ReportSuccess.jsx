import Icon from '../icons.jsx'
import { useT } from '../i18n.js'

const CHANNELS = [['bank', 'rs.c1'], ['shok', 'rs.c2'], ['doc', 'rs.c3']]

export default function ReportSuccess({ lastReport, tab, mode }) {
  const { t } = useT()
  return (
    <div className="sc" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 36 }}>
      <div className="successico" style={{ width: 76, height: 76, borderRadius: 38, background: '#DDF1E4', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="chk" size={34} color="#1E7A4A" /></div>
      <div style={{ fontSize: 24, fontWeight: 600, textAlign: 'center', lineHeight: 1.3, marginTop: 22 }}>{t('rs.thanks')}</div>
      <div className="t" style={{ fontSize: 13.5, textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>{t('rs.received')}<br />{t('rs.ref', { ref: lastReport?.ref || '—' })}</div>
      <div className="card pad" style={{ width: '100%', marginTop: 22 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{t('rs.whileT')}</div>
        <div className="t" style={{ marginTop: 6, fontSize: 12.5, lineHeight: 1.5 }}>{t('rs.whileB')}</div>
      </div>
      <div className="card" style={{ width: '100%', marginTop: 14, padding: '10px 16px' }}>
        <div style={{ fontSize: 14, fontWeight: 600, padding: '6px 0' }}>{t('rs.also')}</div>
        {CHANNELS.map(([i, k]) => (
          <div className="row" key={k} style={{ padding: '10px 0' }}>
            <span className="ico" style={{ width: 36, height: 36 }}><Icon name={i} size={18} color="var(--p)" /></span>
            <span className="flex1"><div style={{ fontSize: 13, fontWeight: 500 }}>{t(k + 't')}</div><div className="t" style={{ fontSize: 11 }}>{t(k + 's')}</div></span>
          </div>
        ))}
        <div className="t" style={{ fontSize: 11, padding: '4px 0 6px' }}>{t('rs.always')}</div>
      </div>
      <div className="t" style={{ marginTop: 14, textAlign: 'center' }}>{mode === 'user' ? t('rs.savedCloud') : t('rs.savedLocal')}</div>
      <button className="btn pri" style={{ marginTop: 18, flex: 'none' }} onClick={() => tab('home')}>{t('rs.home')}</button>
    </div>
  )
}
