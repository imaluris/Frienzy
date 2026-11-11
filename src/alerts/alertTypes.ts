// Un avviso mostrato nella schermata "Avvisi". Il tipo coincide col nome dell'interruttore delle notifiche
// (richieste, risposte, inviti): spegnere l'interruttore nasconde quegli avvisi.
export type AlertKind = 'richieste' | 'risposte' | 'inviti'

export interface AppAlert {
  /** Chiave stabile: serve a ricordare che l'avviso è già stato visto. */
  key: string
  kind: AlertKind
  eventId: string
  title: string
  body: string
  at: Date
}
