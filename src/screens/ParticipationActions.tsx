import { joinEvent } from '../participation/joinEvent'
import { withdrawFromEvent } from '../participation/withdrawFromEvent'
import type { ParticipationView } from '../participation/participationView'
import { useServices } from '../app/ServicesContext'
import { useRunAction } from '../participation/useRunAction'

const INFO: Partial<Record<ParticipationView, string>> = {
  annullato: 'Questo evento è stato annullato.',
  chiuso: 'Le iscrizioni a questo evento sono chiuse.',
  confermato: 'Sei dei nostri: la tua partecipazione è confermata.',
  richiesta: "Richiesta inviata: aspetta la risposta dell'organizzatore.",
  rifiutato: "L'organizzatore non ha accettato la tua richiesta.",
  pieno: 'Posti esauriti: questo evento è al completo.',
}

interface Props {
  view: ParticipationView
  eventId: string
  uid: string
  onChanged: () => void
}

// I pulsanti di chi NON organizza: partecipa / chiedi di partecipare / ritirati.
export function ParticipationActions({ view, eventId, uid, onChanged }: Props) {
  const { participations } = useServices()
  const { busy, error, run } = useRunAction(onChanged)
  const canJoin = view === 'partecipa' || view === 'chiedi'
  const canWithdraw = view === 'confermato' || view === 'richiesta'
  return (
    <section aria-label="Partecipazione">
      {INFO[view] && <p>{INFO[view]}</p>}
      {canJoin && (
        <button type="button" disabled={busy} aria-busy={busy} onClick={() => run(() => joinEvent(participations, eventId, uid))}>
          {view === 'chiedi' ? 'Chiedi di partecipare' : 'Partecipa'}
        </button>
      )}
      {canWithdraw && (
        <button type="button" className="secondary" disabled={busy} aria-busy={busy} onClick={() => run(() => withdrawFromEvent(participations, eventId, uid))}>
          {view === 'richiesta' ? 'Ritira la richiesta' : 'Ritirati'}
        </button>
      )}
      {error && <p role="alert" className="error">{error}</p>}
    </section>
  )
}
