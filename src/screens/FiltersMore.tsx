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

/** Quanti filtri "extra" (date, distanza) sono attivi: serve al numerino sul pannello chiuso. */
export function countMoreFilters(filters: EventFilters): number {
  return [filters.da, filters.a, filters.raggioKm].filter((x) => x !== null).length
}

// Pannello apribile con date e distanza: tenuto chiuso per lasciare spazio agli eventi.
export function FiltersMore({ filters, onChange, position, onAskPosition }: Props) {
  const point = position.status === 'ok' ? position.point : null
  const active = countMoreFilters(filters)
  return (
    <details className="filters-more">
      <summary>Data e distanza{active > 0 && <span className="badge">{active}</span>}</summary>
      <div className="filters-more-body">
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
    </details>
  )
}
