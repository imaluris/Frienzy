import type { FrienzyEvent } from '../domain/event'
import { decideView } from './participationView'

const event: FrienzyEvent = {
  id: 'e', organizzatoreId: 'org', tipo: 'cena', titolo: 'T', descrizione: '', dataOra: new Date(), zonaNome: 'Z',
  latApprossimata: 0, lngApprossimata: 0, geohash: 'u0nd8k', maxPartecipanti: 2, richiedeApprovazione: false,
  stato: 'aperto', creatoIl: new Date(),
}
const mine = (stato: 'richiesta' | 'confermato' | 'rifiutato') => ({ eventId: 'e', uid: 'me', stato, creatoIl: new Date() })

describe('decideView', () => {
  it("l'organizzatore vede il suo pannello", () => {
    expect(decideView({ event, uid: 'org', mine: null, confirmedCount: 0 })).toBe('organizzatore')
  })
  it('evento libero: partecipa; pieno: pieno', () => {
    expect(decideView({ event, uid: 'me', mine: null, confirmedCount: 1 })).toBe('partecipa')
    expect(decideView({ event, uid: 'me', mine: null, confirmedCount: 2 })).toBe('pieno')
  })
  it('con approvazione: chiedi, anche se i posti sono presi (la richiesta non occupa posti)', () => {
    expect(decideView({ event: { ...event, richiedeApprovazione: true }, uid: 'me', mine: null, confirmedCount: 2 })).toBe('chiedi')
  })
  it('la propria iscrizione ha la precedenza', () => {
    expect(decideView({ event, uid: 'me', mine: mine('confermato'), confirmedCount: 2 })).toBe('confermato')
    expect(decideView({ event, uid: 'me', mine: mine('richiesta'), confirmedCount: 0 })).toBe('richiesta')
    expect(decideView({ event, uid: 'me', mine: mine('rifiutato'), confirmedCount: 0 })).toBe('rifiutato')
  })
  it('evento annullato o chiuso', () => {
    expect(decideView({ event: { ...event, stato: 'annullato' }, uid: 'me', mine: null, confirmedCount: 0 })).toBe('annullato')
    expect(decideView({ event: { ...event, stato: 'chiuso' }, uid: 'me', mine: null, confirmedCount: 0 })).toBe('chiuso')
  })
})
