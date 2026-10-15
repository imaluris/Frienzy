import type { FrienzyEvent } from '../domain/event'

/** Eventi ancora da fare: data nel futuro e non annullati. */
export function isUpcoming(event: FrienzyEvent, now: Date): boolean {
  return event.stato !== 'annullato' && event.dataOra.getTime() > now.getTime()
}

/** Solo gli eventi futuri, dal più vicino al più lontano. Non modifica l'array ricevuto. */
export function upcomingEvents(events: FrienzyEvent[], now: Date = new Date()): FrienzyEvent[] {
  return events
    .filter((event) => isUpcoming(event, now))
    .sort((a, b) => a.dataOra.getTime() - b.dataOra.getTime())
}
