import { MemoryEventRepository } from '../data/memory/memoryEventRepository'
import { MemoryParticipationRepository } from '../data/memory/memoryParticipationRepository'
import type { FrienzyEvent, NewEvent } from '../domain/event'
import type { Participation } from '../domain/participation'
import { joinEvent } from './joinEvent'
import { respondToRequest } from './respondToRequest'
import { decideWaitlist, pickPromotion, waitlistOrder, waitlistPosition } from './waitlist'
import { decideWithdraw } from './withdrawDecision'
import { withdrawFromEvent } from './withdrawFromEvent'

const base: NewEvent = {
  organizzatoreId: 'org', tipo: 'cena', titolo: 'Cena', descrizione: '',
  dataOra: new Date('2030-01-01T20:00:00Z'), zonaNome: 'Navigli', latApprossimata: 45.45, lngApprossimata: 9.18,
  geohash: 'u0nd9h', maxPartecipanti: 1, richiedeApprovazione: false,
}
const place = { indirizzo: 'Via Roma 1', lat: 45.4512, lng: 9.1823 }

// Orologio che avanza di un secondo a ogni lettura: l'ordine di arrivo è sempre chiaro.
async function setup(over: Partial<NewEvent> = {}, blocked: (a: string, b: string) => Promise<boolean> = async () => false) {
  let t = 0
  const events = new MemoryEventRepository()
  const parts = new MemoryParticipationRepository(events, () => new Date(++t * 1000), blocked)
  const event = await events.create({ ...base, ...over }, place)
  return { parts, event }
}

const part = (uid: string, stato: Participation['stato'], sec: number): Participation => ({ eventId: 'e', uid, stato, creatoIl: new Date(sec * 1000) })
const event: FrienzyEvent = { id: 'e', ...base, latApprossimata: 0, lngApprossimata: 0, stato: 'aperto', creatoIl: new Date() } as FrienzyEvent

describe('funzioni pure della lista d\'attesa', () => {
  const all = [part('c', 'inAttesa', 30), part('a', 'inAttesa', 10), part('x', 'confermato', 1), part('b', 'inAttesa', 20)]
  it('ordine di arrivo, solo chi è in lista', () => {
    expect(waitlistOrder(all).map((p) => p.uid)).toEqual(['a', 'b', 'c'])
  })
  it('a parità di istante decide l\'uid', () => {
    expect(waitlistOrder([part('z', 'inAttesa', 5), part('m', 'inAttesa', 5)]).map((p) => p.uid)).toEqual(['m', 'z'])
  })
  it('posizione da 1; null se non in lista', () => {
    expect(waitlistPosition(all, 'b')).toBe(2)
    expect(waitlistPosition(all, 'x')).toBeNull()
  })
  it('promozione: libero → confermato, con approvazione → richiesta, nessuno se lista vuota o evento non aperto', () => {
    expect(pickPromotion(event, all)).toEqual({ uid: 'a', stato: 'confermato' })
    expect(pickPromotion({ ...event, richiedeApprovazione: true }, all)).toEqual({ uid: 'a', stato: 'richiesta' })
    expect(pickPromotion(event, [part('x', 'confermato', 1)])).toBeNull()
    expect(pickPromotion({ ...event, stato: 'annullato' }, all)).toBeNull()
    expect(pickPromotion(null, all)).toBeNull()
  })
  it('chi esce dalla lista o da richiesta non libera posti né promuove', () => {
    expect(decideWithdraw({ participation: part('a', 'inAttesa', 1), event, all })).toEqual({ ok: true, liberaPosto: false, promuovi: null })
  })
  it('decideWaitlist: solo con evento aperto, pieno e non iscritti', () => {
    const ctx = { event, uid: 'me', existing: null, confermati: 1 }
    expect(decideWaitlist(ctx).ok).toBe(true)
    expect(decideWaitlist({ ...ctx, confermati: 0 })).toEqual({ ok: false, motivo: 'Ci sono ancora posti: puoi partecipare' })
    expect(decideWaitlist({ ...ctx, uid: 'org' }).ok).toBe(false)
    expect(decideWaitlist({ ...ctx, existing: part('me', 'richiesta', 1) }).ok).toBe(false)
    expect(decideWaitlist({ ...ctx, blocked: true }).ok).toBe(false)
    expect(decideWaitlist({ ...ctx, event: { ...event, stato: 'annullato' } }).ok).toBe(false)
    expect(decideWaitlist({ ...ctx, event: null }).ok).toBe(false)
  })
})

describe('lista d\'attesa in memoria', () => {
  it('con l\'evento pieno ci si mette in lista, con le posizioni nell\'ordine di arrivo', async () => {
    const { parts, event: ev } = await setup()
    await joinEvent(parts, ev.id, 'anna')
    expect((await parts.joinWaitlist(ev.id, 'bruno')).stato).toBe('inAttesa')
    await parts.joinWaitlist(ev.id, 'carla')
    expect(await parts.waitlistPosition(ev.id, 'bruno')).toBe(1)
    expect(await parts.waitlistPosition(ev.id, 'carla')).toBe(2)
    expect(await parts.waitlistPosition(ev.id, 'anna')).toBeNull()
  })

  it('la lista non occupa posti: i confermati restano uno', async () => {
    const { parts, event: ev } = await setup()
    await joinEvent(parts, ev.id, 'anna')
    await parts.joinWaitlist(ev.id, 'bruno')
    expect(await parts.listConfirmed(ev.id)).toHaveLength(1)
  })

  it('con posti liberi la lista è rifiutata', async () => {
    const { parts, event: ev } = await setup({ maxPartecipanti: 2 })
    await joinEvent(parts, ev.id, 'anna')
    await expect(parts.joinWaitlist(ev.id, 'bruno')).rejects.toThrow('Ci sono ancora posti')
  })

  it('non ci si mette in lista due volte né da bloccati', async () => {
    const { parts, event: ev } = await setup({}, async (a, b) => a === 'org' && b === 'zeno')
    await joinEvent(parts, ev.id, 'anna')
    await parts.joinWaitlist(ev.id, 'bruno')
    await expect(parts.joinWaitlist(ev.id, 'bruno')).rejects.toThrow('Già iscritto')
    await expect(parts.joinWaitlist(ev.id, 'zeno')).rejects.toThrow('Non puoi partecipare')
  })

  it('quando un confermato si ritira il primo in lista diventa confermato, gli altri avanzano', async () => {
    const { parts, event: ev } = await setup()
    await joinEvent(parts, ev.id, 'anna')
    await parts.joinWaitlist(ev.id, 'bruno')
    await parts.joinWaitlist(ev.id, 'carla')
    await withdrawFromEvent(parts, ev.id, 'anna')
    expect((await parts.get(ev.id, 'bruno'))?.stato).toBe('confermato')
    expect(await parts.waitlistPosition(ev.id, 'carla')).toBe(1)
    expect(await parts.listConfirmed(ev.id)).toHaveLength(1) // i posti non superano il massimo
  })

  it('con approvazione il primo in lista diventa una richiesta (non occupa il posto)', async () => {
    const { parts, event: ev } = await setup({ richiedeApprovazione: true })
    await joinEvent(parts, ev.id, 'anna') // richiesta
    await respondToRequest(parts, ev.id, 'anna', 'org', 'accetta')
    await parts.joinWaitlist(ev.id, 'bruno')
    await withdrawFromEvent(parts, ev.id, 'anna')
    expect((await parts.get(ev.id, 'bruno'))?.stato).toBe('richiesta')
    expect(await parts.listConfirmed(ev.id)).toHaveLength(0)
  })

  it('chi esce dalla lista non cambia nessun altro e lascia avanzare chi sta dietro', async () => {
    const { parts, event: ev } = await setup()
    await joinEvent(parts, ev.id, 'anna')
    await parts.joinWaitlist(ev.id, 'bruno')
    await parts.joinWaitlist(ev.id, 'carla')
    await withdrawFromEvent(parts, ev.id, 'bruno')
    expect(await parts.waitlistPosition(ev.id, 'carla')).toBe(1)
    expect((await parts.get(ev.id, 'anna'))?.stato).toBe('confermato')
  })

  it('se si ritira chi non occupava un posto (richiesta/rifiutato) la lista non si muove', async () => {
    const { parts, event: ev } = await setup({ maxPartecipanti: 1 })
    await joinEvent(parts, ev.id, 'anna')
    await parts.joinWaitlist(ev.id, 'bruno')
    await parts.add(ev.id, 'dino', 'rifiutato')
    await withdrawFromEvent(parts, ev.id, 'dino')
    expect((await parts.get(ev.id, 'bruno'))?.stato).toBe('inAttesa')
  })

  it('un evento annullato non promuove nessuno', async () => {
    const { parts, event: ev } = await setup()
    await joinEvent(parts, ev.id, 'anna')
    await parts.joinWaitlist(ev.id, 'bruno')
    const events = (parts as unknown as { events: MemoryEventRepository }).events
    await events.update(ev.id, { stato: 'annullato' })
    await withdrawFromEvent(parts, ev.id, 'anna')
    expect((await parts.get(ev.id, 'bruno'))?.stato).toBe('inAttesa')
  })
})
