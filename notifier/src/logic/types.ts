// Tipi minimi usati dalla logica pura: solo i campi che servono, così i test restano piccoli.
export interface EventLite {
  id: string
  titolo: string
  tipo: string
  dataOra: Date
  zonaNome: string
  organizzatoreId: string
  geohash: string
  stato: string
  richiedeApprovazione: boolean
  creatoIl: Date
}

/** Iscrizione a un evento: chi e in che stato. */
export interface PartLite {
  uid: string
  stato: string
}

/** Un blocco: `blockerId` ha bloccato `blockedId`. */
export interface BlockLite {
  blockerId: string
  blockedId: string
}

export interface PrefsLite {
  promemoria?: boolean
  richieste?: boolean
  risposte?: boolean
  inviti?: boolean
}

export type PrefName = keyof PrefsLite

export interface DeviceLite {
  token?: string
  zona?: string
}

/** Chi può essere avvisato: preferenze (users/{uid}/notifiche/preferenze) e dispositivo (dispositivi/{uid}). */
export interface Contact {
  uid: string
  prefs: PrefsLite
  device: DeviceLite
}
