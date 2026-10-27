import type { FrienzyEvent } from '../domain/event'
import { eventBadges } from './badges'
import { describePlacesShort, formatShortDate } from './format'

const base: FrienzyEvent = {
  id: 'e1', organizzatoreId: 'o', tipo: 'cena', titolo: 'T', descrizione: '', dataOra: new Date(),
  zonaNome: 'Z', latApprossimata: 0, lngApprossimata: 0, geohash: 'u', maxPartecipanti: 4,
  richiedeApprovazione: false, stato: 'aperto', creatoIl: new Date(),
}

describe('badge degli eventi', () => {
  it('evento libero', () => expect(eventBadges(base)).toEqual([{ label: 'Accesso libero', tone: 'neutral' }]))
  it('evento con approvazione', () =>
    expect(eventBadges({ ...base, richiedeApprovazione: true })).toEqual([{ label: 'Su approvazione', tone: 'accent' }]))
  it('annullato ha la precedenza', () =>
    expect(eventBadges({ ...base, richiedeApprovazione: true, stato: 'annullato' })).toEqual([{ label: 'Annullato', tone: 'warn' }]))
})

describe('formati brevi', () => {
  it('data breve senza punti', () => {
    expect(formatShortDate(new Date('2026-10-31T18:30:00Z'), 'UTC')).toMatch(/^sab 31 ott · 18:30$/)
  })
  it('posti', () => {
    expect(describePlacesShort(1)).toBe('Fino a 1 persona')
    expect(describePlacesShort(8)).toBe('Fino a 8 persone')
  })
})
