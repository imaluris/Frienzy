/** Data e ora in italiano, es. "sabato 20 ottobre, 19:30". Il fuso si può fissare (per i test). */
export function formatEventDate(date: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  }).format(date)
}

/** Frase sui posti, es. "Massimo 8 persone". */
export function describeCapacity(max: number): string {
  return max === 1 ? 'Massimo 1 persona' : `Massimo ${max} persone`
}
