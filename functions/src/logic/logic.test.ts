import { describe, expect, it } from 'vitest'
import { inviteTargets, type InviteCandidate } from './invites'
import { inviteMessage, reminderMessage } from './messages'
import { dueReminders } from './reminders'
import { reminderUids, tokensFor } from './recipients'
import type { EventLite } from './types'

const HOUR = 3_600_000
const now = new Date('2030-05-10T10:00:00Z')
const ev = (over: Partial<EventLite> = {}): EventLite => ({
  id: 'e1', titolo: 'Aperitivo ai Navigli', tipo: 'aperitivo', dataOra: new Date(now.getTime() + 24 * HOUR - 10 * 60_000),
  zonaNome: 'Navigli', organizzatoreId: 'org', geohash: 'u0nd9h', stato: 'aperto', ...over,
})

describe('promemoria dovuti', () => {
  it('24 ore prima: dentro la finestra sì, troppo presto no', () => {
    expect(dueReminders([ev()], {}, now).map((d) => d.kind)).toEqual(['24h'])
    expect(dueReminders([ev({ dataOra: new Date(now.getTime() + 30 * HOUR) })], {}, now)).toEqual([])
  })
  it('2 ore prima', () => {
    const e = ev({ dataOra: new Date(now.getTime() + 90 * 60_000) })
    expect(dueReminders([e], {}, now).map((d) => d.kind)).toEqual(['2h'])
  })
  it('non ripete quello già inviato', () => {
    expect(dueReminders([ev()], { e1: { h24: true } }, now)).toEqual([])
  })
  it('eventi annullati o già passati non hanno promemoria', () => {
    expect(dueReminders([ev({ stato: 'annullato' })], {}, now)).toEqual([])
    expect(dueReminders([ev({ dataOra: new Date(now.getTime() - HOUR) })], {}, now)).toEqual([])
  })
  it('un evento creato 5 ore prima non riceve il promemoria "domani"', () => {
    expect(dueReminders([ev({ dataOra: new Date(now.getTime() + 5 * HOUR) })], {}, now)).toEqual([])
  })
})

describe('destinatari', () => {
  it('promemoria: organizzatore e confermati, nessun altro', () => {
    const ps = [{ uid: 'a', stato: 'confermato' }, { uid: 'b', stato: 'richiesta' }, { uid: 'c', stato: 'inAttesa' }, { uid: 'd', stato: 'rifiutato' }]
    expect(reminderUids('org', ps).sort()).toEqual(['a', 'org'])
  })
  it('rispetta le preferenze e serve un token', () => {
    const contacts = [
      { uid: 'a', prefs: {}, device: { token: 't1' } },
      { uid: 'b', prefs: { promemoria: false }, device: { token: 't2' } },
      { uid: 'c', prefs: {}, device: {} },
      { uid: 'd', prefs: {}, device: { token: 't1' } },
    ]
    expect(tokensFor(contacts, 'promemoria')).toEqual(['t1'])
    expect(tokensFor(contacts, 'inviti')).toEqual([])
  })
})

describe('inviti', () => {
  const cand = (uid: string, over: Partial<InviteCandidate> = {}): InviteCandidate => ({
    uid, prefs: { inviti: true }, device: { token: `tok-${uid}` }, interessi: ['aperitivo'], zona: 'u0nd9', ...over,
  })
  const run = (candidates: InviteCandidate[], excluded: string[] = []) =>
    inviteTargets({ event: ev(), candidates, excluded: new Set(excluded) }).map((c) => c.uid)

  it('invita chi ha interessi e zona giusti', () => expect(run([cand('a')])).toEqual(['a']))
  it('salta interessi diversi, inviti spenti (anche di default), senza token', () => {
    expect(run([cand('a', { interessi: ['cena'] }), cand('b', { prefs: { inviti: false } }), cand('c', { prefs: {} }), cand('d', { device: {} })])).toEqual([])
  })
  it('salta organizzatore, già iscritti e bloccati', () => {
    expect(run([cand('org'), cand('x'), cand('y')], ['x', 'y'])).toEqual([])
  })
  it('salta chi vive lontano o ha una zona illeggibile', () => {
    expect(run([cand('lontano', { zona: 'sr2yk' }), cand('rotta', { zona: '??' }), cand('vuota', { zona: '' })])).toEqual([])
  })
  it('i più vicini per primi e al massimo `max`', () => {
    const out = inviteTargets({ event: ev(), candidates: [cand('b', { zona: 'u0nd8' }), cand('a', { zona: 'u0nd9' }), cand('c', { zona: 'u0nd9' })], excluded: new Set(), max: 2 })
    expect(out).toHaveLength(2)
    expect(out[0].uid).not.toBe('b')
  })
})

describe('messaggi', () => {
  it("l'invito contiene solo dati dell'evento", () => {
    const m = inviteMessage(ev())
    expect(m.body).toBe('Aperitivo ai Navigli · Navigli')
    expect(JSON.stringify(m)).not.toContain('org')
  })
  it('il promemoria dice quando, con ora italiana', () => {
    const m = reminderMessage(ev({ dataOra: new Date('2030-05-11T16:00:00Z') }), '24h')
    expect(m.body).toContain('domani alle 18:00')
  })
})
