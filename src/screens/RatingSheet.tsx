import { useState } from 'react'
import { useServices } from '../app/ServicesContext'
import type { FrienzyEvent } from '../domain/event'
import { RATING_LABELS, type RatingLabel } from '../attendance/types'
import { useToast } from '../feedback/ToastContext'
import { useRunAction } from '../participation/useRunAction'
import { BottomSheet } from '../ui/BottomSheet'
import { StarPicker } from './StarPicker'

interface Props {
  event: FrienzyEvent
  uid: string
  onChanged: () => void
  onClose: () => void
}

// Finestra dal basso "Com'è andata?": da 1 a 5 stelle e, se vuoi, un'etichetta. Si vota una volta sola.
export function RatingSheet({ event, uid, onChanged, onClose }: Props) {
  const { attendance } = useServices()
  const { show } = useToast()
  const { busy, error, run } = useRunAction(onChanged)
  const [stars, setStars] = useState(0)
  const [label, setLabel] = useState<RatingLabel | ''>('')

  async function send() {
    const ok = await run(() => attendance.rate(event.id, uid, { stelle: stars, etichetta: label }))
    if (ok) {
      show('Grazie per il voto!', 'success')
      onClose()
    }
  }

  return (
    <BottomSheet title="Com'è andata?" onClose={onClose}>
      <p className="sheet-text">Il voto resta tra te e chi organizza: aiuta a far crescere gli eventi di {event.titolo}.</p>
      <StarPicker value={stars} onChange={setStars} disabled={busy} />
      <ul className="chip-row rating-labels" aria-label="Un'etichetta (facoltativa)">
        {RATING_LABELS.map((l) => (
          <li key={l}>
            <button type="button" className="chip-toggle" aria-pressed={label === l} onClick={() => setLabel(label === l ? '' : l)}>{l}</button>
          </li>
        ))}
      </ul>
      {error && <p role="alert" className="error">{error}</p>}
      <div className="sheet-actions">
        <button type="button" disabled={busy || stars === 0} aria-busy={busy} onClick={() => void send()}>Invia il voto</button>
      </div>
    </BottomSheet>
  )
}
