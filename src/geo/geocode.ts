import { placeFromNominatim, type NominatimItem, type Place } from './place'

// Ricerca di indirizzi con Nominatim (OpenStreetMap): gratuito, senza chiave.
// Regole d'uso: al massimo una richiesta al secondo, mai a ogni tasto premuto (qui si cerca solo al tocco di "Cerca").
const BASE = 'https://nominatim.openstreetmap.org'
const COMMON = 'format=jsonv2&addressdetails=1&accept-language=it'

type Fetch = (url: string) => Promise<{ ok: boolean; json: () => Promise<unknown> }>

/** Cerca un indirizzo (solo Italia). Elenco vuoto se non trova niente; lancia un errore se la rete non risponde. */
export async function searchPlaces(query: string, fetchFn: Fetch = (u) => fetch(u)): Promise<Place[]> {
  const text = query.trim()
  if (text.length < 3) return []
  const res = await fetchFn(`${BASE}/search?${COMMON}&limit=5&countrycodes=it&q=${encodeURIComponent(text)}`)
  if (!res.ok) throw new Error('geocoding')
  const items = (await res.json()) as NominatimItem[]
  return items.flatMap((item) => placeFromNominatim(item) ?? [])
}

/** Indirizzo del punto toccato sulla mappa. Null se lì non c'è un indirizzo; lancia un errore se la rete non risponde. */
export async function reversePlace(point: { lat: number; lng: number }, fetchFn: Fetch = (u) => fetch(u)): Promise<Place | null> {
  const res = await fetchFn(`${BASE}/reverse?${COMMON}&zoom=18&lat=${point.lat}&lon=${point.lng}`)
  if (!res.ok) throw new Error('geocoding')
  return placeFromNominatim((await res.json()) as NominatimItem, point)
}
