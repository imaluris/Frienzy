import { EVENT_TYPE_EMOJI, EVENT_TYPE_IDS, type EventTypeId } from '../domain/eventTypes'
import type { EventFilters } from '../filters/eventFilters'
import type { PositionState } from '../filters/useMyPosition'
import { FiltersMore } from './FiltersMore'

interface Props {
  filters: EventFilters
  onChange: (next: EventFilters) => void
  position: PositionState
  onAskPosition: () => void
}

// Filtri: una riga di tipi che scorre di lato + un pannello apribile per data e distanza.
export function FiltersBar({ filters, onChange, position, onAskPosition }: Props) {
  const toggleType = (id: EventTypeId) => {
    const tipi = filters.tipi.includes(id) ? filters.tipi.filter((t) => t !== id) : [...filters.tipi, id]
    onChange({ ...filters, tipi })
  }

  return (
    <div className="filters">
      <div role="group" aria-label="Tipo" className="filters-types">
        {EVENT_TYPE_IDS.map((id) => (
          <button key={id} type="button" aria-pressed={filters.tipi.includes(id)} onClick={() => toggleType(id)}>
            {EVENT_TYPE_EMOJI[id]} {id}
          </button>
        ))}
      </div>
      <FiltersMore filters={filters} onChange={onChange} position={position} onAskPosition={onAskPosition} />
    </div>
  )
}
