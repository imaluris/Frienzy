// Campo testuale (non booleano) così si potranno aggiungere stati, es. 'inAttesa'.
export type ParticipationStatus = 'richiesta' | 'confermato' | 'rifiutato'

// Salvata in events/{eventId}/partecipanti/{uid}.
export interface Participation {
  eventId: string
  uid: string
  stato: ParticipationStatus
  creatoIl: Date
}
