import { EVENT_TYPE_EMOJI, EVENT_TYPE_IDS } from '../domain/eventTypes'

interface Props {
  selected: string[]
  onChange: (selected: string[]) => void
}

// Passo 3: gli interessi sono chip grandi (uno per tipo di evento). aria-pressed dice se è scelto.
export function StepInterests({ selected, onChange }: Props) {
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])
  return (
    <>
      <h2 className="step-title">Cosa ti piace fare?</h2>
      <p className="step-hint">Scegli quello che vuoi: ti mostreremo prima le uscite più adatte a te.</p>
      <div className="big-chips">
        {EVENT_TYPE_IDS.map((id) => (
          <button key={id} type="button" className="big-chip" aria-pressed={selected.includes(id)} onClick={() => toggle(id)}>
            <span className="big-chip-emoji" aria-hidden="true">{EVENT_TYPE_EMOJI[id]}</span>
            {id}
          </button>
        ))}
      </div>
    </>
  )
}
