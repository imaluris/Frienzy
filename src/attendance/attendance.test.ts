import { createMemoryServices } from '../data/memory/createMemoryServices'
import type { NewEvent } from '../domain/event'
import { decideMarkPresence, decideRating, hasEnded } from './decide'
import { MIN_MARKED, reliability, starsSummary } from './reliability'

const NOW = new Date('2026-11-10T12:00:00Z')
const past = new Date('2026-11-09T20:00:00Z')
const future = new Date('2026-11-12T20:00:00Z')
const event = (over = {}) => ({ organizzatoreId: 'org', stato: 'aperto' as const, dataOra: past, ...over })
const confirmed = { stato: 'confermato' as const }

describe('decideMarkPresence', () => {
  const base = { event: event(), actorUid: 'org', target: confirmed, now: NOW }
  it('ok per organizzatore, evento passato, confermato', () => expect(decideMarkPresence(base)).toEqual({ ok: true }))
  it('rifiuta chi non organizza', () => expect(decideMarkPresence({ ...base, actorUid: 'ada' })).toMatchObject({ ok: false }))
  it('rifiuta prima della data, se annullato, evento mancante', () => {
    expect(decideMarkPresence({ ...base, event: event({ dataOra: future }) })).toMatchObject({ ok: false })
    expect(decideMarkPresence({ ...base, event: event({ stato: 'annullato' }) })).toMatchObject({ ok: false })
    expect(decideMarkPresence({ ...base, event: null })).toMatchObject({ ok: false })
  })
  it('rifiuta chi non è confermato', () => {
    for (const stato of ['richiesta', 'rifiutato', 'inAttesa'] as const) expect(decideMarkPresence({ ...base, target: { stato } })).toMatchObject({ ok: false })
    expect(decideMarkPresence({ ...base, target: null })).toMatchObject({ ok: false })
  })
})

describe('decideRating', () => {
  const base = { event: event(), uid: 'ada', mine: confirmed, existing: null, rating: { stelle: 4, etichetta: 'Puntuale' as const }, now: NOW }
  it('ok per un confermato dopo la data', () => expect(decideRating(base)).toEqual({ ok: true }))
  it('rifiuta prima della data e se annullato', () => {
    expect(decideRating({ ...base, event: event({ dataOra: future }) })).toMatchObject({ ok: false })
    expect(decideRating({ ...base, event: event({ stato: 'annullato' }) })).toMatchObject({ ok: false })
  })
  it("rifiuta l'organizzatore e chi non è confermato", () => {
    expect(decideRating({ ...base, uid: 'org' })).toMatchObject({ ok: false })
    expect(decideRating({ ...base, mine: { stato: 'richiesta' } })).toMatchObject({ ok: false })
    expect(decideRating({ ...base, mine: null })).toMatchObject({ ok: false })
  })
  it('rifiuta un secondo voto, stelle fuori da 1-5 o non intere, etichetta inventata', () => {
    expect(decideRating({ ...base, existing: { ...base.rating, eventId: 'e', uid: 'ada', organizzatoreId: 'org', creatoIl: NOW } })).toMatchObject({ ok: false })
    for (const stelle of [0, 6, 2.5, -1]) expect(decideRating({ ...base, rating: { stelle, etichetta: '' } })).toMatchObject({ ok: false })
    expect(decideRating({ ...base, rating: { stelle: 3, etichetta: 'Boh' as never } })).toMatchObject({ ok: false })
    expect(decideRating({ ...base, rating: { stelle: 3, etichetta: '' } })).toEqual({ ok: true })
  })
  it("hasEnded: l'istante esatto dell'inizio conta come iniziato", () => expect(hasEnded({ dataOra: NOW }, NOW)).toBe(true))
})

describe('reliability e starsSummary', () => {
  const marks = (...s: ('presente' | 'assente')[]) => s.map((stato) => ({ stato }))
  it('sotto la soglia non dà la percentuale ma conta gli eventi fatti', () => {
    expect(reliability(marks('presente', 'assente'))).toEqual({ done: 1, marked: 2, percent: null })
    expect(MIN_MARKED).toBe(3)
  })
  it('percentuale arrotondata', () => {
    expect(reliability(marks('presente', 'presente', 'assente'))).toMatchObject({ done: 2, percent: 67 })
    expect(reliability(marks('assente', 'assente', 'assente'))).toMatchObject({ done: 0, percent: 0 })
    expect(reliability(marks('presente', 'presente', 'presente', 'presente'))).toMatchObject({ percent: 100 })
  })
  it('nessuna presenza segnata', () => expect(reliability([])).toEqual({ done: 0, marked: 0, percent: null }))
  it('media dei voti con un decimale', () => {
    expect(starsSummary([])).toEqual({ count: 0, average: null })
    expect(starsSummary([{ stelle: 5 }, { stelle: 4 }, { stelle: 4 }])).toEqual({ count: 3, average: 4.3 })
  })
})

describe('MemoryAttendanceRepository', () => {
  const place = { indirizzo: 'Via Roma 1', lat: 45.45, lng: 9.17 }
  const newEvent = (dataOra: Date): NewEvent => ({
    organizzatoreId: 'org', tipo: 'cena', titolo: 'Cena', descrizione: '', dataOra, zonaNome: 'Navigli',
    latApprossimata: 45.45, lngApprossimata: 9.17, geohash: 'u0nd8k', maxPartecipanti: 5, richiedeApprovazione: false,
  })
  async function setup(dataOra = new Date(Date.now() - 3600_000)) {
    const services = createMemoryServices()
    const e = await services.events.create(newEvent(dataOra), place)
    await services.participations.add(e.id, 'ada', 'confermato')
    await services.participations.add(e.id, 'bea', 'richiesta')
    return { a: services.attendance, e }
  }

  it("l'organizzatore segna e corregge la presenza; si legge per evento e per persona", async () => {
    const { a, e } = await setup()
    await a.markPresence(e.id, 'org', 'ada', 'assente')
    await a.markPresence(e.id, 'org', 'ada', 'presente')
    expect((await a.listPresenceByEvent(e.id)).map((p) => p.stato)).toEqual(['presente'])
    expect(await a.listPresenceByUser('ada')).toHaveLength(1)
    expect(await a.listPresenceByUser('bea')).toHaveLength(0)
  })

  it('non segna chi non organizza, chi non è confermato, né prima della data', async () => {
    const { a, e } = await setup()
    await expect(a.markPresence(e.id, 'ada', 'ada', 'presente')).rejects.toThrow('Solo chi organizza')
    await expect(a.markPresence(e.id, 'org', 'bea', 'presente')).rejects.toThrow('confermati')
    const future = await setup(new Date(Date.now() + 86_400_000))
    await expect(future.a.markPresence(future.e.id, 'org', 'ada', 'presente')).rejects.toThrow('dopo')
  })

  it('un solo voto per persona; lo legge l\'organizzatore', async () => {
    const { a, e } = await setup()
    await a.rate(e.id, 'ada', { stelle: 5, etichetta: 'Accogliente' })
    await expect(a.rate(e.id, 'ada', { stelle: 1, etichetta: '' })).rejects.toThrow('già votato')
    await expect(a.rate(e.id, 'bea', { stelle: 3, etichetta: '' })).rejects.toThrow('confermati')
    expect((await a.getRating(e.id, 'ada'))?.stelle).toBe(5)
    expect(await a.getRating(e.id, 'bea')).toBeNull()
    expect(await a.listRatingsForOrganizer('org')).toHaveLength(1)
    expect(await a.listRatingsForOrganizer('ada')).toHaveLength(0)
  })

  it('niente voti prima della data', async () => {
    const { a, e } = await setup(new Date(Date.now() + 86_400_000))
    await expect(a.rate(e.id, 'ada', { stelle: 4, etichetta: '' })).rejects.toThrow('dopo l\'evento')
  })
})
