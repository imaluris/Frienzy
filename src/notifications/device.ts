import { encodeGeohash } from '../events/geohash'
import type { LatLng } from '../events/geohashDecode'
import { DEVICE_ZONE_PRECISION, type DeviceInfo } from './prefs'

/**
 * Cosa salvare del dispositivo. Senza token non c'è nulla da salvare (null).
 * La zona (cella di ~5 km) si salva solo se gli inviti sono accesi e la posizione è nota: altrimenti vuota.
 */
export function buildDevice(token: string, point: LatLng | null, invitiOn: boolean): DeviceInfo | null {
  if (!token) return null
  const zona = invitiOn && point ? encodeGeohash(point.lat, point.lng, DEVICE_ZONE_PRECISION) : ''
  return { token, zona }
}
