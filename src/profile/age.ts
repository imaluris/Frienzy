// Età e maggiore età. La data di nascita si salva, l'età si calcola ogni volta.

export const MIN_AGE = 18

/** Trasforma "2000-05-31" (come lo dà <input type="date">) in una Date, oppure null se non esiste davvero. */
export function parseBirthDate(text: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null
  // Uso UTC ovunque: il fuso orario del telefono non deve spostare il compleanno di un giorno.
  const date = new Date(`${text}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return null
  // "2001-02-31" diventa 3 marzo: se la data riletta è diversa, il giorno non esisteva.
  return date.toISOString().slice(0, 10) === text ? date : null
}

/** Anni compiuti alla data `today`. */
export function calculateAge(birth: Date, today: Date = new Date()): number {
  let age = today.getUTCFullYear() - birth.getUTCFullYear()
  const monthDiff = today.getUTCMonth() - birth.getUTCMonth()
  const birthdayNotYet = monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < birth.getUTCDate())
  if (birthdayNotYet) age -= 1
  return age
}

export function isAdult(birth: Date, today: Date = new Date()): boolean {
  return calculateAge(birth, today) >= MIN_AGE
}
