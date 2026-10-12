import { isEventTypeId } from '../domain/eventTypes'
import { calculateAge, MIN_AGE, parseBirthDate } from './age'

// Controlli sul profilo. Ognuno restituisce un messaggio d'errore oppure null.

export const NAME_MIN = 2
export const NAME_MAX = 50
export const BIO_MAX = 300
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024
const MAX_AGE = 120

export interface ProfileInput {
  nome: string
  dataNascita: string
  bio: string
  interessi: string[]
  fotoUrl: string
}

export function validateName(name: string): string | null {
  const length = name.trim().length
  if (length < NAME_MIN) return `Il nome deve avere almeno ${NAME_MIN} caratteri.`
  return length > NAME_MAX ? `Il nome può avere al massimo ${NAME_MAX} caratteri.` : null
}

export function validateBirthDate(text: string, today: Date = new Date()): string | null {
  const birth = parseBirthDate(text)
  if (!birth) return 'Inserisci una data di nascita valida.'
  const age = calculateAge(birth, today)
  if (age < 0 || age > MAX_AGE) return 'Inserisci una data di nascita valida.'
  return age < MIN_AGE ? `Frienzy è riservata a chi ha almeno ${MIN_AGE} anni.` : null
}

export function validateBio(bio: string): string | null {
  return bio.length > BIO_MAX ? `La bio può avere al massimo ${BIO_MAX} caratteri.` : null
}

export function validateInterests(interests: string[]): string | null {
  return interests.every(isEventTypeId) ? null : 'Uno degli interessi scelti non è valido.'
}

/** La foto è facoltativa; se c'è deve essere un indirizzo https. */
export function validatePhotoUrl(url: string): string | null {
  return url === '' || /^https:\/\/\S+$/.test(url) ? null : 'L\'indirizzo della foto non è valido.'
}

/** Controlla il file scelto prima di caricarlo. */
export function validatePhotoFile(file: { type: string; size: number }): string | null {
  if (!file.type.startsWith('image/')) return 'Il file scelto non è un\'immagine.'
  return file.size > PHOTO_MAX_BYTES ? 'La foto pesa troppo (massimo 5 MB).' : null
}

export function validateProfile(input: ProfileInput, today: Date = new Date()): string | null {
  return (
    validateName(input.nome) ??
    validateBirthDate(input.dataNascita, today) ??
    validateBio(input.bio) ??
    validateInterests(input.interessi) ??
    validatePhotoUrl(input.fotoUrl)
  )
}
