// Il contrario di encodeGeohash: dal testo al centro della cella che rappresenta.

const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz'

export interface LatLng {
  lat: number
  lng: number
}

/** Centro della cella del geohash, oppure null se contiene caratteri non validi (o è vuoto). */
export function decodeGeohash(hash: string): LatLng | null {
  if (hash.length === 0) return null
  const latRange: [number, number] = [-90, 90]
  const lngRange: [number, number] = [-180, 180]
  let useLng = true
  for (const char of hash.toLowerCase()) {
    const value = BASE32.indexOf(char)
    if (value < 0) return null
    // Ogni carattere porta 5 bit, dal più importante: ognuno dimezza l'intervallo di lng o lat.
    for (let bit = 4; bit >= 0; bit -= 1) {
      const range = useLng ? lngRange : latRange
      const mid = (range[0] + range[1]) / 2
      if ((value >> bit) & 1) range[0] = mid
      else range[1] = mid
      useLng = !useLng
    }
  }
  return { lat: (latRange[0] + latRange[1]) / 2, lng: (lngRange[0] + lngRange[1]) / 2 }
}
