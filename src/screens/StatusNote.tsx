import type { ParticipationView } from '../participation/participationView'
import { statusNote } from '../participation/actionBar'
import { Icon, type IconName } from '../ui/Icon'

const ICON: Record<'ok' | 'wait' | 'stop', IconName> = { ok: 'check-circle', wait: 'hourglass', stop: 'ban' }

// Frase di stato in evidenza ("Sei dei nostri", "Richiesta inviata"...) con icona e colore del tono.
export function StatusNote({ view }: { view: ParticipationView }) {
  const note = statusNote(view)
  if (!note) return null
  return (
    <p className={`status-note status-${note.tone}`} role="status">
      <Icon name={ICON[note.tone]} size={20} />
      <span>{note.text}</span>
    </p>
  )
}
