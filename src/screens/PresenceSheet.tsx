import { useState } from 'react'
import { useServices } from '../app/ServicesContext'
import type { FrienzyEvent } from '../domain/event'
import { usePresenceList } from '../attendance/usePresenceList'
import type { PresenceStatus } from '../attendance/types'
import { useRunAction } from '../participation/useRunAction'
import { Avatar } from '../ui/Avatar'
import { BottomSheet } from '../ui/BottomSheet'
import { Icon } from '../ui/Icon'

interface Props {
  event: FrienzyEvent
  uid: string
  onClose: () => void
}

// Finestra dell'organizzatore dopo l'evento: per ogni confermato "È venuto" oppure "Non c'era". Si può correggere.
export function PresenceSheet({ event, uid, onClose }: Props) {
  const services = useServices()
  const [version, setVersion] = useState(0)
  const { loading, people, marks } = usePresenceList(services, event, version)
  const { busy, error, run } = useRunAction(() => setVersion((v) => v + 1))

  const mark = (target: string, stato: PresenceStatus) => void run(() => services.attendance.markPresence(event.id, uid, target, stato))
  const done = people.filter((p) => marks[p.uid]).length

  return (
    <BottomSheet title="Chi è venuto?" onClose={onClose}>
      {loading && <p className="loading">Caricamento…</p>}
      {!loading && people.length === 0 && <p className="empty">Nessun partecipante confermato.</p>}
      {!loading && people.length > 0 && <p className="sheet-text">Segnati {done} su {people.length}. Serve a dare un'idea di quanto ci si può contare.</p>}
      <ul className="requests">
        {people.map((p) => (
          <li key={p.uid} className="request-row presence-row">
            <Avatar name={p.nome} size="md" />
            <span className="request-who"><strong>{p.nome}</strong><small>{p.eta} anni</small></span>
            <span className="row-actions" role="group" aria-label={`Presenza di ${p.nome}`}>
              <button type="button" className={marks[p.uid] === 'presente' ? 'presence-on' : 'secondary'} aria-pressed={marks[p.uid] === 'presente'} disabled={busy} onClick={() => mark(p.uid, 'presente')}>
                <Icon name="check" size={20} /> È venuto
              </button>
              <button type="button" className={marks[p.uid] === 'assente' ? 'presence-off' : 'secondary'} aria-pressed={marks[p.uid] === 'assente'} disabled={busy} onClick={() => mark(p.uid, 'assente')}>
                <Icon name="close" size={20} /> Non c'era
              </button>
            </span>
          </li>
        ))}
      </ul>
      {error && <p role="alert" className="error">{error}</p>}
    </BottomSheet>
  )
}
