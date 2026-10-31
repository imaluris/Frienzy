import { EVENT_TYPE_EMOJI, isEventTypeId } from '../domain/eventTypes'

// Interessi in sola lettura, come chip con emoji.
export function InterestChips({ interests }: { interests: string[] }) {
  if (interests.length === 0) return null
  return (
    <ul className="chip-row" aria-label="Interessi">
      {interests.map((id) => (
        <li key={id} className="chip">
          <span aria-hidden="true">{isEventTypeId(id) ? EVENT_TYPE_EMOJI[id] : '✨'}</span>
          {id}
        </li>
      ))}
    </ul>
  )
}
