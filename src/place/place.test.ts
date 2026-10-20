import { createMemoryServices } from '../data/memory/createMemoryServices'
import { MemoryEventRepository } from '../data/memory/memoryEventRepository'
import type { FrienzyEvent, NewEvent } from '../domain/event'
import type { Participation } from '../domain/participation'
import { joinEvent } from '../participation/joinEvent'
import { respondToRequest } from '../participation/respondToRequest'
import { canSeeExactPlace } from './placeAccess'

const base: NewEvent = {
  organizzatoreId: 'org', tipo: 'cena', titolo: 'Cena', descrizione: '', dataOra: new Date('2031-01-01T20:00:00Z'),
  zonaNome: 'Navigli', latApprossimata: 45.45, lngApprossimata: 9.18, geohash: 'u0nd9h',
  maxPartecipanti: 5, richiedeApprovazione: true,
}
const place = { indirizzo: 'Via Roma 1', lat: 45.4512, lng: 9.1823 }
const event: FrienzyEvent = { ...base, id: 'e', stato: 'aperto', creatoIl: new Date() }
const part = (uid: string, stato: Participation['stato']): Participation => ({ eventId: 'e', uid, stato, creatoIl: new Date() })

describe('canSeeExactPlace (regola pura)', () => {
  it('organizzatore sì, anche senza partecipazione', () => expect(canSeeExactPlace(event, 'org', null)).toBe(true))
  it('confermato sì', () => expect(canSeeExactPlace(event, 'anna', part('anna', 'confermato'))).toBe(true))
  it('richiesta no', () => expect(canSeeExactPlace(event, 'anna', part('anna', 'richiesta'))).toBe(false))
  it('rifiutato no', () => expect(canSeeExactPlace(event, 'anna', part('anna', 'rifiutato'))).toBe(false))
  it('estraneo no', () => expect(canSeeExactPlace(event, 'luca', null)).toBe(false))
  it('non collegato no', () => expect(canSeeExactPlace(event, null, null)).toBe(false))
  it("la partecipazione di un altro non vale", () => expect(canSeeExactPlace(event, 'luca', part('anna', 'confermato'))).toBe(false))
})

describe('getExactPlace nel repository', () => {
  it('ruoli diversi vedono o no il luogo esatto', async () => {
    const { events, participations } = createMemoryServices()
    const created = await events.create(base, place)
    for (const uid of ['anna', 'bruno', 'carla']) await joinEvent(participations, created.id, uid)
    await respondToRequest(participations, created.id, 'anna', 'org', 'accetta')
    await respondToRequest(participations, created.id, 'carla', 'org', 'rifiuta')

    expect(await events.getExactPlace(created.id, 'org')).toEqual(place)
    expect(await events.getExactPlace(created.id, 'anna')).toEqual(place)
    expect(await events.getExactPlace(created.id, 'bruno')).toBeNull() // richiesta
    expect(await events.getExactPlace(created.id, 'carla')).toBeNull() // rifiutato
    expect(await events.getExactPlace(created.id, 'luca')).toBeNull() // estraneo
    expect(await events.getExactPlace(created.id, null)).toBeNull() // non collegato
  })

  it('evento libero: chi si iscrive nasce confermato e vede il luogo', async () => {
    const { events, participations } = createMemoryServices()
    const created = await events.create({ ...base, richiedeApprovazione: false }, place)
    await joinEvent(participations, created.id, 'anna')
    expect(await events.getExactPlace(created.id, 'anna')).toEqual(place)
  })

  it("senza collegamento alle iscrizioni vede solo l'organizzatore; evento inesistente: null", async () => {
    const events = new MemoryEventRepository()
    const created = await events.create(base, place)
    expect(await events.getExactPlace(created.id, 'org')).toEqual(place)
    expect(await events.getExactPlace(created.id, 'anna')).toBeNull()
    expect(await events.getExactPlace('nope', 'org')).toBeNull()
  })

  it('restituisce una copia: modificarla non cambia il luogo salvato', async () => {
    const { events } = createMemoryServices()
    const created = await events.create(base, place)
    const copy = await events.getExactPlace(created.id, 'org')
    if (copy) copy.indirizzo = 'Altrove'
    expect((await events.getExactPlace(created.id, 'org'))?.indirizzo).toBe('Via Roma 1')
  })
})
