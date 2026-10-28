import { EVENT_TYPE_EMOJI, EVENT_TYPE_IDS } from '../domain/eventTypes'

interface Props {
  value: string
  onChange: (id: string) => void
}

// Scelta del tipo: una griglia di tasti con emoji, se ne sceglie uno solo.
export function TypeSelector({ value, onChange }: Props) {
  return (
    <div className="type-grid" role="radiogroup" aria-label="Tipo di evento">
      {EVENT_TYPE_IDS.map((id) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={value === id}
          className="type-option"
          onClick={() => onChange(id)}
        >
          <span className="type-emoji" aria-hidden="true">{EVENT_TYPE_EMOJI[id]}</span>
          {id}
        </button>
      ))}
    </div>
  )
}
