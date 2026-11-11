import { describe, expect, it } from 'vitest'
import { inviteTargets, type InviteCandidate } from './invites'
import { answerMessage, inviteMessage, requestMessage } from './messages'
import { tokensFor } from './recipients'
import type { EventLite } from './types'

const HOUR = 3_600_000
const now = new Date('2030-05-10T10:00:00Z')
const ev = (over: Partial<EventLite> = {}): EventLite => ({
  id: 'e1', titolo: 'Aperitivo ai Navigli', tipo: 'aperitivo', dataOra: new Date(now.getTime() + 24 * HOUR - 10 * 60_000),
  zonaNome: 'Navigli', organizzatoreId: 'org', geohash: 'u0nd9h', stato: 'aperto', richiedeApprovazione: false, creatoIl: new Date(now.getTime() - HOUR), ...over,
})

describe('destinatari', () => {
  it('rispetta le preferenze e serve un token', () => {
    const contacts = [
      { uid: 'a', prefs: {}, device: { token: 't1' } },
      { uid: 'b', prefs: { richieste: false }, device: { token: 't2' } },
      { uid: 'c', prefs: {}, device: {} },
      { uid: 'd', prefs: {}, device: { token: 't1' } },
    ]
    expect(tokensFor(contacts, 'richieste')).toEqual(['t1'])
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
  it('la richiesta dice chi e a cosa; la risposta cambia con l\'esito', () => {
    expect(requestMessage(ev(), 'Bruno').body).toBe('Bruno vorrebbe partecipare a "Aperitivo ai Navigli".')
    expect(answerMessage(ev(), 'confermato').title).toContain('Sei dentro')
    expect(answerMessage(ev(), 'rifiutato').title).toBe('Richiesta non accettata')
  })
})
