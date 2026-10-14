import { isEventTypeId } from '../domain/eventTypes'

// Controlli sul form "crea evento". Gli stessi limiti delle regole di sicurezza (firestore.rules).
// Ogni funzione restituisce un messaggio d'errore oppure null.

export const TITLE_MIN = 3
export const TITLE_MAX = 100
export const DESCRIPTION_MAX = 1000
export const ZONE_MAX = 100
export const ADDRESS_MAX = 200
export const MAX_PARTICIPANTS_LIMIT = 200

/** Valori com'escono dal form: tutto testo, tranne l'interruttore. */
export interface EventInput {
  tipo: string
  titolo: string
  descrizione: string
  dataOra: string // "2026-10-20T19:30" come lo dà <input type="datetime-local">
  zonaNome: string
  indirizzo: string
  lat: string
  lng: string
  maxPartecipanti: string
  richiedeApprovazione: boolean
}

/** Trasforma il testo del form in una Date (ora locale), oppure null se non è una data vera. */
export function parseDateTime(text: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(text)) return null
  const date = new Date(text)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Trasforma un testo in numero; accetta la virgola decimale. Null se non è un numero. */
export function parseNumber(text: string): number | null {
  const clean = text.trim().replace(',', '.')
  if (clean === '') return null
  const value = Number(clean)
  return Number.isFinite(value) ? value : null
}

export function validateType(tipo: string): string | null {
  return isEventTypeId(tipo) ? null : 'Scegli il tipo di evento.'
}

export function validateTitle(title: string): string | null {
  const length = title.trim().length
  if (length < TITLE_MIN) return `Il titolo deve avere almeno ${TITLE_MIN} caratteri.`
  return length > TITLE_MAX ? `Il titolo può avere al massimo ${TITLE_MAX} caratteri.` : null
}

export function validateDescription(text: string): string | null {
  return text.trim().length > DESCRIPTION_MAX
    ? `La descrizione può avere al massimo ${DESCRIPTION_MAX} caratteri.`
    : null
}

export function validateDateTime(text: string, now: Date = new Date()): string | null {
  const date = parseDateTime(text)
  if (!date) return 'Inserisci data e ora dell\'evento.'
  return date.getTime() > now.getTime() ? null : 'La data dell\'evento deve essere nel futuro.'
}

export function validateZone(zone: string): string | null {
  const length = zone.trim().length
  if (length === 0) return 'Scrivi la zona (ad esempio il quartiere).'
  return length > ZONE_MAX ? `La zona può avere al massimo ${ZONE_MAX} caratteri.` : null
}

export function validateAddress(address: string): string | null {
  const length = address.trim().length
  if (length === 0) return 'Scrivi l\'indirizzo esatto.'
  return length > ADDRESS_MAX ? `L'indirizzo può avere al massimo ${ADDRESS_MAX} caratteri.` : null
}

export function validateCoordinates(lat: string, lng: string): string | null {
  const la = parseNumber(lat)
  const ln = parseNumber(lng)
  if (la === null || ln === null) return 'Inserisci latitudine e longitudine come numeri.'
  if (la < -90 || la > 90) return 'La latitudine deve stare tra -90 e 90.'
  return ln < -180 || ln > 180 ? 'La longitudine deve stare tra -180 e 180.' : null
}

export function validateMaxParticipants(text: string): string | null {
  const value = parseNumber(text)
  if (value === null || !Number.isInteger(value)) return 'Il massimo di partecipanti deve essere un numero intero.'
  return value < 1 || value > MAX_PARTICIPANTS_LIMIT
    ? `Il massimo di partecipanti deve stare tra 1 e ${MAX_PARTICIPANTS_LIMIT}.`
    : null
}

/** Primo errore trovato nel form, oppure null se va tutto bene. */
export function validateEvent(input: EventInput, now: Date = new Date()): string | null {
  return (
    validateType(input.tipo) ??
    validateTitle(input.titolo) ??
    validateDescription(input.descrizione) ??
    validateDateTime(input.dataOra, now) ??
    validateZone(input.zonaNome) ??
    validateAddress(input.indirizzo) ??
    validateCoordinates(input.lat, input.lng) ??
    validateMaxParticipants(input.maxPartecipanti)
  )
}
