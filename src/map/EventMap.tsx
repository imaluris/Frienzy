import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'
import type { EventMarker } from './markers'
import { centerOf, DEFAULT_ZOOM } from './viewport'

interface Props {
  markers: EventMarker[]
  onSelect: (eventId: string) => void
}

// Disegna un marker come una pallina con l'emoji dentro.
function emojiIcon(emoji: string): L.DivIcon {
  return L.divIcon({ className: 'emoji-marker', html: `<span>${emoji}</span>`, iconSize: [36, 36] })
}

// Mappa Leaflet: la creo una volta sola, poi sincronizzo i marker quando cambiano.
export function EventMap({ markers, onSelect }: Props) {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!container.current) return
    const map = L.map(container.current).setView(centerOf(markers), DEFAULT_ZOOM)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map)
    for (const marker of markers) {
      L.marker([marker.lat, marker.lng], { icon: emojiIcon(marker.emoji), title: marker.title })
        .on('click', () => onSelect(marker.eventId))
        .addTo(map)
    }
    return () => {
      map.remove()
    }
  }, [markers, onSelect])

  return <div ref={container} className="event-map" role="application" aria-label="Mappa degli eventi" />
}
