import Icon from '../icons.jsx'

const TOPICS = ['Spotting fake supplier invoices', 'Checking a payment request', 'What to do if you have paid']
export default function Learn() {
  return (
    <div className="sc">
      <div className="top" style={{ marginTop: 6 }}><h1 className="h1b">Learn</h1><Icon name="help" size={28} color="var(--mut)" /></div>
      <div style={{ marginTop: 22, background: 'var(--lav2)', borderRadius: 26, padding: '28px 22px', textAlign: 'center' }}>
        <div className="av" style={{ width: 68, height: 68, margin: '0 auto' }}><Icon name="learn" size={32} color="var(--p)" /></div>
        <span className="pill" style={{ marginTop: 16, background: '#F6B73C', color: 'var(--ink)' }}>Coming soon</span>
        <div style={{ fontSize: 20, fontWeight: 600, marginTop: 12, lineHeight: 1.3 }}>Short guides on spotting financial scams</div>
        <div className="t" style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>Practical, plain-language tips for owner-managers, built from the scams we see in Mauritius.</div>
      </div>
      <div className="lbl" style={{ marginTop: 24 }}>On the way</div>
      <div className="card" style={{ padding: '2px 16px', opacity: 0.65 }}>
        {TOPICS.map((t) => <div className="row" key={t}><span className="ico"><Icon name="learn" size={20} color="var(--mut)" /></span><span className="flex1 ttl">{t}</span></div>)}
      </div>
    </div>
  )
}
