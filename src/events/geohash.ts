// Geohash: trasforma una coppia (latitudine, longitudine) in una breve stringa.
// Punti vicini hanno stringhe che iniziano allo stesso modo: servirà per i filtri (task 14).

const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz'

/** Calcola il geohash di un punto con `precision` caratteri (6 caratteri ≈ 1 km). */
export function encodeGeohash(lat: number, lng: number, precision = 6): string {
  const latRange: [number, number] = [-90, 90]
  const lngRange: [number, number] = [-180, 180]
  let hash = ''
  let bits = 0
  let index = 0
  let useLng = true // si alternano: un bit di longitudine, uno di latitudine
  while (hash.length < precision) {
    const range = useLng ? lngRange : latRange
    const value = useLng ? lng : lat
    const mid = (range[0] + range[1]) / 2
    index <<= 1
    if (value >= mid) {
      index |= 1
      range[0] = mid
    } else {
      range[1] = mid
    }
    useLng = !useLng
    bits += 1
    if (bits === 5) {
      hash += BASE32[index]
      bits = 0
      index = 0
    }
  }
  return hash
}
