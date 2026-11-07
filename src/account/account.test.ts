import { createMemoryServices } from '../data/memory/createMemoryServices'
import type { FrienzyEvent, NewEvent } from '../domain/event'
import { AccountDeletionError, DELETION_STEPS, countEventsToCancel, deleteAccount, type DeletionStep } from './deleteAccount'
import { planDeletion } from './deletionPlan'

const DAY = 86400000
const now = new Date('2026-11-02T10:00:00Z')
const place = { indirizzo: 'Via Roma 1', lat: 45.45, lng: 9.17 }
const base: NewEvent = {
  organizzatoreId: 'org', tipo: 'cena', titolo: 'Cena', descrizione: '', dataOra: new Date(now.getTime() + 3 * DAY), zonaNome: 'Navigli',
  latApprossimata: 45.45, lngApprossimata: 9.17, geohash: 'u0nd8k', maxPartecipanti: 4, richiedeApprovazione: false,
}
const profile = (uid: string, nome: string) => ({ uid, nome, dataNascita: new Date('1990-01-01T00:00:00Z'), bio: '', interessi: [], fotoUrl: '', creatoIl: new Date() })
const fakeEvent = (over: Partial<FrienzyEvent>): FrienzyEvent => ({ ...base, id: 'x', stato: 'aperto', creatoIl: now, ...over })

describe('piano di eliminazione (funzione pura)', () => {
  it("annulla solo gli eventi futuri e aperti che organizzo; i messaggi si cancellano anche in quelli passati", () => {
    const events = [
      fakeEvent({ id: 'futuro', organizzatoreId: 'me' }),
      fakeEvent({ id: 'passato', organizzatoreId: 'me', dataOra: new Date(now.getTime() - DAY) }),
      fakeEvent({ id: 'annullato', organizzatoreId: 'me', stato: 'annullato' }),
      fakeEvent({ id: 'altrui', organizzatoreId: 'altro' }),
    ]
    const plan = planDeletion({ uid: 'me', events, participations: [], now })
    expect(plan.eventsToCancel).toEqual(['futuro'])
    expect(plan.chatEventIds.sort()).toEqual(['annullato', 'futuro', 'passato'])
    expect(plan.withdrawEventIds).toEqual([])
  })

  it('chi partecipa si ritira da tutto, ma la chat si pulisce solo dove è confermato', () => {
    const p = (eventId: string, stato: 'confermato' | 'richiesta' | 'rifiutato', uid = 'me') => ({ eventId, uid, stato, creatoIl: now })
    const plan = planDeletion({ uid: 'me', events: [], participations: [p('a', 'confermato'), p('b', 'richiesta'), p('c', 'rifiutato'), p('d', 'confermato', 'altro')], now })
    expect(plan.withdrawEventIds).toEqual(['a', 'b', 'c'])
    expect(plan.chatEventIds).toEqual(['a'])
    expect(plan.eventsToCancel).toEqual([])
  })
})

async function world() {
  const services = createMemoryServices()
  const me = await services.auth.register('ada@example.com', 'segreta1')
  await services.users.save(profile(me, 'Ada'))
  await services.users.save(profile('org', 'Olga'))
  await services.users.save(profile('bea', 'Bea'))
  const mine = await services.events.create({ ...base, organizzatoreId: me, titolo: 'Mio aperitivo' }, place)
  await services.participations.add(mine.id, 'bea', 'confermato')
  const theirs = await services.events.create(base, place)
  await services.participations.add(theirs.id, me, 'confermato')
  await services.participations.add(theirs.id, 'bea', 'confermato')
  await services.chat.send(theirs.id, me, 'Ci sono!')
  await services.chat.send(theirs.id, 'bea', 'Anch\'io')
  await services.chat.send(mine.id, me, 'Benvenuti')
  await services.saved.add(me, theirs.id)
  await services.blocks.block(me, 'bea')
  return { services, me, mine, theirs }
}

const messagesOf = (services: Awaited<ReturnType<typeof world>>['services'], eventId: string, uid: string) =>
  new Promise<string[]>((resolve) => { const stop = services.chat.subscribe(eventId, uid, (m) => { stop(); resolve(m.map((x) => x.testo)) }, () => resolve([])) })

describe("eliminazione dell'account", () => {
  it('con la password giusta cancella tutto, annulla i miei eventi futuri e scollega', async () => {
    const { services, me, mine, theirs } = await world()
    expect(await countEventsToCancel(services, now)).toBe(1)
    await deleteAccount(services, 'segreta1', now)

    expect(services.auth.currentUid()).toBeNull()
    expect(await services.users.getById(me)).toBeNull()
    expect(await services.users.getById('bea')).not.toBeNull() // gli altri non si toccano
    expect((await services.events.getById(mine.id))?.stato).toBe('annullato')
    expect((await services.events.getById(theirs.id))?.stato).toBe('aperto')
    expect(await services.participations.listByUser(me)).toEqual([])
    expect(await services.participations.listConfirmed(theirs.id)).toHaveLength(1) // resta Bea: il posto si è liberato
    expect(await services.saved.listIds(me)).toEqual([])
    expect(await services.blocks.listBlockedBy(me)).toEqual([])
    expect(await messagesOf(services, theirs.id, 'bea')).toEqual(["Anch'io"]) // solo i messaggi degli altri restano
    await expect(services.auth.login('ada@example.com', 'segreta1')).rejects.toMatchObject({ code: 'auth/invalid-credential' })
  })

  it('con la password sbagliata non tocca nulla', async () => {
    const { services, me, mine } = await world()
    const error = await deleteAccount(services, 'sbagliata', now).catch((e) => e)
    expect(error).toBeInstanceOf(AccountDeletionError)
    expect(error.step).toBe('password')
    expect(services.auth.currentUid()).toBe(me)
    expect(await services.users.getById(me)).not.toBeNull()
    expect((await services.events.getById(mine.id))?.stato).toBe('aperto')
    expect(await services.saved.listIds(me)).toHaveLength(1)
  })

  it("le fasi vanno nell'ordine previsto, con l'accesso per ultimo", async () => {
    const { services } = await world()
    const seen: DeletionStep[] = []
    await deleteAccount(services, 'segreta1', now, (s) => seen.push(s))
    expect(seen).toEqual([...DELETION_STEPS])
    expect(seen.at(-1)).toBe('account')
  })

  it('solo partecipante, senza eventi propri: nessun evento annullato', async () => {
    const services = createMemoryServices()
    const me = await services.auth.register('ada@example.com', 'segreta1')
    await services.users.save(profile(me, 'Ada'))
    const event = await services.events.create(base, place)
    await services.participations.add(event.id, me, 'richiesta')
    expect(await countEventsToCancel(services, now)).toBe(0)
    await deleteAccount(services, 'segreta1', now)
    expect((await services.events.getById(event.id))?.stato).toBe('aperto')
    expect(await services.participations.get(event.id, me)).toBeNull()
  })

  it('se una fase fallisce si ferma, dice quale, e riprovare finisce il lavoro', async () => {
    const { services, me } = await world()
    const original = services.users.delete.bind(services.users)
    let fail = true
    services.users.delete = async (uid) => { if (fail) throw new Error('rete assente'); return original(uid) }
    const error = await deleteAccount(services, 'segreta1', now).catch((e) => e)
    expect(error.step).toBe('profilo')
    expect(services.auth.currentUid()).toBe(me) // l'accesso c'è ancora: si può riprovare
    expect(await services.saved.listIds(me)).toEqual([]) // le fasi precedenti restano fatte
    fail = false
    await deleteAccount(services, 'segreta1', now)
    expect(services.auth.currentUid()).toBeNull()
    expect(await services.users.getById(me)).toBeNull()
  })
})
