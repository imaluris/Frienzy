// Un luogo scelto dall'utente: punto sulla mappa + indirizzo esatto + zona (quella che vedono tutti).
export interface Place {
  lat: number
  lng: number
  address: string // indirizzo esatto: lo vedono solo l'organizzatore e i confermati
  zone: string // zona approssimata (quartiere o città): la vedono tutti
}

/** Come risponde Nominatim (OpenStreetMap): solo i campi che usiamo. */
export interface NominatimItem {
  lat?: string
  lon?: string
  display_name?: string
  address?: Record<string, string | undefined>
}

const MAX_ZONE = 100
const MAX_ADDRESS = 200

const first = (a: Record<string, string | undefined>, keys: string[]) => keys.map((k) => a[k]).find((v) => v && v.trim()) ?? ''

/** Trasforma una risposta di Nominatim in un Place, oppure null se manca il punto o non c'è un indirizzo utile. */
export function placeFromNominatim(item: NominatimItem, point?: { lat: number; lng: number }): Place | null {
  const lat = point?.lat ?? Number(item.lat)
  const lng = point?.lng ?? Number(item.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  const a = item.address ?? {}
  const street = first(a, ['road', 'pedestrian', 'footway', 'path', 'square'])
  const locality = first(a, ['city', 'town', 'village', 'municipality', 'hamlet'])
  const number = street ? first(a, ['house_number']) : ''
  const streetLine = [street, number].filter(Boolean).join(' ')
  const address = [streetLine, locality].filter(Boolean).join(', ') || (item.display_name ?? '').split(',').slice(0, 2).join(',').trim()
  if (!address) return null
  const zone = first(a, ['suburb', 'neighbourhood', 'quarter', 'city_district']) || locality || address
  return { lat, lng, address: address.slice(0, MAX_ADDRESS), zone: zone.slice(0, MAX_ZONE) }
}
