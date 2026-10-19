import { MemoryEventRepository } from '../data/memory/memoryEventRepository'
import { MemoryParticipationRepository } from '../data/memory/memoryParticipationRepository'
import type { NewEvent } from '../domain/event'
import { joinEvent } from './joinEvent'
import { respondToRequest } from './respondToRequest'

const base: NewEvent = {
  organizzatoreId: 'org',
  tipo: 'aperitivo',
  titolo: 'Aperitivo',
  descrizione: '',
  dataOra: new Date('2030-01-01T20:00:00Z'),
  zonaNome: 'Navigli',
  latApprossimata: 45.45,
  lngApprossimata: 9.18,
  geohash: 'u0nd9h',
  maxPartecipanti: 1,
  richiedeApprovazione: true,
}
const place = { indirizzo: 'Via Roma 1', lat: 45.4512, lng: 9.1823 }

async function setup(over: Partial<NewEvent> = {}) {
  const events = new MemoryEventRepository()
  const parts = new MemoryParticipationRepository(events)
  const event = await events.create({ ...base, ...over }, place)
  return { events, parts, event }
}

describe('iscrizione con approvazione', () => {
  it("l'organizzatore accetta: la richiesta diventa confermato", async () => {
    const { parts, event } = await setup()
    await joinEvent(parts, event.id, 'anna')
    const res = await respondToRequest(parts, event.id, 'anna', 'org', 'accetta')
    expect(res.stato).toBe('confermato')
    expect((await parts.get(event.id, 'anna'))?.stato).toBe('confermato')
  })

  it("l'organizzatore rifiuta: la richiesta diventa rifiutato", async () => {
    const { parts, event } = await setup()
    await joinEvent(parts, event.id, 'anna')
    expect((await respondToRequest(parts, event.id, 'anna', 'org', 'rifiuta')).stato).toBe('rifiutato')
  })

  it('solo l\'organizzatore può decidere', async () => {
    const { parts, event } = await setup()
    await joinEvent(parts, event.id, 'anna')
    await expect(respondToRequest(parts, event.id, 'anna', 'anna', 'accetta')).rejects.toThrow('Solo l\'organizzatore')
    await expect(respondToRequest(parts, event.id, 'anna', 'bruno', 'rifiuta')).rejects.toThrow('Solo l\'organizzatore')
    expect((await parts.get(event.id, 'anna'))?.stato).toBe('richiesta')
  })

  it('non si decide due volte sulla stessa richiesta', async () => {
    const { parts, event } = await setup({ maxPartecipanti: 3 })
    await joinEvent(parts, event.id, 'anna')
    await respondToRequest(parts, event.id, 'anna', 'org', 'rifiuta')
    await expect(respondToRequest(parts, event.id, 'anna', 'org', 'accetta')).rejects.toThrow('già decisa')
  })

  it('richiesta inesistente o evento inesistente: rifiutato', async () => {
    const { parts, event } = await setup()
    await expect(respondToRequest(parts, event.id, 'anna', 'org', 'accetta')).rejects.toThrow('non trovata')
    await expect(respondToRequest(parts, 'nessuno', 'anna', 'org', 'accetta')).rejects.toThrow('non trovato')
  })

  it('accettare oltre il massimo non è possibile, rifiutare sì', async () => {
    const { parts, event } = await setup({ maxPartecipanti: 1 })
    await joinEvent(parts, event.id, 'anna')
    await joinEvent(parts, event.id, 'bruno')
    await respondToRequest(parts, event.id, 'anna', 'org', 'accetta')
    await expect(respondToRequest(parts, event.id, 'bruno', 'org', 'accetta')).rejects.toThrow('Posti esauriti')
    expect((await respondToRequest(parts, event.id, 'bruno', 'org', 'rifiuta')).stato).toBe('rifiutato')
  })

  it("accettazioni simultanee: l'ultimo posto non si assegna due volte", async () => {
    const { parts, event } = await setup({ maxPartecipanti: 1 })
    await joinEvent(parts, event.id, 'anna')
    await joinEvent(parts, event.id, 'bruno')
    const results = await Promise.allSettled([
      respondToRequest(parts, event.id, 'anna', 'org', 'accetta'),
      respondToRequest(parts, event.id, 'bruno', 'org', 'accetta'),
    ])
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
    const confermati = (await parts.listByEvent(event.id)).filter((p) => p.stato === 'confermato')
    expect(confermati).toHaveLength(1)
  })

  it('evento annullato: non si accetta più', async () => {
    const { parts, events, event } = await setup()
    await joinEvent(parts, event.id, 'anna')
    await events.update(event.id, { stato: 'annullato' })
    await expect(respondToRequest(parts, event.id, 'anna', 'org', 'accetta')).rejects.toThrow('non aperto')
  })
})
