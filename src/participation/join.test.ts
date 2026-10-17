import { MemoryEventRepository } from '../data/memory/memoryEventRepository'
import { MemoryParticipationRepository } from '../data/memory/memoryParticipationRepository'
import type { NewEvent } from '../domain/event'
import { joinEvent } from './joinEvent'

const base: NewEvent = {
  organizzatoreId: 'org',
  tipo: 'cena',
  titolo: 'Cena in terrazza',
  descrizione: '',
  dataOra: new Date('2030-01-01T20:00:00Z'),
  zonaNome: 'Navigli',
  latApprossimata: 45.45,
  lngApprossimata: 9.18,
  geohash: 'u0nd9h',
  maxPartecipanti: 2,
  richiedeApprovazione: false,
}
const place = { indirizzo: 'Via Roma 1', lat: 45.4512, lng: 9.1823 }

async function setup(over: Partial<NewEvent> = {}) {
  const events = new MemoryEventRepository()
  const parts = new MemoryParticipationRepository(events)
  const event = await events.create({ ...base, ...over }, place)
  return { events, parts, event }
}

describe('iscrizione libera', () => {
  it('evento libero: nasce confermato', async () => {
    const { parts, event } = await setup()
    expect((await joinEvent(parts, event.id, 'anna')).stato).toBe('confermato')
  })

  it("l'ultimo posto non si prende due volte (iscrizioni simultanee)", async () => {
    const { parts, event } = await setup({ maxPartecipanti: 1 })
    const results = await Promise.allSettled([joinEvent(parts, event.id, 'anna'), joinEvent(parts, event.id, 'bruno')])
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
    const rejected = results.find((r) => r.status === 'rejected') as PromiseRejectedResult
    expect(rejected.reason.message).toBe('Posti esauriti')
    expect(await parts.listByEvent(event.id)).toHaveLength(1)
  })

  it('molte iscrizioni insieme non superano il massimo', async () => {
    const { parts, event } = await setup({ maxPartecipanti: 3 })
    const uids = Array.from({ length: 10 }, (_, i) => `u${i}`)
    await Promise.allSettled(uids.map((u) => joinEvent(parts, event.id, u)))
    expect(await parts.listByEvent(event.id)).toHaveLength(3)
  })

  it('non ci si iscrive due volte', async () => {
    const { parts, event } = await setup()
    await joinEvent(parts, event.id, 'anna')
    await expect(joinEvent(parts, event.id, 'anna')).rejects.toThrow('Già iscritto')
  })

  it("l'organizzatore non si iscrive al proprio evento", async () => {
    const { parts, event } = await setup()
    await expect(joinEvent(parts, event.id, 'org')).rejects.toThrow('organizzatore')
  })

  it('evento annullato o inesistente: rifiutato', async () => {
    const { parts, events, event } = await setup()
    await events.update(event.id, { stato: 'annullato' })
    await expect(joinEvent(parts, event.id, 'anna')).rejects.toThrow('non aperto')
    await expect(joinEvent(parts, 'nessuno', 'anna')).rejects.toThrow('non trovato')
  })

  it('con approvazione nasce richiesta e non occupa posti', async () => {
    const { parts, event } = await setup({ richiedeApprovazione: true, maxPartecipanti: 1 })
    expect((await joinEvent(parts, event.id, 'anna')).stato).toBe('richiesta')
    expect((await joinEvent(parts, event.id, 'bruno')).stato).toBe('richiesta')
  })
})
