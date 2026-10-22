import { useServices } from '../app/ServicesContext'
import { usePush } from '../push/usePush'

const STATUS_LABEL = {
  idle: 'Non attivate',
  unsupported: 'Non disponibili qui (servono sull\'app Android)',
  denied: 'Permesso negato',
  registering: 'Registrazione in corso…',
  registered: 'Attive',
  error: 'Errore',
} as const

// Schermata per sviluppatori: mostra lo stato delle notifiche e il token da copiare in Firebase.
export function DebugScreen({ onBack }: { onBack: () => void }) {
  const { push } = useServices()
  const { state, enable } = usePush(push)
  return (
    <section className="card">
      <h2>Debug</h2>
      <p>Notifiche: {STATUS_LABEL[state.status]}</p>
      {state.error && <p role="alert">{state.error}</p>}
      {state.token && <p>Token: <code style={{ wordBreak: 'break-all' }}>{state.token}</code></p>}
      {state.last && <p>Ultima notifica: {state.last.title} – {state.last.body}</p>}
      <button type="button" onClick={() => void enable()} disabled={state.status === 'unsupported'}>Attiva notifiche</button>{' '}
      <button type="button" className="link" onClick={onBack}>Indietro</button>
    </section>
  )
}
