import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'
import { pinHtml } from './pinHtml'
import { DEFAULT_CENTER, DEFAULT_ZOOM } from './viewport'

export interface Point {
  lat: number
  lng: number
}

interface Props {
  value: Point | null
  center?: Point | null // dove aprire la mappa se non c'è ancora un punto (per esempio la posizione dell'utente)
  emoji: string
  color: string
  onPick: (point: Point) => void
}

// Segnaposto del punto scelto: stesso stile dei marker della mappa.
function pinIcon(emoji: string, color: string): L.DivIcon {
  return L.divIcon({ className: 'event-pin', html: pinHtml({ emoji, color }, true), iconSize: [44, 52], iconAnchor: [22, 50] })
}

// Mappa in cui si tocca per scegliere il punto dell'evento.
// La mappa nasce una volta sola; il segnaposto si sposta quando cambia il valore.
export function PointPicker({ value, center, emoji, color, onPick }: Props) {
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
    if (value) pinRef.current = L.marker([value.lat, value.lng], { icon: pinIcon(emoji, color), interactive: false }).addTo(map)
  }, [value, emoji, color])

  // La mappa va dove serve: sul punto scelto, altrimenti sulla posizione dell'utente (mai su Milano se la conosciamo).
  const target = value ?? center ?? null
  const targetLat = target?.lat
  const targetLng = target?.lng
  useEffect(() => {
    if (targetLat === undefined || targetLng === undefined) return
    mapRef.current?.setView([targetLat, targetLng], Math.max(mapRef.current.getZoom(), 16))
  }, [targetLat, targetLng])

  return <div ref={container} className="point-picker" role="application" aria-label="Mappa per scegliere il punto dell'evento" />
}
