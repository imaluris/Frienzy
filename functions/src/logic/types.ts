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

/** Chi può essere avvisato: preferenze e dispositivo letti da users/{uid}/notifiche. */
export interface Contact {
  uid: string
  prefs: PrefsLite
  device: DeviceLite
}
