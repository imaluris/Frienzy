import { validateEventFields, type EventField, type EventFieldErrors } from '../events/fieldErrors'
import type { EventInput } from '../events/validation'

// I passi per creare un evento, nell'ordine. Ognuno controlla solo i propri campi.
export const CREATE_STEPS = ['tipo', 'testo', 'quando', 'dove', 'posti', 'riepilogo'] as const
export type CreateStep = (typeof CREATE_STEPS)[number]

export const STEP_TITLE: Record<CreateStep, string> = {
  tipo: 'Che tipo di uscita è?',
  testo: 'Come la chiami?',
  quando: 'Quando ci si trova?',
  dove: 'Dove ci si trova?',
  posti: 'Quanti posti ci sono?',
  riepilogo: 'Tutto pronto?',
}

const FIELDS: Record<CreateStep, EventField[]> = {
  tipo: ['tipo'],
  testo: ['titolo', 'descrizione'],
  quando: ['dataOra'],
  dove: ['punto', 'zonaNome', 'indirizzo'],
  posti: ['maxPartecipanti'],
  riepilogo: [],
}

export const createStepNumber = (step: CreateStep): number => CREATE_STEPS.indexOf(step) + 1
export const nextCreateStep = (step: CreateStep): CreateStep | null => CREATE_STEPS[CREATE_STEPS.indexOf(step) + 1] ?? null
export const previousCreateStep = (step: CreateStep): CreateStep | null => CREATE_STEPS[CREATE_STEPS.indexOf(step) - 1] ?? null

/** Errori dei soli campi di questo passo. Oggetto vuoto = si può andare avanti. */
export function stepErrors(step: CreateStep, input: EventInput, now: Date = new Date()): EventFieldErrors {
  const all = validateEventFields(input, now)
  const errors: EventFieldErrors = {}
  for (const field of FIELDS[step]) if (all[field]) errors[field] = all[field]
  return errors
}

/** Il primo passo che ha ancora errori (per tornare indietro se qualcosa non torna al riepilogo), oppure null. */
export function firstInvalidStep(input: EventInput, now: Date = new Date()): CreateStep | null {
  return CREATE_STEPS.find((step) => Object.keys(stepErrors(step, input, now)).length > 0) ?? null
}

/** Cambia il numero di posti di un gradino (+1/-1), restando tra 1 e il massimo; testo non valido riparte da 10. */
export function bumpSeats(text: string, delta: 1 | -1, max: number): string {
  const current = Number.parseInt(text, 10)
  const base = Number.isFinite(current) ? current : 10
  return String(Math.min(max, Math.max(1, base + delta)))
}
