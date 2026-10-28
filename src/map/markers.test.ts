import type { FrienzyEvent } from '../domain/event'
import { EVENT_TYPE_IDS, EVENT_TYPE_EMOJI } from '../domain/eventTypes'
import { eventsToMarkers } from './markers'
import { centerOf, DEFAULT_CENTER } from './viewport'

function makeEvent(id: string, tipo: FrienzyEvent['tipo']): FrienzyEvent {
  return {
    id, organizzatoreId: 'o', tipo, titolo: `Evento ${id}`, descrizione: '', dataOra: new Date(),
    zonaNome: 'Navigli', latApprossimata: 45.45, lngApprossimata: 9.17, geohash: 'u0nd8k',
    maxPartecipanti: 8, richiedeApprovazione: false, stato: 'aperto', creatoIl: new Date(),
  }
}

describe('eventsToMarkers', () => {
  it('usa l’emoji giusta per ogni tipo', () => {
    const markers = eventsToMarkers(EVENT_TYPE_IDS.map((tipo) => makeEvent(tipo, tipo)))
    expect(markers.map((m) => m.emoji)).toEqual(EVENT_TYPE_IDS.map((t) => EVENT_TYPE_EMOJI[t]))
    expect(markers[0].emoji).toBe('🍹')
  })

  it('copia id, titolo e posizione approssimata', () => {
    const [marker] = eventsToMarkers([makeEvent('a', 'cena')])
    expect(marker).toMatchObject({ eventId: 'a', lat: 45.45, lng: 9.17, emoji: '🍽️', title: 'Evento a', zone: 'Navigli' })
    expect(marker.when).toContain('·')
  })

  it('senza eventi restituisce un elenco vuoto', () => {
    expect(eventsToMarkers([])).toEqual([])
  })
})

describe('centerOf', () => {
  it('senza marker usa il centro predefinito', () => {
    expect(centerOf([])).toEqual(DEFAULT_CENTER)
  })

  it('con più marker fa la media', () => {
    const a = { eventId: 'a', lat: 10, lng: 20, emoji: '✨', title: 'a', when: '', zone: '' }
    const b = { eventId: 'b', lat: 20, lng: 40, emoji: '✨', title: 'b', when: '', zone: '' }
    expect(centerOf([a, b])).toEqual([15, 30])
  })
})
