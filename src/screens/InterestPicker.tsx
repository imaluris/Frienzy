import { EVENT_TYPE_EMOJI, EVENT_TYPE_IDS } from '../domain/eventTypes'

interface Props {
  selected: string[]
  onChange: (selected: string[]) => void
}

// Un chip per ogni tipo di evento (stessi id degli eventi). aria-pressed dice se è scelto.
export function InterestPicker({ selected, onChange }: Props) {
  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])
  }
  return (
    <fieldset className="interests">
      <legend>Interessi</legend>
      <div className="chip-row">
        {EVENT_TYPE_IDS.map((id) => (
          <button key={id} type="button" className="chip-toggle" aria-pressed={selected.includes(id)} onClick={() => toggle(id)}>
            <span aria-hidden="true">{EVENT_TYPE_EMOJI[id]}</span> {id}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
