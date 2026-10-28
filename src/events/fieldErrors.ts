import {
  parseNumber,
  validateAddress,
  validateCoordinates,
  validateDateTime,
  validateDescription,
  validateMaxParticipants,
  validateTitle,
  validateType,
  validateZone,
  type EventInput,
} from './validation'

/** I campi del form che possono avere un errore. "punto" è il punto scelto sulla mappa. */
export type EventField =
  | 'tipo' | 'titolo' | 'descrizione' | 'dataOra' | 'zonaNome' | 'indirizzo' | 'punto' | 'maxPartecipanti'

export type EventFieldErrors = Partial<Record<EventField, string>>

export const POINT_MISSING = 'Tocca la mappa per scegliere dove si svolge l\'evento.'

function validatePoint(lat: string, lng: string): string | null {
  if (parseNumber(lat) === null && parseNumber(lng) === null) return POINT_MISSING
  return validateCoordinates(lat, lng)
}

/**
 * Tutti gli errori del form, uno per campo, così si possono mostrare accanto a ogni campo.
 * Usa le stesse regole di validateEvent. Oggetto vuoto = tutto a posto.
 */
export function validateEventFields(input: EventInput, now: Date = new Date()): EventFieldErrors {
  const found: Record<EventField, string | null> = {
    tipo: validateType(input.tipo),
    titolo: validateTitle(input.titolo),
    descrizione: validateDescription(input.descrizione),
    dataOra: validateDateTime(input.dataOra, now),
    zonaNome: validateZone(input.zonaNome),
    indirizzo: validateAddress(input.indirizzo),
    punto: validatePoint(input.lat, input.lng),
    maxPartecipanti: validateMaxParticipants(input.maxPartecipanti),
  }
  const errors: EventFieldErrors = {}
  for (const [field, message] of Object.entries(found)) {
    if (message) errors[field as EventField] = message
  }
  return errors
}
