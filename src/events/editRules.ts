import type { EventChange, FrienzyEvent } from '../domain/event'
import { validateDateTime, validateDescription, validateMaxParticipants, validateTitle, parseDateTime, parseNumber } from './validation'

// Regole della modifica di un evento (funzioni pure, nessun accesso ai dati).

/** Valori com'escono dal form di modifica: tutto testo. */
export interface EditInput {
  titolo: string
  descrizione: string
  dataOra: string // "2026-10-20T19:30"
  maxPartecipanti: string
}

/** Si modifica finché l'evento è aperto e non è già iniziato. */
export function canEdit(event: FrienzyEvent, actorUid: string, now: Date): { ok: true } | { ok: false; motivo: string } {
  if (event.organizzatoreId !== actorUid) return { ok: false, motivo: "Solo l'organizzatore può modificare l'evento" }
  if (event.stato === 'annullato') return { ok: false, motivo: 'Un evento annullato non si modifica' }
  if (event.dataOra.getTime() <= now.getTime()) return { ok: false, motivo: "L'evento è già iniziato: non si può più modificare" }
  return { ok: true }
}

/** Primo errore del form di modifica, oppure null. I posti non possono scendere sotto i confermati. */
export function validateEdit(input: EditInput, confirmedCount: number, now: Date): string | null {
  const value = parseNumber(input.maxPartecipanti)
  const seats =
    validateMaxParticipants(input.maxPartecipanti) ??
    (value !== null && value < confirmedCount ? `Ci sono già ${confirmedCount} persone confermate: i posti non possono essere meno.` : null)
  return validateTitle(input.titolo) ?? validateDescription(input.descrizione) ?? validateDateTime(input.dataOra, now) ?? seats
}

/** Cosa cambia davvero rispetto all'evento attuale: i campi nuovi e la lista dei campi toccati. */
export function diffEdit(event: FrienzyEvent, input: EditInput): { values: Partial<Pick<FrienzyEvent, 'titolo' | 'descrizione' | 'dataOra' | 'maxPartecipanti'>>; changed: EventChange[] } {
  const values: ReturnType<typeof diffEdit>['values'] = {}
  const changed: EventChange[] = []
  const titolo = input.titolo.trim()
  const descrizione = input.descrizione.trim()
  const dataOra = parseDateTime(input.dataOra)
  const max = parseNumber(input.maxPartecipanti)
  if (titolo !== event.titolo) { values.titolo = titolo; changed.push('titolo') }
  if (descrizione !== event.descrizione) { values.descrizione = descrizione; changed.push('descrizione') }
  // Il campo data ha la precisione del minuto: si confronta a quella, altrimenti secondi e millisecondi dell'evento risulterebbero "modificati".
  if (dataOra && input.dataOra !== toInputValue(event.dataOra)) { values.dataOra = dataOra; changed.push('dataOra') }
  if (max !== null && max !== event.maxPartecipanti) { values.maxPartecipanti = max; changed.push('maxPartecipanti') }
  return { values, changed }
}

const LABELS: Record<EventChange, string> = { titolo: 'il titolo', descrizione: 'la descrizione', dataOra: 'data e ora', maxPartecipanti: 'i posti' }

/** "data e ora", "il titolo e la descrizione", "il titolo, data e ora e i posti". */
export function describeChanges(changes: readonly EventChange[]): string {
  const names = changes.map((c) => LABELS[c])
  if (names.length <= 1) return names[0] ?? ''
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`
}

/** Data come la vuole <input type="datetime-local">, in ora locale. */
export function toInputValue(date: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}`
}
