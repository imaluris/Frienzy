import { createMemoryServices } from '../data/memory/createMemoryServices'
import type { Participation } from '../domain/participation'
import { DEFAULT_PREFS } from '../notifications/prefs'
import { makeEvent, NOW } from '../test/alertFixtures'
import { buildAlerts, type AlertsInput } from './buildAlerts'
import { loadAlerts } from './loadAlerts'
import { SEEN_MAX } from './seenRepository'
import { unseen, withSeen } from './seenState'

const part = (eventId: string, stato: Participation['stato']): Participation => ({ eventId, uid: 'me', stato, creatoIl: NOW })
const input = (over: Partial<AlertsInput> = {}): AlertsInput => ({
  uid: 'me', interessi: ['aperitivo'], prefs: { ...DEFAULT_PREFS, inviti: true }, now: NOW,
  events: [], myParticipations: [], pendingCounts: {}, position: null, ...over,
})

describe('avvisi: richieste in attesa', () => {
  const mine = makeEvent({ id: 'mio', organizzatoreId: 'me' })
  it('un avviso per ogni mio evento aperto con richieste, col numero', () => {
    const [a] = buildAlerts(input({ events: [mine], pendingCounts: { mio: 2 } }))
    expect(a).toMatchObject({ kind: 'richieste', eventId: 'mio', title: '2 richieste in attesa', key: 'req:mio:2' })
  })
  it('con una sola richiesta il testo è al singolare; zero richieste = nessun avviso', () => {
    expect(buildAlerts(input({ events: [mine], pendingCounts: { mio: 1 } }))[0].title).toBe('1 richiesta in attesa')
    expect(buildAlerts(input({ events: [mine], pendingCounts: { mio: 0 } }))).toEqual([])
  })
  it('se il numero cambia la chiave cambia (torna "nuovo")', () => {
    const k = (n: number) => buildAlerts(input({ events: [mine], pendingCounts: { mio: n } }))[0].key
    expect(k(1)).not.toBe(k(2))
  })
  it('eventi annullati o passati non generano avvisi', () => {
    expect(buildAlerts(input({ events: [{ ...mine, stato: 'annullato' }], pendingCounts: { mio: 3 } }))).toEqual([])
  })
})

describe('avvisi: risposte alle mie richieste', () => {
  const ev = makeEvent({ id: 'x', richiedeApprovazione: true })
  it('accettata e rifiutata, solo per eventi con approvazione', () => {
    const yes = buildAlerts(input({ events: [ev], myParticipations: [part('x', 'confermato')] }))
    const no = buildAlerts(input({ events: [ev], myParticipations: [part('x', 'rifiutato')] }))
    expect(yes[0]).toMatchObject({ kind: 'risposte', title: 'Richiesta accettata', key: 'ans:x:confermato' })
    expect(no[0]).toMatchObject({ title: 'Richiesta non accettata', key: 'ans:x:rifiutato' })
    expect(buildAlerts(input({ events: [{ ...ev, richiedeApprovazione: false }], myParticipations: [part('x', 'confermato')] }))).toEqual([])
  })
  it('richiesta ancora in attesa o lista d\'attesa: nessun avviso', () => {
    expect(buildAlerts(input({ events: [ev], myParticipations: [part('x', 'richiesta'), part('x', 'inAttesa')] }))).toEqual([])
  })
})

describe('avvisi: inviti', () => {
  const nuovo = makeEvent({ id: 'n', tipo: 'aperitivo' })
  it('evento nuovo nei miei interessi, a cui non partecipo', () => {
    expect(buildAlerts(input({ events: [nuovo] }))[0]).toMatchObject({ kind: 'inviti', key: 'inv:n' })
  })
  it('non invita per tipi che non mi interessano, eventi miei, già iscritti o più vecchi di 7 giorni', () => {
    expect(buildAlerts(input({ events: [{ ...nuovo, tipo: 'sport' }] }))).toEqual([])
    expect(buildAlerts(input({ events: [{ ...nuovo, organizzatoreId: 'me' }] }))).toEqual([])
    expect(buildAlerts(input({ events: [nuovo], myParticipations: [part('n', 'richiesta')] }))).toEqual([])
    expect(buildAlerts(input({ events: [{ ...nuovo, creatoIl: new Date(NOW.getTime() - 8 * 86_400_000) }] }))).toEqual([])
  })
  it('con la posizione nota tiene solo gli eventi entro 25 km; senza posizione non controlla', () => {
    const milano = { lat: 45.46, lng: 9.19 }
    expect(buildAlerts(input({ events: [nuovo], position: milano }))).toHaveLength(1)
    expect(buildAlerts(input({ events: [nuovo], position: { lat: 41.9, lng: 12.5 } }))).toEqual([]) // Roma
  })
})

describe('avvisi: preferenze e ordine', () => {
  it('un interruttore spento nasconde quel tipo di avvisi', () => {
    const events = [makeEvent({ id: 'n' }), makeEvent({ id: 'mio', organizzatoreId: 'me' })]
    const base = input({ events, pendingCounts: { mio: 1 } })
    expect(buildAlerts(base).map((a) => a.kind).sort()).toEqual(['inviti', 'richieste'])
    expect(buildAlerts({ ...base, prefs: { ...base.prefs, inviti: false } }).map((a) => a.kind)).toEqual(['richieste'])
    expect(buildAlerts({ ...base, prefs: { ...base.prefs, richieste: false } }).map((a) => a.kind)).toEqual(['inviti'])
  })
  it('dal più recente al più vecchio', () => {
    const old = makeEvent({ id: 'old', creatoIl: new Date(NOW.getTime() - 5 * 86_400_000) })
    const recent = makeEvent({ id: 'recent', creatoIl: new Date(NOW.getTime() - 1000) })
    expect(buildAlerts(input({ events: [old, recent] })).map((a) => a.eventId)).toEqual(['recent', 'old'])
  })
})

describe('avvisi visti', () => {
  const alerts = ['a', 'b', 'c'].map((key) => ({ key, kind: 'inviti' as const, eventId: key, title: '', body: '', at: NOW }))
  it('unseen toglie quelli visti', () => {
    expect(unseen(alerts, new Set(['b'])).map((a) => a.key)).toEqual(['a', 'c'])
  })
  it('withSeen aggiunge senza doppioni e tiene al massimo 200 chiavi (le più recenti)', () => {
    expect(withSeen(['a'], alerts)).toEqual(['a', 'b', 'c'])
    const many = Array.from({ length: SEEN_MAX }, (_, i) => `k${i}`)
    const next = withSeen(many, alerts)
    expect(next).toHaveLength(SEEN_MAX)
    expect(next.slice(-3)).toEqual(['a', 'b', 'c'])
    expect(next).not.toContain('k0')
  })
})

describe('caricamento degli avvisi', () => {
  it('legge i dati, ignora gli eventi di persone bloccate e ricorda i visti', async () => {
    const services = createMemoryServices()
    const place = { indirizzo: 'x', lat: 45.45, lng: 9.17 }
    const base = { ...makeEvent({ dataOra: new Date(Date.now() + 5 * 86_400_000) }), id: undefined } as never
    const buono = await services.events.create({ ...(base as object), titolo: 'Buono', organizzatoreId: 'org' } as never, place)
    await services.events.create({ ...(base as object), titolo: 'Da bloccato', organizzatoreId: 'bad' } as never, place)
    await services.blocks.block('me', 'bad')
    await services.seen.save('me', ['inv:vecchio'])
    await services.notifications.savePrefs('me', { ...DEFAULT_PREFS, inviti: true })
    const loaded = await loadAlerts(services, { uid: 'me', interessi: ['aperitivo'], position: null })
    expect(loaded.alerts.map((a) => a.eventId)).toEqual([buono.id])
    expect(loaded.seen).toEqual(['inv:vecchio'])
  })
})
