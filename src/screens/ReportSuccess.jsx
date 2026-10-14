import Icon from '../icons.jsx'

const CHANNELS = [
  ['bank', "Your bank's fraud team", 'The bank named in the message or invoice'],
  ['shok', 'MAUCORS / CERT-MU', 'Online scams and cyber incidents'],
  ['doc', 'Financial Crimes Commission', 'Fraud and financial crime'],
]

export default function ReportSuccess({ lastReport, tab }) {
  return (
    <div className="sc" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 36 }}>
      <div style={{ width: 76, height: 76, borderRadius: 38, background: '#DDF1E4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chk" size={34} color="#1E7A4A" /></div>
      <div style={{ fontSize: 24, fontWeight: 600, textAlign: 'center', lineHeight: 1.3, marginTop: 22 }}>Thank you for helping protect other businesses</div>
      <div className="t" style={{ fontSize: 13.5, textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>Your report has been received.<br />Reference {lastReport?.ref || 'MG-2026-0000'}</div>
      <div className="card pad" style={{ width: '100%', marginTop: 22 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>While we review your report</div>
        <div className="t" style={{ marginTop: 6, fontSize: 12.5, lineHeight: 1.5 }}>Keep your evidence. Don't send more money. If you already paid, contact your bank through its official channel.</div>
      </div>
      <div className="card" style={{ width: '100%', marginTop: 14, padding: '10px 16px' }}>
        <div style={{ fontSize: 14, fontWeight: 600, padding: '6px 0' }}>Also report to the official channels</div>
        {CHANNELS.map(([i, t, s]) => (
          <div className="row" key={t} style={{ padding: '10px 0' }}>
            <span className="ico" style={{ width: 36, height: 36 }}><Icon name={i} size={18} color="var(--p)" /></span>
            <span className="flex1"><div style={{ fontSize: 13, fontWeight: 500 }}>{t}</div><div className="t" style={{ fontSize: 11 }}>{s}</div></span>
          </div>
        ))}
        <div className="t" style={{ fontSize: 11, padding: '4px 0 6px' }}>Always use the organisation's own website or phone number.</div>
      </div>
      <div className="t" style={{ marginTop: 14, textAlign: 'center' }}>Demo build: reports are saved on this device only.</div>
      <button className="btn pri" style={{ marginTop: 18, flex: 'none' }} onClick={() => tab('home')}>Back to Home</button>
    </div>
  )
}
