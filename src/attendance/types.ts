// Presenza e voti. Documenti di primo livello (così si cercano per persona): presenze/{evento}_{uid}, valutazioni/{evento}_{uid}.
export type PresenceStatus = 'presente' | 'assente'

// Segnata dall'organizzatore, dopo l'evento, per un partecipante confermato.
export interface Presence {
  eventId: string
  uid: string
  organizzatoreId: string
  stato: PresenceStatus
  segnatoIl: Date
}

// Etichette fisse (le regole Firestore usano la stessa lista).
export const RATING_LABELS = ['Simpatico', 'Ben organizzato', 'Puntuale', 'Accogliente', 'Da migliorare'] as const
export type RatingLabel = (typeof RATING_LABELS)[number]

export interface NewRating {
  stelle: number
  /** Facoltativa: stringa vuota = nessuna etichetta. */
  etichetta: RatingLabel | ''
}

// Una sola valutazione per persona e per evento: `uid` è chi vota.
export interface Rating extends NewRating {
  eventId: string
  uid: string
  organizzatoreId: string
  creatoIl: Date
}

export const docId = (eventId: string, uid: string) => `${eventId}_${uid}`
