import { PointPicker, type Point } from '../map/PointPicker'
import { parseNumber } from '../events/validation'

interface Props {
  lat: string
  lng: string
  emoji: string
  error?: string
  onPick: (point: Point) => void
}

function toPoint(lat: string, lng: string): Point | null {
  const la = parseNumber(lat)
  const ln = parseNumber(lng)
  return la === null || ln === null ? null : { lat: la, lng: ln }
}

// Il punto dell'evento: mappa da toccare + riga che conferma la scelta.
export function LocationField({ lat, lng, emoji, error, onPick }: Props) {
  const point = toPoint(lat, lng)
  return (
    <div className="field">
      <span className="field-label">Punto sulla mappa</span>
      <PointPicker value={point} emoji={emoji} onPick={onPick} />
      {point && <p className="hint">Punto scelto. Tocca un altro posto per spostarlo.</p>}
      {error && <span role="alert" className="field-error">{error}</span>}
    </div>
  )
}
