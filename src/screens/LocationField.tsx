import { useState } from 'react'
import { requestPosition } from '../filters/useMyPosition'
import { reversePlace } from '../geo/geocode'
import type { Place } from '../geo/place'
import { PointPicker, type Point } from '../map/PointPicker'
import { positionMessage } from '../map/positionMessage'
import { parseNumber } from '../events/validation'
import { Icon } from '../ui/Icon'
import { AddressSearch } from './AddressSearch'

interface Props {
  lat: string
  lng: string
  indirizzo: string
  zonaNome: string
  emoji: string
  color: string
  error?: string
  onPlace: (place: Place) => void
}

function toPoint(lat: string, lng: string): Point | null {
  const la = parseNumber(lat)
  const ln = parseNumber(lng)
  return la === null || ln === null ? null : { lat: la, lng: ln }
}

// Dove si svolge l'evento: indirizzo cercato, tocco sulla mappa o posizione attuale.
// In ogni caso punto, indirizzo esatto e zona nascono insieme da un indirizzo vero: non si possono scrivere a mano.
export function LocationField({ lat, lng, indirizzo, zonaNome, emoji, color, error, onPlace }: Props) {
  const point = toPoint(lat, lng)
  const [note, setNote] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [mine, setMine] = useState<Point | null>(null)

  async function fromPoint(p: Point) {
    setBusy(true)
    setNote(null)
    try {
      const place = await reversePlace(p)
      if (place) onPlace(place)
      else setNote('Qui non trovo un indirizzo: scegli un punto su una strada oppure cerca l\'indirizzo.')
    } catch {
      setNote('Non riesco a trovare l\'indirizzo di questo punto: controlla la connessione e riprova.')
    } finally {
      setBusy(false)
    }
  }

  async function locateMe() {
    setBusy(true)
    setNote(null)
    const result = await requestPosition()
    if (result.status === 'ok') {
      setMine(result.point)
      await fromPoint(result.point)
    } else {
      setNote(positionMessage(result))
      setBusy(false)
    }
  }

  return (
    <div className="field">
      <span className="field-label">Indirizzo dell'evento</span>
      <AddressSearch onChoose={onPlace} />
      <button type="button" className="secondary wide" disabled={busy} onClick={() => void locateMe()}>
        <Icon name="locate" size={20} /> Usa la mia posizione
      </button>
      <PointPicker value={point} center={mine} emoji={emoji} color={color} onPick={(p) => void fromPoint(p)} />
      <p className="hint">{busy ? 'Cerco l\'indirizzo…' : point ? 'Punto scelto. Tocca un altro posto per spostarlo.' : 'Oppure tocca la mappa nel punto esatto.'}</p>
      {note && <p role="status" className="hint">{note}</p>}
      {point && indirizzo && (
        <dl className="place-summary">
          <dt>Indirizzo esatto (lo vedono solo tu e chi è confermato)</dt>
          <dd>{indirizzo}</dd>
          <dt>Zona (la vedono tutti, al posto dell'indirizzo)</dt>
          <dd>{zonaNome}</dd>
        </dl>
      )}
      {error && <span role="alert" className="field-error">{error}</span>}
    </div>
  )
}
