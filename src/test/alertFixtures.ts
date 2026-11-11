import type { FrienzyEvent } from '../domain/event'

// Evento di prova con valori sensati; i test cambiano solo ciò che conta.
export const NOW = new Date('2030-05-10T10:00:00Z')
const HOUR = 3_600_000

export const makeEvent = (over: Partial<FrienzyEvent> = {}): FrienzyEvent => ({
  id: 'e1', organizzatoreId: 'org', tipo: 'aperitivo', titolo: 'Aperitivo ai Navigli', descrizione: '',
  dataOra: new Date(NOW.getTime() + 30 * HOUR), zonaNome: 'Navigli', latApprossimata: 45.45, lngApprossimata: 9.17,
  geohash: 'u0nd9h', maxPartecipanti: 8, richiedeApprovazione: false, stato: 'aperto',
  creatoIl: new Date(NOW.getTime() - 2 * HOUR), ...over,
})
