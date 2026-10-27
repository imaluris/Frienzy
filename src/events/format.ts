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

/** Data breve per le schede, es. "sab 31 ott · 19:30". */
export function formatShortDate(date: Date, timeZone?: string): string {
  const opts = { timeZone } as const
  const day = new Intl.DateTimeFormat('it-IT', { weekday: 'short', day: 'numeric', month: 'short', ...opts }).format(date)
  const time = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit', ...opts }).format(date)
  return `${day.replace(/\./g, '')} · ${time}`
}

/** Posti in forma breve per le schede, es. "Fino a 8 persone". */
export function describePlacesShort(max: number): string {
  return max === 1 ? 'Fino a 1 persona' : `Fino a ${max} persone`
}
