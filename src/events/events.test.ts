import { MemoryEventRepository } from '../data/memory/memoryEventRepository'
import { approximateCoordinate } from './approximate'
import { buildEvent, createEvent } from './eventService'
import { encodeGeohash } from './geohash'
import { validateCoordinates, validateEvent, validateMaxParticipants, type EventInput } from './validation'

const now = new Date('2026-10-14T10:00:00')
const valid: EventInput = {
  tipo: 'aperitivo',
  titolo: 'Aperitivo ai Navigli',
  descrizione: 'Due chiacchiere e uno spritz.',
  dataOra: '2026-10-20T19:30',
  zonaNome: 'Navigli, Milano',
  indirizzo: 'Alzaia Naviglio Grande 12',
  lat: '45.4523',
  lng: '9,1731',
  maxPartecipanti: '8',
  richiedeApprovazione: false,
}

describe('geohash', () => {
  it('calcola valori noti', () => {
    expect(encodeGeohash(57.64911, 10.40744, 11)).toBe('u4pruydqqvj') // esempio di Wikipedia
    expect(encodeGeohash(42.6, -5.6, 5)).toBe('ezs42')
  })
  it('punti vicini condividono il prefisso', () => {
    expect(encodeGeohash(45.4523, 9.1731).slice(0, 4)).toBe(encodeGeohash(45.4601, 9.1802).slice(0, 4))
  })
  it('rispetta la precisione richiesta', () => {
    expect(encodeGeohash(0, 0, 4)).toHaveLength(4)
  })
})

describe('posizione approssimata', () => {
  it('arrotonda a due decimali', () => {
    expect(approximateCoordinate(45.45678)).toBe(45.46)
    expect(approximateCoordinate(-9.1749)).toBe(-9.17)
  })
})

describe('validazione evento', () => {
  it('accetta un evento corretto (virgola decimale compresa)', () => {
    expect(validateEvent(valid, now)).toBeNull()
  })
  it('rifiuta tipo, titolo e zona non validi', () => {
    expect(validateEvent({ ...valid, tipo: 'volo' }, now)).toContain('tipo')
    expect(validateEvent({ ...valid, titolo: 'Ab' }, now)).toContain('titolo')
    expect(validateEvent({ ...valid, zonaNome: '  ' }, now)).toContain('zona')
  })
  it('rifiuta date passate o mal scritte', () => {
    expect(validateEvent({ ...valid, dataOra: '2026-10-14T09:00' }, now)).toContain('futuro')
    expect(validateEvent({ ...valid, dataOra: 'domani' }, now)).toContain('data')
  })
  it('controlla le coordinate', () => {
    expect(validateCoordinates('91', '9')).toContain('latitudine')
    expect(validateCoordinates('45', '181')).toContain('longitudine')
    expect(validateCoordinates('abc', '9')).toContain('numeri')
  })
  it('controlla il massimo di partecipanti', () => {
    expect(validateMaxParticipants('0')).not.toBeNull()
    expect(validateMaxParticipants('201')).not.toBeNull()
    expect(validateMaxParticipants('2,5')).not.toBeNull()
    expect(validateMaxParticipants('200')).toBeNull()
  })
})

describe('creazione evento', () => {
  it('separa zona approssimata e luogo esatto', () => {
    const { event, place } = buildEvent('u1', valid)
    expect(event.latApprossimata).toBe(45.45)
    expect(event.lngApprossimata).toBe(9.17)
    expect(event.geohash).toBe(encodeGeohash(45.45, 9.17))
    expect(place).toEqual({ indirizzo: 'Alzaia Naviglio Grande 12', lat: 45.4523, lng: 9.1731 })
  })
  it('salva l\'evento nel repository con il suo organizzatore', async () => {
    const repo = new MemoryEventRepository()
    const created = await createEvent(repo, 'u1', valid, now)
    expect(created.organizzatoreId).toBe('u1')
    expect(created.stato).toBe('aperto')
    expect(await repo.getById(created.id)).not.toBeNull()
  })
  it('non salva nulla se i dati non vanno bene', async () => {
    const repo = new MemoryEventRepository()
    await expect(createEvent(repo, 'u1', { ...valid, titolo: '' }, now)).rejects.toThrow('titolo')
    expect(await repo.list()).toHaveLength(0)
  })
})
