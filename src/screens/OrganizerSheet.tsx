import { useState } from 'react'
import { useServices } from '../app/ServicesContext'
import type { FrienzyEvent } from '../domain/event'
import { useToast } from '../feedback/ToastContext'
import { cancelEvent } from '../events/cancelEvent'
import { respondToRequest } from '../participation/respondToRequest'
import type { PendingRequest } from '../participation/useEventParticipation'
import { useRunAction } from '../participation/useRunAction'
import { Avatar } from '../ui/Avatar'
import { BottomSheet } from '../ui/BottomSheet'
import { ConfirmSheet } from '../ui/ConfirmSheet'
import { EditEventSheet } from './EditEventSheet'

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
  const { show } = useToast()
  const [confirming, setConfirming] = useState(false)
  const [editing, setEditing] = useState(false)
  const cancelled = event.stato === 'annullato'

  async function doCancel() {
    const ok = await run(() => cancelEvent(events, event.id, uid))
    if (ok) show('Evento annullato', 'warning')
    onClose()
  }

  async function respond(r: PendingRequest, answer: 'accetta' | 'rifiuta') {
    const ok = await run(() => respondToRequest(participations, event.id, r.uid, uid, answer))
    if (ok) show(answer === 'accetta' ? `${r.nome} è dei nostri` : 'Richiesta rifiutata', answer === 'accetta' ? 'success' : 'info')
  }

  if (confirming) {
    return (
      <ConfirmSheet
        title="Annullare l'evento?" text="Tutti gli iscritti vedranno che l'evento è annullato. Non si può tornare indietro."
        confirmLabel="Sì, annulla l'evento" cancelLabel="No, tienilo" busy={busy} onConfirm={doCancel} onClose={() => setConfirming(false)}
      />
    )
  }
  if (editing) {
    return <EditEventSheet event={event} uid={uid} confirmedCount={confirmedCount} onChanged={onChanged} onClose={() => { setEditing(false); onClose() }} />
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
                <button type="button" disabled={busy} aria-label={`Accetta ${r.nome}`} onClick={() => void respond(r, 'accetta')}>Accetta</button>
                <button type="button" className="secondary" disabled={busy} aria-label={`Rifiuta ${r.nome}`} onClick={() => void respond(r, 'rifiuta')}>Rifiuta</button>
              </span>
            </li>
          ))}
        </ul>
      )}
      {error && <p role="alert" className="error">{error}</p>}
      {!cancelled && <button type="button" className="secondary wide" disabled={busy} onClick={() => setEditing(true)}>Modifica evento</button>}
      {!cancelled && <button type="button" className="secondary danger-outline wide" disabled={busy} onClick={() => setConfirming(true)}>Annulla evento</button>}
      <button type="button" className="link wide" onClick={onClose}>Chiudi</button>
    </BottomSheet>
  )
}
