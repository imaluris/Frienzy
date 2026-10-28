import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'
import type { LatLng } from '../events/geohashDecode'
import type { EventMarker } from './markers'
import { buildPopup } from './popup'
import { centerOf, DEFAULT_ZOOM } from './viewport'

interface Props {
  markers: EventMarker[]
  me: LatLng | null // posizione dell'utente, se l'ha concessa
  onSelect: (eventId: string) => void
  onTilesFailed: () => void
}

// Marker: pallina con l'emoji, grande abbastanza da toccare col dito.
function emojiIcon(emoji: string): L.DivIcon {
  return L.divIcon({ className: 'emoji-marker', html: `<span>${emoji}</span>`, iconSize: [44, 44], iconAnchor: [22, 22], popupAnchor: [0, -24] })
}

// Mappa Leaflet in tre pezzi: la mappa (una volta sola), i marker (quando cambiano) e "tu" (quando arriva la posizione).
export function EventMap({ markers, me, onSelect, onTilesFailed }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)
  const meRef = useRef<L.CircleMarker | null>(null)
  const failRef = useRef(onTilesFailed)

  useEffect(() => {
    failRef.current = onTilesFailed
  }, [onTilesFailed])

  useEffect(() => {
    if (!container.current) return
    const map = L.map(container.current).setView(centerOf([]), DEFAULT_ZOOM)
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 19 })
    tiles.on('tileerror', () => failRef.current()) // niente sfondo: i marker restano usabili
    tiles.addTo(map)
    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
      layerRef.current = null
      meRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer) return
    layer.clearLayers()
    for (const m of markers) {
      L.marker([m.lat, m.lng], { icon: emojiIcon(m.emoji), title: m.title })
        .bindPopup(buildPopup(m, onSelect))
        .addTo(layer)
    }
    if (markers.length > 1) map.fitBounds(L.latLngBounds(markers.map((m) => [m.lat, m.lng] as [number, number])), { padding: [64, 64], maxZoom: 15 })
    else map.setView(centerOf(markers), markers.length === 1 ? 14 : DEFAULT_ZOOM)
  }, [markers, onSelect])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !me) return
    meRef.current?.remove()
    meRef.current = L.circleMarker([me.lat, me.lng], { radius: 9, color: '#fff', weight: 3, fillColor: '#2F5D50', fillOpacity: 1 }).addTo(map)
    map.setView([me.lat, me.lng], 14)
  }, [me])

  return <div ref={container} className="event-map" role="application" aria-label="Mappa degli eventi" />
}
