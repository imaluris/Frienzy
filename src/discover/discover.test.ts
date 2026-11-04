import type { FrienzyEvent } from '../domain/event'
import type { EventTypeId } from '../domain/eventTypes'
import { encodeGeohash } from '../events/geohash'
import { rankForYou } from './forYou'
import { formatDistance, nearbyEvents } from './nearby'
import { buildDiscover } from './sections'
import { weekendEvents, weekendRange } from './weekend'

const MILANO = { lat: 45.4642, lng: 9.19 }

function ev(id: string, tipo: EventTypeId, dataOra: Date, over: Partial<FrienzyEvent> = {}): FrienzyEvent {
  return {
    id, organizzatoreId: 'altro', tipo, titolo: id, descrizione: '', dataOra, zonaNome: 'z',
    latApprossimata: MILANO.lat, lngApprossimata: MILANO.lng, geohash: encodeGeohash(MILANO.lat, MILANO.lng),
    maxPartecipanti: 8, richiedeApprovazione: false, stato: 'aperto', creatoIl: new Date(), ...over,
  }
}

// Mercoledì 4 novembre 2026, 10:00. Sabato 7, domenica 8.
const NOW = new Date(2026, 10, 4, 10, 0)
const at = (day: number, hour = 20) => new Date(2026, 10, day, hour, 0)

describe('Per te', () => {
  it('tiene solo i tipi che mi interessano e scarta i miei eventi', () => {
    const list = [ev('a', 'cena', at(10)), ev('b', 'sport', at(10)), ev('c', 'cena', at(11), { organizzatoreId: 'io' })]
    expect(rankForYou(list, ['cena'], 'io').map((e) => e.id)).toEqual(['a'])
  })

  it('ordina prima per interesse (il primo scelto vale di più), poi per data', () => {
    const list = [ev('trek-presto', 'trekking', at(9)), ev('cena-tardi', 'cena', at(20)), ev('cena-presto', 'cena', at(10))]
    expect(rankForYou(list, ['cena', 'trekking'], 'io').map((e) => e.id)).toEqual(['cena-presto', 'cena-tardi', 'trek-presto'])
  })

  it('senza interessi non c\'è nulla e l\'array ricevuto non cambia', () => {
    const list = [ev('b', 'cena', at(12)), ev('a', 'cena', at(10))]
    expect(rankForYou(list, [], 'io')).toEqual([])
    rankForYou(list, ['cena'], 'io')
    expect(list.map((e) => e.id)).toEqual(['b', 'a'])
  })
})

describe('Questo weekend', () => {
  it('da lunedì a venerdì è il prossimo sabato e domenica', () => {
    for (const day of [2, 3, 4, 5, 6]) {
      const { from, to } = weekendRange(new Date(2026, 10, day, 12))
      expect([from.getDate(), to.getDate()]).toEqual([7, 9])
    }
  })

  it('di sabato e di domenica è quello in corso', () => {
    expect(weekendRange(new Date(2026, 10, 7, 12)).from.getDate()).toBe(7)
    expect(weekendRange(new Date(2026, 10, 8, 12)).from.getDate()).toBe(7)
  })

  it('include sabato e domenica, esclude venerdì sera, lunedì e gli eventi già passati', () => {
    const list = [ev('ven', 'cena', at(6, 22)), ev('sab', 'cena', at(7, 18)), ev('dom', 'cena', at(8, 23)), ev('lun', 'cena', at(9, 9))]
    expect(weekendEvents(list, NOW).map((e) => e.id)).toEqual(['sab', 'dom'])
    const domenicaSera = new Date(2026, 10, 8, 21)
    expect(weekendEvents([ev('sab', 'cena', at(7, 18)), ev('dom', 'cena', at(8, 23))], domenicaSera).map((e) => e.id)).toEqual(['dom'])
  })
})

describe('Vicino a te', () => {
  const ROMA = { latApprossimata: 41.9, lngApprossimata: 12.5, geohash: encodeGeohash(41.9, 12.5) }

  it('senza posizione la lista è vuota', () => {
    expect(nearbyEvents([ev('a', 'cena', at(10))], null)).toEqual([])
  })

  it('tiene solo gli eventi entro il raggio, dal più vicino', () => {
    const vicino = ev('vicino', 'cena', at(10))
    const medio = ev('medio', 'cena', at(10), { ...pointKm(MILANO, 8) })
    const lontano = ev('lontano', 'cena', at(10), ROMA)
    const found = nearbyEvents([lontano, medio, vicino], MILANO)
    expect(found.map((f) => f.event.id)).toEqual(['vicino', 'medio'])
    expect(found[1].km).toBeGreaterThan(5)
  })

  it('formatta le distanze', () => {
    expect(formatDistance(0.04)).toBe('100 m')
    expect(formatDistance(0.83)).toBe('800 m')
    expect(formatDistance(3.44)).toBe('3,4 km')
    expect(formatDistance(12.6)).toBe('13 km')
  })
})

describe('buildDiscover', () => {
  it('mette insieme le tre file e limita la lunghezza', () => {
    const many = Array.from({ length: 12 }, (_, i) => ev(`e${i}`, 'cena', at(10 + (i % 3))))
    const out = buildDiscover({ events: many, interessi: ['cena'], uid: 'io', position: MILANO, now: NOW })
    expect(out.perTe).toHaveLength(8)
    expect(out.vicino).toHaveLength(8)
    expect(out.weekend).toEqual([])
  })

  it('senza posizione "vicino" resta vuoto', () => {
    const out = buildDiscover({ events: [ev('a', 'cena', at(7))], interessi: [], uid: 'io', position: null, now: NOW })
    expect(out.vicino).toEqual([])
    expect(out.weekend.map((e) => e.id)).toEqual(['a'])
  })
})

// Un punto a circa `km` chilometri a nord del punto dato (1 grado di latitudine ≈ 111 km).
function pointKm(from: { lat: number; lng: number }, km: number) {
  const lat = from.lat + km / 111
  return { latApprossimata: lat, lngApprossimata: from.lng, geohash: encodeGeohash(lat, from.lng) }
}
