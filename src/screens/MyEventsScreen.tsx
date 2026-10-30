import { useState } from 'react'
import { useServices } from '../app/ServicesContext'
import { cancelEvent } from '../events/cancelEvent'
import { useMine } from '../mine/useMine'
import { withdrawFromEvent } from '../participation/withdrawFromEvent'
import { EmptyState } from '../ui/EmptyState'
import { EventCard } from '../ui/EventCard'

const STATO_LABEL = { richiesta: 'In attesa di risposta', confermato: 'Confermato', rifiutato: 'Rifiutato' } as const

// "I miei eventi" (che organizzo) e "Le mie iscrizioni", con annullamento e ritiro.
export function MyEventsScreen({ uid, onOpen }: { uid: string; onOpen: (eventId: string) => void }) {
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
    <section className="screen">
      <h2>Che organizzo</h2>
      {loading && <p className="loading">Caricamento…</p>}
      {failed && <p role="alert" className="error">Non riesco a caricare i tuoi eventi.</p>}
      {error && <p role="alert" className="error">{error}</p>}
      {!loading && !failed && mine.organized.length === 0 && <EmptyState icon="party" text="Non organizzi ancora nessun evento." />}
      <ul className="event-list">
        {mine.organized.map((event) => (
          <li key={event.id}>
            <EventCard
              event={event}
              onOpen={() => onOpen(event.id)}
              footer={event.stato !== 'annullato' && (
                <button type="button" className="link" onClick={() => void run(() => cancelEvent(services.events, event.id, uid))}>
                  Annulla evento
                </button>
              )}
            />
          </li>
        ))}
      </ul>
      <h2>Le mie iscrizioni</h2>
      {!loading && !failed && mine.joined.length === 0 && <EmptyState icon="ticket" text="Non sei iscritto a nessun evento." />}
      <ul className="event-list">
        {mine.joined.map(({ event, participation }) => (
          <li key={event.id}>
            <EventCard
              event={event}
              onOpen={() => onOpen(event.id)}
              note={event.stato === 'annullato' ? undefined : STATO_LABEL[participation.stato]}
              footer={
                <button type="button" className="link" onClick={() => void run(() => withdrawFromEvent(services.participations, event.id, uid))}>
                  {participation.stato === 'richiesta' ? 'Ritira la richiesta' : 'Ritirati'}
                </button>
              }
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
