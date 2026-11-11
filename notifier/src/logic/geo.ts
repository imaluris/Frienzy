// Geohash e distanze. È una copia ridotta di src/events/geohashDecode.ts dell'app: la cartella functions
// è un pacchetto a parte e non può importare dal codice dell'app.
const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz'

export interface Point {
  lat: number
  lng: number
}

/** Centro della cella del geohash, oppure null se vuoto o con caratteri non validi. */
export function decodeGeohash(hash: string): Point | null {
  if (!hash) return null
  const lat: [number, number] = [-90, 90]
  const lng: [number, number] = [-180, 180]
  let useLng = true
  for (const char of hash.toLowerCase()) {
    const value = BASE32.indexOf(char)
    if (value < 0) return null
    for (let bit = 4; bit >= 0; bit -= 1) {
      const range = useLng ? lng : lat
      const mid = (range[0] + range[1]) / 2
      if ((value >> bit) & 1) range[0] = mid
      else range[1] = mid
      useLng = !useLng
    }
  }
  return { lat: (lat[0] + lat[1]) / 2, lng: (lng[0] + lng[1]) / 2 }
}

/** Distanza in km tra due punti (formula dell'emisenoverso). */
export function distanceKm(a: Point, b: Point): number {
  const rad = (d: number) => (d * Math.PI) / 180
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}

/** Distanza tra due geohash (centro delle celle), oppure null se uno è illeggibile. */
export function geohashDistanceKm(a: string, b: string): number | null {
  const pa = decodeGeohash(a)
  const pb = decodeGeohash(b)
  return pa && pb ? distanceKm(pa, pb) : null
}
