// Campo testuale (non booleano) così si possono aggiungere stati. 'inAttesa' = lista d'attesa di un evento pieno.
export type ParticipationStatus = 'richiesta' | 'confermato' | 'rifiutato' | 'inAttesa'

// Salvata in events/{eventId}/partecipanti/{uid}.
export interface Participation {
  eventId: string
  uid: string
  stato: ParticipationStatus
  creatoIl: Date
}
