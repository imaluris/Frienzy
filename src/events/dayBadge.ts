import { daysFromToday } from './periods'

/** Giorno grande e mese piccolo per il badge a calendario, es. { day: "31", month: "OTT" }. */
export function dayBadge(date: Date): { day: string; month: string } {
  return {
    day: String(date.getDate()),
    month: new Intl.DateTimeFormat('it-IT', { month: 'short' }).format(date).replace('.', '').toLocaleUpperCase('it-IT'),
  }
}

/** Etichetta del giorno: "Oggi", "Domani" oppure "sab 31 ott", più l'ora. Es. "Domani · 19:30". */
export function friendlyWhen(date: Date, now: Date = new Date()): string {
  const days = daysFromToday(date, now)
  const time = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' }).format(date)
  const day =
    days <= 0 ? 'Oggi' : days === 1 ? 'Domani' : new Intl.DateTimeFormat('it-IT', { weekday: 'short', day: 'numeric', month: 'short' }).format(date).replace(/\./g, '')
  return `${day} · ${time}`
}
