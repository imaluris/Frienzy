import { useEffect, useState } from 'react'
import { useServices } from '../app/ServicesContext'
import type { FrienzyEvent } from '../domain/event'
import { hasEnded } from '../attendance/decide'
import type { Rating } from '../attendance/types'
import { Icon } from '../ui/Icon'
import { PresenceSheet } from './PresenceSheet'
import { RatingSheet } from './RatingSheet'

interface Props {
  event: FrienzyEvent
  uid: string
  role: 'organizzatore' | 'confermato'
}

// Riga nel dettaglio di un evento già iniziato: l'organizzatore segna le presenze, il confermato lascia il voto (una volta sola).
export function FeedbackLink({ event, uid, role }: Props) {
  const { attendance } = useServices()
  const [open, setOpen] = useState(false)
  const [version, setVersion] = useState(0)
  const [rating, setRating] = useState<Rating | null | undefined>(undefined) // undefined = sto caricando
  const mine = role === 'confermato'

  useEffect(() => {
    if (!mine) return
    let active = true
    attendance.getRating(event.id, uid).then((r) => active && setRating(r)).catch(() => active && setRating(null))
    return () => {
      active = false
    }
  }, [attendance, event.id, uid, mine, version])

  if (!hasEnded(event, new Date()) || event.stato === 'annullato') return null
  if (mine && rating === undefined) return null

  if (mine && rating) {
    return (
      <div className="chat-link locked feedback-done" role="note">
        <span className="chat-link-icon"><Icon name="star" size={24} solid /></span>
        <span className="chat-link-text"><strong>Hai votato {rating.stelle} {rating.stelle === 1 ? 'stella' : 'stelle'}</strong><small>Grazie, il tuo parere ci aiuta.</small></span>
      </div>
    )
  }
  return (
    <>
      <button type="button" className="chat-link feedback-link" onClick={() => setOpen(true)}>
        <span className="chat-link-icon">{mine ? <Icon name="star" size={24} filled /> : <Icon name="user-check" size={24} filled />}</span>
        <span className="chat-link-text">
          <strong>{mine ? "Com'è andata?" : 'Chi è venuto?'}</strong>
          <small>{mine ? 'Lascia un voto da 1 a 5 stelle.' : 'Segna le presenze di chi era confermato.'}</small>
        </span>
        <Icon name="next" size={20} />
      </button>
      {open && mine && <RatingSheet event={event} uid={uid} onChanged={() => setVersion((v) => v + 1)} onClose={() => setOpen(false)} />}
      {open && !mine && <PresenceSheet event={event} uid={uid} onClose={() => setOpen(false)} />}
    </>
  )
}
