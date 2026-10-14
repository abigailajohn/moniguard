import { useT } from '../i18n.js'
import { Header } from './Alerts.jsx'
import CheckRow from './CheckRow.jsx'

export default function History({ state, back, go, setCurrent }) {
  const { t } = useT()
  return (
    <>
      <Header title={t('h.title')} back={back} />
      <div className="sc" style={{ paddingTop: 12 }}>
        <div className="card" style={{ padding: '2px 16px' }}>
          {state.history.map((h) => <CheckRow key={h.id} h={h} onClick={() => { setCurrent(h); go('result') }} />)}
        </div>
      </div>
    </>
  )
}
