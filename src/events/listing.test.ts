import type { FrienzyEvent } from '../domain/event'
import { describeCapacity, formatEventDate } from './format'
import { isUpcoming, upcomingEvents } from './listing'

const now = new Date('2026-10-15T12:00:00Z')

function make(id: string, dataOra: string, stato: FrienzyEvent['stato'] = 'aperto'): FrienzyEvent {
  return {
    id, organizzatoreId: 'u1', tipo: 'cena', titolo: id, descrizione: '', dataOra: new Date(dataOra),
    zonaNome: 'Milano', latApprossimata: 45.46, lngApprossimata: 9.19, geohash: 'u0nd9h',
    maxPartecipanti: 6, richiedeApprovazione: false, stato, creatoIl: new Date('2026-10-01T00:00:00Z'),
  }
}

describe('eventi futuri', () => {
  it('scarta gli eventi passati e quelli che iniziano proprio adesso', () => {
    expect(isUpcoming(make('ieri', '2026-10-14T20:00:00Z'), now)).toBe(false)
    expect(isUpcoming(make('adesso', '2026-10-15T12:00:00Z'), now)).toBe(false)
    expect(isUpcoming(make('domani', '2026-10-16T20:00:00Z'), now)).toBe(true)
  })

  it('scarta gli eventi annullati', () => {
    expect(isUpcoming(make('x', '2026-10-20T20:00:00Z', 'annullato'), now)).toBe(false)
    expect(isUpcoming(make('y', '2026-10-20T20:00:00Z', 'chiuso'), now)).toBe(true)
  })

  it('ordina dal più vicino al più lontano senza toccare l\'originale', () => {
    const input = [make('c', '2026-12-01T10:00:00Z'), make('a', '2026-10-16T10:00:00Z'), make('vecchio', '2026-01-01T10:00:00Z'), make('b', '2026-11-01T10:00:00Z')]
    const copy = [...input]
    expect(upcomingEvents(input, now).map((e) => e.id)).toEqual(['a', 'b', 'c'])
    expect(input).toEqual(copy)
  })

  it('con elenco vuoto restituisce elenco vuoto', () => {
    expect(upcomingEvents([], now)).toEqual([])
  })
})

describe('formattazione', () => {
  it('scrive la data in italiano', () => {
    expect(formatEventDate(new Date('2026-10-20T17:30:00Z'), 'UTC')).toMatch(/martedì 20 ottobre.*17:30/)
  })
  it('gestisce il singolare', () => {
    expect(describeCapacity(1)).toBe('Massimo 1 persona')
    expect(describeCapacity(8)).toBe('Massimo 8 persone')
  })
})
