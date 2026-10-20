import type { FrienzyEvent } from '../domain/event'
import { encodeGeohash } from '../events/geohash'
import { decodeGeohash } from '../events/geohashDecode'
import { distanceKm, distanceToGeohashKm } from './distance'
import { filterEvents, NO_FILTERS, matchesDates } from './eventFilters'

const MILANO = { lat: 45.4642, lng: 9.19 }
const BERGAMO = { lat: 45.6983, lng: 9.6773 }
const ROMA = { lat: 41.9028, lng: 12.4964 }

function ev(id: string, tipo: FrienzyEvent['tipo'], when: string, at: { lat: number; lng: number }): FrienzyEvent {
  return {
    id, organizzatoreId: 'org', tipo, titolo: id, descrizione: '', dataOra: new Date(when), zonaNome: 'z',
    latApprossimata: at.lat, lngApprossimata: at.lng, geohash: encodeGeohash(at.lat, at.lng),
    maxPartecipanti: 5, richiedeApprovazione: false, stato: 'aperto', creatoIl: new Date(),
  }
}
const list = [
  ev('cena-milano', 'cena', '2031-03-10T20:00:00Z', MILANO),
  ev('trek-bergamo', 'trekking', '2031-03-12T08:00:00Z', BERGAMO),
  ev('cena-roma', 'cena', '2031-03-12T21:00:00Z', ROMA),
]
const ids = (events: FrienzyEvent[]) => events.map((e) => e.id)

describe('geohash e distanza', () => {
  it('decode(encode(punto)) cade vicino al punto', () => {
    const c = decodeGeohash(encodeGeohash(MILANO.lat, MILANO.lng, 8))
    expect(c).not.toBeNull()
    expect(distanceKm(MILANO, c!)).toBeLessThan(0.1)
  })
  it('geohash non valido o vuoto: null', () => {
    expect(decodeGeohash('')).toBeNull()
    expect(decodeGeohash('a!')).toBeNull() // "a" non esiste nell'alfabeto del geohash
    expect(distanceToGeohashKm(MILANO, 'zz!')).toBeNull()
  })
  it('Milano-Roma ≈ 477 km, stesso punto = 0', () => {
    expect(distanceKm(MILANO, ROMA)).toBeGreaterThan(470)
    expect(distanceKm(MILANO, ROMA)).toBeLessThan(485)
    expect(distanceKm(MILANO, MILANO)).toBe(0)
  })
})

describe('filterEvents', () => {
  it('senza filtri restituisce tutto, nello stesso ordine', () => {
    expect(ids(filterEvents(list, NO_FILTERS))).toEqual(ids(list))
  })
  it('per tipo (anche più tipi)', () => {
    expect(ids(filterEvents(list, { ...NO_FILTERS, tipi: ['cena'] }))).toEqual(['cena-milano', 'cena-roma'])
    expect(ids(filterEvents(list, { ...NO_FILTERS, tipi: ['cena', 'trekking'] }))).toHaveLength(3)
    expect(filterEvents(list, { ...NO_FILTERS, tipi: ['mostra'] })).toEqual([])
  })
  it('per data: estremi inclusi, "a" vale fino a fine giornata', () => {
    const da = new Date('2031-03-12T00:00:00Z')
    expect(ids(filterEvents(list, { ...NO_FILTERS, da }))).toEqual(['trek-bergamo', 'cena-roma'])
    const a = new Date('2031-03-10T00:00:00Z')
    expect(ids(filterEvents(list, { ...NO_FILTERS, a }))).toEqual(['cena-milano'])
    expect(matchesDates(list[2], da, new Date('2031-03-12T00:00:00Z'))).toBe(true) // 21:00 dello stesso giorno
  })
  it('per distanza: 10 km da Milano, 100 km, e senza raggio il filtro è spento', () => {
    const base = { ...NO_FILTERS, centro: MILANO }
    expect(ids(filterEvents(list, { ...base, raggioKm: 10 }))).toEqual(['cena-milano'])
    expect(ids(filterEvents(list, { ...base, raggioKm: 100 }))).toEqual(['cena-milano', 'trek-bergamo'])
    expect(filterEvents(list, { ...base, raggioKm: null })).toHaveLength(3)
    expect(filterEvents(list, { ...NO_FILTERS, raggioKm: 5 })).toHaveLength(3) // raggio senza centro
  })
  it('filtri combinati; geohash rotto escluso dalla distanza; non modifica l\'array', () => {
    const rotto = { ...list[0], id: 'rotto', geohash: '!!!' }
    const input = [...list, rotto]
    const copy = [...input]
    const out = filterEvents(input, { ...NO_FILTERS, tipi: ['cena'], centro: MILANO, raggioKm: 50 })
    expect(ids(out)).toEqual(['cena-milano'])
    expect(input).toEqual(copy)
  })
})
