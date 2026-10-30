import { describe, expect, it } from 'vitest'
import type { FrienzyEvent } from '../domain/event'
import { dayBadge, friendlyWhen } from './dayBadge'
import { groupByPeriod, periodOf } from './periods'
import { searchEvents } from './search'
import { seatsInfo } from './seats'

// Ora locale di prova: venerdì 30 ottobre 2026, 10:00.
const now = new Date(2026, 9, 30, 10, 0)

function make(titolo: string, dataOra: Date, zonaNome = 'Milano'): FrienzyEvent {
  return {
    id: titolo, organizzatoreId: 'u1', tipo: 'cena', titolo, descrizione: '', dataOra, zonaNome,
    latApprossimata: 45.46, lngApprossimata: 9.19, geohash: 'u0nd9h', maxPartecipanti: 6,
    richiedeApprovazione: false, stato: 'aperto', creatoIl: new Date(2026, 9, 1),
  }
}

describe('raggruppamento per periodo', () => {
  it('distingue oggi, domani, questa settimana e più avanti', () => {
    expect(periodOf(new Date(2026, 9, 30, 23, 30), now)).toBe('oggi')
    expect(periodOf(new Date(2026, 9, 31, 0, 5), now)).toBe('domani')
    expect(periodOf(new Date(2026, 10, 6, 20, 0), now)).toBe('settimana')
    expect(periodOf(new Date(2026, 10, 7, 20, 0), now)).toBe('dopo')
  })

  it('crea solo le sezioni che hanno eventi, nell\'ordine giusto', () => {
    const groups = groupByPeriod([make('a', new Date(2026, 9, 31, 19)), make('b', new Date(2026, 10, 20, 19)), make('c', new Date(2026, 9, 30, 21))], now)
    expect(groups.map((g) => g.title)).toEqual(['Oggi', 'Domani', 'Più avanti'])
    expect(groups[0].events.map((e) => e.titolo)).toEqual(['c'])
  })

  it('senza eventi non crea sezioni', () => {
    expect(groupByPeriod([], now)).toEqual([])
  })
})

describe('ricerca', () => {
  const list = [make('Aperitivo sul Naviglio', new Date(), 'Navigli, Milano'), make('Trekking al lago', new Date(), 'Lago di Como')]
  it('cerca nel titolo e nella zona, senza badare ad accenti e maiuscole', () => {
    expect(searchEvents(list, 'NAVIGLIO').map((e) => e.titolo)).toEqual(['Aperitivo sul Naviglio'])
    expect(searchEvents(list, 'como').map((e) => e.titolo)).toEqual(['Trekking al lago'])
    expect(searchEvents(list, 'àperitivo')).toHaveLength(1)
    expect(searchEvents(list, 'aperitivo')).toHaveLength(1)
  })
  it('chiede tutte le parole e una ricerca vuota restituisce tutto', () => {
    expect(searchEvents(list, 'lago como')).toHaveLength(1)
    expect(searchEvents(list, 'lago navigli')).toHaveLength(0)
    expect(searchEvents(list, '   ')).toHaveLength(2)
  })
})

describe('posti', () => {
  it('conta i posti liberi e riempie la barra', () => {
    expect(seatsInfo(8, 2)).toMatchObject({ left: 6, ratio: 0.25, level: 'ok', label: '6 posti liberi' })
  })
  it('segnala gli ultimi posti solo se l\'evento è già mezzo pieno', () => {
    expect(seatsInfo(8, 6).level).toBe('low')
    expect(seatsInfo(2, 0).level).toBe('ok')
    expect(seatsInfo(6, 5).label).toBe('1 posto libero')
  })
  it('al completo e valori fuori scala', () => {
    expect(seatsInfo(2, 2)).toMatchObject({ level: 'full', label: 'Al completo' })
    expect(seatsInfo(2, 9).left).toBe(0)
  })
})

describe('badge data', () => {
  it('giorno e mese per il calendario', () => {
    expect(dayBadge(new Date(2026, 9, 31))).toEqual({ day: '31', month: 'OTT' })
  })
  it('etichette amichevoli', () => {
    expect(friendlyWhen(new Date(2026, 9, 30, 21), now)).toBe('Oggi · 21:00')
    expect(friendlyWhen(new Date(2026, 9, 31, 19, 30), now)).toBe('Domani · 19:30')
    expect(friendlyWhen(new Date(2026, 10, 3, 20), now)).toContain('3 nov')
  })
})
