import { EVENT_TYPE_EMOJI, EVENT_TYPE_IDS, type EventTypeId } from '../domain/eventTypes'
import type { EventFilters } from '../filters/eventFilters'
import type { PositionState } from '../filters/useMyPosition'

interface Props {
  filters: EventFilters
  onChange: (next: EventFilters) => void
  position: PositionState
  onAskPosition: () => void
}

const RADII = [5, 10, 25, 50]
// <input type="date"> dà "2031-03-12": lo trasformo in Date UTC come per la data di nascita.
const toDate = (text: string) => (text ? new Date(`${text}T00:00:00Z`) : null)
const toText = (date: Date | null) => (date ? date.toISOString().slice(0, 10) : '')

// Barra dei filtri: tipo (più scelte), intervallo di date, distanza dalla mia posizione.
export function FiltersBar({ filters, onChange, position, onAskPosition }: Props) {
  const toggleType = (id: EventTypeId) => {
    const tipi = filters.tipi.includes(id) ? filters.tipi.filter((t) => t !== id) : [...filters.tipi, id]
    onChange({ ...filters, tipi })
  }
  const point = position.status === 'ok' ? position.point : null

  return (
    <div className="filters">
      <div role="group" aria-label="Tipo">
        {EVENT_TYPE_IDS.map((id) => (
          <button key={id} type="button" aria-pressed={filters.tipi.includes(id)} onClick={() => toggleType(id)}>
            {EVENT_TYPE_EMOJI[id]} {id}
          </button>
        ))}
      </div>
      <label>Dal <input type="date" value={toText(filters.da)} onChange={(e) => onChange({ ...filters, da: toDate(e.target.value) })} /></label>
      <label>Al <input type="date" value={toText(filters.a)} onChange={(e) => onChange({ ...filters, a: toDate(e.target.value) })} /></label>
      {point ? (
        <label>Entro{' '}
          <select
            value={filters.raggioKm ?? ''}
            onChange={(e) => {
              const km = e.target.value ? Number(e.target.value) : null
              onChange({ ...filters, centro: km === null ? null : point, raggioKm: km })
            }}
          >
            <option value="">ovunque</option>
            {RADII.map((km) => <option key={km} value={km}>{km} km</option>)}
          </select>
        </label>
      ) : (
        <button type="button" onClick={onAskPosition} disabled={position.status === 'asking'}>Filtra per distanza</button>
      )}
      {position.status === 'denied' && <p role="alert" className="error">Posizione non concessa.</p>}
      {position.status === 'unsupported' && <p role="alert" className="error">Posizione non disponibile.</p>}
    </div>
  )
}
