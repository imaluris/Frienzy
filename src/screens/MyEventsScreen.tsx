import { useState } from 'react'
import { useServices } from '../app/ServicesContext'
import { EVENT_TYPE_EMOJI } from '../domain/eventTypes'
import { cancelEvent } from '../events/cancelEvent'
import { formatEventDate } from '../events/format'
import { useMine } from '../mine/useMine'
import { withdrawFromEvent } from '../participation/withdrawFromEvent'

const STATO_LABEL = { richiesta: 'In attesa di risposta', confermato: 'Confermato', rifiutato: 'Rifiutato' } as const

// "I miei eventi" (che organizzo) e "Le mie iscrizioni", con annullamento e ritiro.
export function MyEventsScreen({ uid, onOpen, onBack }: { uid: string; onOpen: (eventId: string) => void; onBack: () => void }) {
  const services = useServices()
  const { loading, failed, mine, reload } = useMine(services, uid)
  const [error, setError] = useState('')

  // Esegue l'azione, mostra il motivo se fallisce, poi rilegge le liste.
  async function run(action: () => Promise<unknown>) {
    setError('')
    try {
      await action()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Operazione non riuscita')
    }
    reload()
  }

  return (
    <section className="card">
      <h2>I miei eventi</h2>
      {loading && <p>Caricamento…</p>}
      {failed && <p role="alert" className="error">Non riesco a caricare i tuoi eventi.</p>}
      {error && <p role="alert" className="error">{error}</p>}
      {!loading && !failed && mine.organized.length === 0 && <p>Non organizzi ancora nessun evento.</p>}
      <ul className="event-list">
        {mine.organized.map((event) => (
          <li key={event.id}>
            <button type="button" className="event-item" onClick={() => onOpen(event.id)}>
              <span aria-hidden="true">{EVENT_TYPE_EMOJI[event.tipo]}</span> {event.titolo}
              <small>{formatEventDate(event.dataOra)} · {event.stato === 'annullato' ? 'Annullato' : event.zonaNome}</small>
            </button>
            {event.stato !== 'annullato' && (
              <button type="button" className="link" onClick={() => void run(() => cancelEvent(services.events, event.id, uid))}>
                Annulla evento
              </button>
            )}
          </li>
        ))}
      </ul>
      <h2>Le mie iscrizioni</h2>
      {!loading && !failed && mine.joined.length === 0 && <p>Non sei iscritto a nessun evento.</p>}
      <ul className="event-list">
        {mine.joined.map(({ event, participation }) => (
          <li key={event.id}>
            <button type="button" className="event-item" onClick={() => onOpen(event.id)}>
              <span aria-hidden="true">{EVENT_TYPE_EMOJI[event.tipo]}</span> {event.titolo}
              <small>
                {formatEventDate(event.dataOra)} · {event.stato === 'annullato' ? 'Evento annullato' : STATO_LABEL[participation.stato]}
              </small>
            </button>
            <button type="button" className="link" onClick={() => void run(() => withdrawFromEvent(services.participations, event.id, uid))}>
              {participation.stato === 'richiesta' ? 'Ritira la richiesta' : 'Ritirati'}
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="link" onClick={onBack}>Indietro</button>
    </section>
  )
}
