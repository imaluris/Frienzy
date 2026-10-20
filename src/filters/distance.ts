import { decodeGeohash, type LatLng } from '../events/geohashDecode'

const EARTH_RADIUS_KM = 6371

const toRadians = (degrees: number) => (degrees * Math.PI) / 180

/** Distanza in km lungo la superficie terrestre (formula dell'haversine). */
export function distanceKm(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

/** Distanza tra un punto e il centro di un geohash; null se il geohash non è valido. */
export function distanceToGeohashKm(point: LatLng, geohash: string): number | null {
  const center = decodeGeohash(geohash)
  return center ? distanceKm(point, center) : null
}
