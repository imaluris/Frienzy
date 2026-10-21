import { MemoryEventRepository } from '../data/memory/memoryEventRepository'
import { MemoryParticipationRepository } from '../data/memory/memoryParticipationRepository'
import type { NewEvent } from '../domain/event'
import { cancelEvent } from '../events/cancelEvent'
import { buildMine } from '../mine/buildMine'
import { joinEvent } from './joinEvent'
import { respondToRequest } from './respondToRequest'
import { decideWithdraw } from './withdrawDecision'
import { withdrawFromEvent } from './withdrawFromEvent'

const base: NewEvent = {
  organizzatoreId: 'org', tipo: 'aperitivo', titolo: 'Aperitivo', descrizione: '',
  dataOra: new Date('2030-01-01T20:00:00Z'), zonaNome: 'Navigli', latApprossimata: 45.45, lngApprossimata: 9.18,
  geohash: 'u0nd9h', maxPartecipanti: 1, richiedeApprovazione: false,
}
const place = { indirizzo: 'Via Roma 1', lat: 45.4512, lng: 9.1823 }

async function setup(over: Partial<NewEvent> = {}) {
  const events = new MemoryEventRepository()
  const parts = new MemoryParticipationRepository(events)
  const event = await events.create({ ...base, ...over }, place)
  return { events, parts, event }
}

describe('ritiro dall\'evento', () => {
  it('chi si ritira libera il posto: un altro può iscriversi', async () => {
    const { parts, event } = await setup()
    await joinEvent(parts, event.id, 'anna')
    await expect(joinEvent(parts, event.id, 'bruno')).rejects.toThrow('Posti esauriti')
    await withdrawFromEvent(parts, event.id, 'anna')
    expect(await parts.get(event.id, 'anna')).toBeNull()
    expect((await joinEvent(parts, event.id, 'bruno')).stato).toBe('confermato')
  })

  it('si può ritirare una richiesta non ancora decisa', async () => {
    const { parts, event } = await setup({ richiedeApprovazione: true })
    await joinEvent(parts, event.id, 'anna')
    await withdrawFromEvent(parts, event.id, 'anna')
    expect(await parts.listByEvent(event.id)).toHaveLength(0)
  })

  it('ritirarsi tocca solo la propria iscrizione', async () => {
    const { parts, event } = await setup({ maxPartecipanti: 5 })
    await joinEvent(parts, event.id, 'anna')
    await joinEvent(parts, event.id, 'bruno')
    await withdrawFromEvent(parts, event.id, 'anna')
    expect((await parts.listConfirmed(event.id)).map((p) => p.uid)).toEqual(['bruno'])
  })

  it('senza iscrizione il ritiro dà errore', async () => {
    const { parts, event } = await setup()
    await expect(withdrawFromEvent(parts, event.id, 'anna')).rejects.toThrow('Iscrizione non trovata')
  })

  it('dopo un rifiuto ci si può togliere dall\'elenco', async () => {
    const { parts, event } = await setup({ richiedeApprovazione: true })
    await joinEvent(parts, event.id, 'anna')
    await respondToRequest(parts, event.id, 'anna', 'org', 'rifiuta')
    await withdrawFromEvent(parts, event.id, 'anna')
    expect(await parts.get(event.id, 'anna')).toBeNull()
  })
})

describe('decideWithdraw', () => {
  const part = (stato: 'richiesta' | 'confermato' | 'rifiutato') => ({ eventId: 'e', uid: 'a', stato, creatoIl: new Date() })
  it('libera un posto solo se era confermato', () => {
    expect(decideWithdraw(part('confermato'))).toEqual({ ok: true, liberaPosto: true })
    expect(decideWithdraw(part('richiesta'))).toEqual({ ok: true, liberaPosto: false })
    expect(decideWithdraw(part('rifiutato'))).toEqual({ ok: true, liberaPosto: false })
    expect(decideWithdraw(null).ok).toBe(false)
  })
})

describe('annullamento dell\'evento', () => {
  it("l'organizzatore annulla: lo stato diventa annullato", async () => {
    const { events, event } = await setup()
    expect((await cancelEvent(events, event.id, 'org')).stato).toBe('annullato')
    expect((await events.getById(event.id))?.stato).toBe('annullato')
  })

  it('un altro utente non può annullare', async () => {
    const { events, event } = await setup()
    await expect(cancelEvent(events, event.id, 'anna')).rejects.toThrow("Solo l'organizzatore")
    expect((await events.getById(event.id))?.stato).toBe('aperto')
  })

  it('non si annulla due volte né un evento inesistente', async () => {
    const { events, event } = await setup()
    await cancelEvent(events, event.id, 'org')
    await expect(cancelEvent(events, event.id, 'org')).rejects.toThrow('già annullato')
    await expect(cancelEvent(events, 'nope', 'org')).rejects.toThrow('non trovato')
  })

  it("dopo l'annullamento nessuno può più iscriversi", async () => {
    const { events, parts, event } = await setup()
    await cancelEvent(events, event.id, 'org')
    await expect(joinEvent(parts, event.id, 'anna')).rejects.toThrow('non aperto')
  })
})

describe('buildMine', () => {
  it('separa gli eventi organizzati dalle iscrizioni, ordinati per data', async () => {
    const { events, parts, event } = await setup({ maxPartecipanti: 5 })
    const later = await events.create({ ...base, organizzatoreId: 'anna', titolo: 'Dopo', dataOra: new Date('2031-01-01T20:00:00Z') }, place)
    const sooner = await events.create({ ...base, organizzatoreId: 'anna', titolo: 'Prima', dataOra: new Date('2029-01-01T20:00:00Z') }, place)
    await joinEvent(parts, event.id, 'anna')
    const mine = buildMine(await events.list(), await parts.listByUser('anna'), 'anna')
    expect(mine.organized.map((e) => e.id)).toEqual([sooner.id, later.id])
    expect(mine.joined.map((j) => j.event.id)).toEqual([event.id])
    expect(mine.joined[0].participation.stato).toBe('confermato')
  })

  it('salta le iscrizioni il cui evento non esiste', () => {
    const orphan = { eventId: 'sparito', uid: 'anna', stato: 'confermato' as const, creatoIl: new Date() }
    expect(buildMine([], [orphan], 'anna').joined).toEqual([])
  })
})
