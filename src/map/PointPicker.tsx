import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'
import { DEFAULT_CENTER, DEFAULT_ZOOM } from './viewport'

export interface Point {
  lat: number
  lng: number
}

interface Props {
  value: Point | null
  emoji: string
  onPick: (point: Point) => void
}

// Segnaposto del punto scelto: stesso stile dei marker della mappa.
function pinIcon(emoji: string): L.DivIcon {
  return L.divIcon({ className: 'emoji-marker', html: `<span>${emoji}</span>`, iconSize: [36, 36] })
}

// Mappa in cui si tocca per scegliere il punto dell'evento.
// La mappa nasce una volta sola; il segnaposto si sposta quando cambia il valore.
export function PointPicker({ value, emoji, onPick }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const pinRef = useRef<L.Marker | null>(null)
  const onPickRef = useRef(onPick)

  useEffect(() => {
    onPickRef.current = onPick
  }, [onPick])

  useEffect(() => {
    if (!container.current) return
    const map = L.map(container.current).setView(DEFAULT_CENTER, DEFAULT_ZOOM)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map)
    map.on('click', (e: L.LeafletMouseEvent) => onPickRef.current({ lat: e.latlng.lat, lng: e.latlng.lng }))
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
      pinRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    pinRef.current?.remove()
    pinRef.current = null
    if (value) pinRef.current = L.marker([value.lat, value.lng], { icon: pinIcon(emoji), interactive: false }).addTo(map)
  }, [value, emoji])

  return <div ref={container} className="point-picker" role="application" aria-label="Mappa per scegliere il punto dell'evento" />
}
