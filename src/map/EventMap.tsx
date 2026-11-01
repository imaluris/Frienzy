import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'
import type { LatLng } from '../events/geohashDecode'
import type { EventMarker } from './markers'
import { pinHtml } from './pinHtml'
import { centerOf, DEFAULT_ZOOM } from './viewport'

interface Props {
  markers: EventMarker[]
  selectedId: string | null
  me: LatLng | null // posizione dell'utente, se l'ha concessa
  onSelect: (eventId: string) => void
  onDeselect: () => void
  onTilesFailed: () => void
}

// Segnaposto a goccia con emoji; il selezionato è più grande (e sta sopra gli altri).
function pinIcon(marker: EventMarker, selected: boolean): L.DivIcon {
  return L.divIcon({ className: 'event-pin', html: pinHtml(marker, selected), iconSize: [44, 52], iconAnchor: [22, 50] })
}

// Gruppo di marker vicini: un cerchio col numero. Toccandolo la mappa si avvicina e li separa.
function clusterIcon(cluster: L.MarkerCluster): L.DivIcon {
  return L.divIcon({ className: 'cluster-marker', html: `<span>${cluster.getChildCount()}</span>`, iconSize: [44, 44] })
}

// Mappa Leaflet: la mappa (una volta sola), i marker (quando cambiano), quello selezionato e "tu".
export function EventMap({ markers, selectedId, me, onSelect, onDeselect, onTilesFailed }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.MarkerClusterGroup | null>(null)
  const meRef = useRef<L.CircleMarker | null>(null)
  const byId = useRef(new Map<string, { leaflet: L.Marker; data: EventMarker }>())
  const callbacks = useRef({ onSelect, onDeselect, onTilesFailed })
  const selectedRef = useRef(selectedId)

  useEffect(() => {
    callbacks.current = { onSelect, onDeselect, onTilesFailed }
  }, [onSelect, onDeselect, onTilesFailed])

  useEffect(() => {
    if (!container.current) return
    const map = L.map(container.current, { zoomControl: false }).setView(centerOf([]), DEFAULT_ZOOM)
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 19 })
    tiles.on('tileerror', () => callbacks.current.onTilesFailed()) // niente sfondo: i marker restano usabili
    tiles.addTo(map)
    map.on('click', () => callbacks.current.onDeselect())
    layerRef.current = L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 50, iconCreateFunction: clusterIcon }).addTo(map)
    mapRef.current = map
    const markersById = byId.current
    return () => {
      map.remove()
      mapRef.current = null
      layerRef.current = null
      meRef.current = null
      markersById.clear()
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer) return
    layer.clearLayers()
    byId.current.clear()
    for (const m of markers) {
      const leaflet = L.marker([m.lat, m.lng], { icon: pinIcon(m, m.eventId === selectedRef.current), title: m.title, keyboard: true })
      leaflet.on('click', () => callbacks.current.onSelect(m.eventId))
      leaflet.addTo(layer)
      byId.current.set(m.eventId, { leaflet, data: m })
    }
    if (markers.length > 1) map.fitBounds(L.latLngBounds(markers.map((m) => [m.lat, m.lng] as [number, number])), { padding: [64, 64], maxZoom: 15 })
    else map.setView(centerOf(markers), markers.length === 1 ? 14 : DEFAULT_ZOOM)
  }, [markers])

  // Cambia la selezione: il vecchio segnaposto torna normale, il nuovo si ingrandisce e la mappa lo porta in vista.
  useEffect(() => {
    const previous = selectedRef.current
    selectedRef.current = selectedId
    for (const id of [previous, selectedId]) {
      const item = id ? byId.current.get(id) : undefined
      if (item) {
        item.leaflet.setIcon(pinIcon(item.data, item.data.eventId === selectedId))
        item.leaflet.setZIndexOffset(item.data.eventId === selectedId ? 1000 : 0)
      }
    }
    const current = selectedId ? byId.current.get(selectedId) : undefined
    if (current) mapRef.current?.panTo(current.leaflet.getLatLng())
  }, [selectedId])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !me) return
    meRef.current?.remove()
    meRef.current = L.circleMarker([me.lat, me.lng], { radius: 9, color: '#fff', weight: 3, fillColor: '#2F5D50', fillOpacity: 1 }).addTo(map)
    map.setView([me.lat, me.lng], 14)
  }, [me])

  return <div ref={container} className="event-map" role="application" aria-label="Mappa degli eventi" />
}
