import type { EventMarker } from './markers'

/** Milano: vista iniziale quando non ci sono eventi da mostrare. */
export const DEFAULT_CENTER: [number, number] = [45.4642, 9.19]
export const DEFAULT_ZOOM = 12

/** Centro della mappa: la media dei marker, oppure il centro predefinito. */
export function centerOf(markers: EventMarker[]): [number, number] {
  if (markers.length === 0) return DEFAULT_CENTER
  const lat = markers.reduce((sum, m) => sum + m.lat, 0) / markers.length
  const lng = markers.reduce((sum, m) => sum + m.lng, 0) / markers.length
  return [lat, lng]
}
