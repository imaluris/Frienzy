import type { MyJoined } from '../mine/buildMine'
import { EmptyState } from '../ui/EmptyState'
import { EventCard } from '../ui/EventCard'

const STATO_LABEL = { richiesta: 'In attesa di risposta', confermato: 'Confermato', rifiutato: 'Rifiutato' } as const

interface Props {
  items: MyJoined[]
  showEmpty: boolean
  onOpen: (eventId: string) => void
  onWithdraw: (eventId: string) => void
}

// Scheda "Iscrizioni": gli eventi a cui partecipo o ho chiesto di partecipare, con il ritiro.
export function MineJoined({ items, showEmpty, onOpen, onWithdraw }: Props) {
  return (
    <>
      {showEmpty && items.length === 0 && <EmptyState art="no-joined" text="Non sei iscritto a nessun evento." />}
      <ul className="event-list">
        {items.map(({ event, participation }) => (
          <li key={event.id}>
            <EventCard
              event={event}
              onOpen={() => onOpen(event.id)}
              note={event.stato === 'annullato' ? undefined : STATO_LABEL[participation.stato]}
              footer={
                <button type="button" className="link" onClick={() => onWithdraw(event.id)}>
                  {participation.stato === 'richiesta' ? 'Ritira la richiesta' : 'Ritirati'}
                </button>
              }
            />
          </li>
        ))}
      </ul>
    </>
  )
}
