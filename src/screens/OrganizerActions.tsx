import { useServices } from '../app/ServicesContext'
import type { FrienzyEvent } from '../domain/event'
import { cancelEvent } from '../events/cancelEvent'
import { respondToRequest } from '../participation/respondToRequest'
import type { PendingRequest } from '../participation/useEventParticipation'
import { useRunAction } from '../participation/useRunAction'

interface Props {
  event: FrienzyEvent
  uid: string
  requests: PendingRequest[]
  confirmedCount: number
  onChanged: () => void
}

// Pannello dell'organizzatore: richieste da accettare o rifiutare e annullamento dell'evento.
export function OrganizerActions({ event, uid, requests, confirmedCount, onChanged }: Props) {
  const { participations, events } = useServices()
  const { busy, error, run } = useRunAction(onChanged)
  const cancelled = event.stato === 'annullato'
  return (
    <section aria-label="Organizzazione">
      <h3>Sei l'organizzatore</h3>
      <p>Posti occupati: {confirmedCount} su {event.maxPartecipanti}</p>
      {cancelled && <p>Questo evento è stato annullato.</p>}
      {!cancelled && requests.length === 0 && event.richiedeApprovazione && <p>Nessuna richiesta in attesa.</p>}
      {!cancelled && requests.length > 0 && (
        <ul className="requests">
          {requests.map((r) => (
            <li key={r.uid}>
              <strong>{r.nome}</strong>, {r.eta} anni
              <span className="row-actions">
                <button type="button" disabled={busy} aria-label={`Accetta ${r.nome}`} onClick={() => run(() => respondToRequest(participations, event.id, r.uid, uid, 'accetta'))}>Accetta</button>
                <button type="button" className="secondary" disabled={busy} aria-label={`Rifiuta ${r.nome}`} onClick={() => run(() => respondToRequest(participations, event.id, r.uid, uid, 'rifiuta'))}>Rifiuta</button>
              </span>
            </li>
          ))}
        </ul>
      )}
      {!cancelled && (
        <button type="button" className="secondary" disabled={busy} onClick={() => run(() => cancelEvent(events, event.id, uid))}>
          Annulla evento
        </button>
      )}
      {error && <p role="alert" className="error">{error}</p>}
    </section>
  )
}
