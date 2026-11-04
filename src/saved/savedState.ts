/** Aggiunge o toglie l'id dalla lista dei salvati (il più recente per primo). Non modifica l'array ricevuto. */
export function toggleId(ids: string[], eventId: string): string[] {
  return ids.includes(eventId) ? ids.filter((id) => id !== eventId) : [eventId, ...ids]
}
