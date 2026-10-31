import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'

const RADIUS_METERS = 400
const ZOOM = 14

// Mappa piccola e ferma della zona: un cerchio attorno alla posizione APPROSSIMATA (mai il punto esatto).
// Se le tessere non si caricano resta lo sfondo disegnato in CSS: la zona si capisce comunque dal cerchio.
export function EventAreaMap({ lat, lng }: { lat: number; lng: number }) {
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!box.current) return
    const map = L.map(box.current, {
      zoomControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false,
      touchZoom: false, boxZoom: false, keyboard: false, attributionControl: false,
    }).setView([lat, lng], ZOOM)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)
    L.circle([lat, lng], { radius: RADIUS_METERS, color: '#2F5D50', weight: 2, fillColor: '#E2725B', fillOpacity: 0.25 }).addTo(map)
    L.circleMarker([lat, lng], { radius: 5, color: '#fff', weight: 2, fillColor: '#2F5D50', fillOpacity: 1 }).addTo(map)
    return () => {
      map.remove()
    }
  }, [lat, lng])
  return (
    <section className="detail-section" aria-label="Zona sulla mappa">
      <h3>Dove</h3>
      <div className="area-map">
        <div ref={box} className="area-map-canvas" role="img" aria-label="Mappa della zona, posizione approssimativa" />
        <span className="area-map-credit">© OpenStreetMap</span>
      </div>
      <p className="area-map-note"><small>Posizione approssimativa. L'indirizzo preciso lo vedono l'organizzatore e chi è confermato.</small></p>
    </section>
  )
}
