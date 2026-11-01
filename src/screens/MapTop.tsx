import { EVENT_TYPE_EMOJI, EVENT_TYPE_IDS, type EventTypeId } from '../domain/eventTypes'
import { SearchField } from './SearchField'

interface Props {
  query: string
  onQuery: (text: string) => void
  types: EventTypeId[]
  onTypes: (types: EventTypeId[]) => void
}

// Sopra la mappa: barra di ricerca e una riga di chip per tipo che scorre di lato.
export function MapTop({ query, onQuery, types, onTypes }: Props) {
  const toggle = (id: EventTypeId) => onTypes(types.includes(id) ? types.filter((t) => t !== id) : [...types, id])
  return (
    <div className="map-top">
      <SearchField value={query} onChange={onQuery} />
      <div role="group" aria-label="Tipo" className="map-chips">
        {EVENT_TYPE_IDS.map((id) => (
          <button key={id} type="button" aria-pressed={types.includes(id)} onClick={() => toggle(id)}>
            <span aria-hidden="true">{EVENT_TYPE_EMOJI[id]}</span> {id}
          </button>
        ))}
      </div>
    </div>
  )
}
