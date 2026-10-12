import { EVENT_TYPE_EMOJI, EVENT_TYPE_IDS } from '../domain/eventTypes'

interface Props {
  selected: string[]
  onChange: (selected: string[]) => void
}

// Una casella per ogni tipo di evento: stessi id usati dagli eventi.
export function InterestPicker({ selected, onChange }: Props) {
  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])
  }
  return (
    <fieldset>
      <legend>Interessi</legend>
      {EVENT_TYPE_IDS.map((id) => (
        <label key={id} className="inline">
          <input type="checkbox" checked={selected.includes(id)} onChange={() => toggle(id)} />
          {EVENT_TYPE_EMOJI[id]} {id}
        </label>
      ))}
    </fieldset>
  )
}
