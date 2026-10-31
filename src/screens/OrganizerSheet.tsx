import { useState } from 'react'
import { useServices } from '../app/ServicesContext'
import type { FrienzyEvent } from '../domain/event'
import { cancelEvent } from '../events/cancelEvent'
import { respondToRequest } from '../participation/respondToRequest'
import type { PendingRequest } from '../participation/useEventParticipation'
import { useRunAction } from '../participation/useRunAction'
import { Avatar } from '../ui/Avatar'
import { BottomSheet } from '../ui/BottomSheet'
import { ConfirmSheet } from '../ui/ConfirmSheet'

interface Props {
  event: FrienzyEvent
  uid: string
  requests: PendingRequest[]
  confirmedCount: number
  onChanged: () => void
  onClose: () => void
}

// Pannello dell'organizzatore (finestra dal basso): richieste da accettare o rifiutare e annullamento con conferma.
export function OrganizerSheet({ event, uid, requests, confirmedCount, onChanged, onClose }: Props) {
  const { participations, events } = useServices()
  const { busy, error, run } = useRunAction(onChanged)
  const [confirming, setConfirming] = useState(false)
  const cancelled = event.stato === 'annullato'

  async function doCancel() {
    await run(() => cancelEvent(events, event.id, uid))
    onClose()
  }

  if (confirming) {
    return (
      <ConfirmSheet
        title="Annullare l'evento?" text="Tutti gli iscritti vedranno che l'evento è annullato. Non si può tornare indietro."
        confirmLabel="Sì, annulla l'evento" cancelLabel="No, tienilo" busy={busy} onConfirm={doCancel} onClose={() => setConfirming(false)}
      />
    )
  }
  return (
    <BottomSheet title="Gestisci evento" onClose={onClose}>
      <p className="sheet-text">Posti occupati: {confirmedCount} su {event.maxPartecipanti}</p>
      {!cancelled && requests.length === 0 && event.richiedeApprovazione && <p className="empty">Nessuna richiesta in attesa.</p>}
      {!cancelled && requests.length > 0 && (
        <ul className="requests">
          {requests.map((r) => (
            <li key={r.uid} className="request-row">
              <Avatar name={r.nome} size="md" />
              <span className="request-who"><strong>{r.nome}</strong><small>{r.eta} anni</small></span>
              <span className="row-actions">
                <button type="button" disabled={busy} aria-label={`Accetta ${r.nome}`} onClick={() => run(() => respondToRequest(participations, event.id, r.uid, uid, 'accetta'))}>Accetta</button>
                <button type="button" className="secondary" disabled={busy} aria-label={`Rifiuta ${r.nome}`} onClick={() => run(() => respondToRequest(participations, event.id, r.uid, uid, 'rifiuta'))}>Rifiuta</button>
              </span>
            </li>
          ))}
        </ul>
      )}
      {error && <p role="alert" className="error">{error}</p>}
      {!cancelled && <button type="button" className="secondary danger-outline wide" disabled={busy} onClick={() => setConfirming(true)}>Annulla evento</button>}
      <button type="button" className="link wide" onClick={onClose}>Chiudi</button>
    </BottomSheet>
  )
}
