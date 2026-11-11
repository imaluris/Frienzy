import { describe, expect, it } from 'vitest'
import { applyBaseline, mergeSent } from './baseline'
import type { InviteCandidate } from './invites'
import { plan, type PlanInput } from './plan'
import type { Contact, EventLite } from './types'

const HOUR = 3_600_000
const now = new Date('2030-05-10T10:00:00Z')
const ev = (over: Partial<EventLite> = {}): EventLite => ({
  id: 'e1', titolo: 'Cena in terrazza', tipo: 'cena', dataOra: new Date(now.getTime() + 48 * HOUR), zonaNome: 'Navigli',
  organizzatoreId: 'org', geohash: 'u0nd9h', stato: 'aperto', richiedeApprovazione: true, creatoIl: new Date(now.getTime() - 72 * HOUR), ...over,
})
const contact = (uid: string, prefs: Contact['prefs'] = {}, token = `tok-${uid}`): Contact => ({ uid, prefs, device: { token } })
const cand = (uid: string, over: Partial<InviteCandidate> = {}): InviteCandidate => ({ ...contact(uid, { inviti: true }), interessi: ['cena'], zona: 'u0nd9', ...over })

const input = (over: Partial<PlanInput> = {}): PlanInput => ({
  now, events: [ev()], participants: {}, names: { bruno: 'Bruno' }, contacts: { org: contact('org'), bruno: contact('bruno') },
  candidates: [], blocks: [], sent: new Set(), ...over,
})
const keys = (i: PlanInput) => plan(i).map((s) => s.key)

describe('piano: nuove richieste', () => {
  const asked = { e1: [{ uid: 'bruno', stato: 'richiesta' }] }
  it('avvisa l\'organizzatore, una volta sola', () => {
    const [s] = plan(input({ participants: asked }))
    expect(s).toMatchObject({ key: 'req:e1:bruno', pref: 'richieste' })
    expect(s.recipients.map((r) => r.uid)).toEqual(['org'])
    expect(s.message.body).toContain('Bruno')
    expect(keys(input({ participants: asked, sent: new Set(['req:e1:bruno']) }))).toEqual([])
  })
  it('rispetta la preferenza spenta e l\'assenza di telefono', () => {
    expect(keys(input({ participants: asked, contacts: { org: contact('org', { richieste: false }) } }))).toEqual([])
    expect(keys(input({ participants: asked, contacts: { org: contact('org', {}, '') } }))).toEqual([])
  })
  it('nessun avviso per eventi annullati o liberi (senza approvazione)', () => {
    expect(keys(input({ participants: asked, events: [ev({ stato: 'annullato' })] }))).toEqual([])
    expect(keys(input({ participants: asked, events: [ev({ richiedeApprovazione: false })] }))).toEqual([])
  })
})

describe('piano: risposte', () => {
  it('accettata o rifiutata → chi aveva chiesto; chiave diversa per esito', () => {
    const yes = plan(input({ participants: { e1: [{ uid: 'bruno', stato: 'confermato' }] } }))
    const no = plan(input({ participants: { e1: [{ uid: 'bruno', stato: 'rifiutato' }] } }))
    expect(yes[0]).toMatchObject({ key: 'ans:e1:bruno:confermato', pref: 'risposte' })
    expect(yes[0].recipients.map((r) => r.uid)).toEqual(['bruno'])
    expect(no[0].key).toBe('ans:e1:bruno:rifiutato')
  })
  it('evento libero: nessuna risposta; richiesta ancora in attesa: nessuna risposta', () => {
    expect(keys(input({ events: [ev({ richiedeApprovazione: false })], participants: { e1: [{ uid: 'bruno', stato: 'confermato' }] } }))).toEqual([])
    expect(keys(input({ participants: { e1: [{ uid: 'bruno', stato: 'inAttesa' }] } }))).toEqual([])
  })
})

describe('piano: inviti', () => {
  const nuovo = ev({ id: 'n', richiedeApprovazione: false, creatoIl: new Date(now.getTime() - 2 * HOUR) })
  it('invita chi ha interessi e zona giusti, un invio per persona', () => {
    const out = plan(input({ events: [nuovo], candidates: [cand('a'), cand('b')] }))
    expect(out.map((s) => s.key)).toEqual(['inv:n:a', 'inv:n:b'])
    expect(out.every((s) => s.pref === 'inviti' && s.recipients.length === 1)).toBe(true)
  })
  it('solo eventi creati nelle ultime 24 ore', () => {
    expect(keys(input({ events: [{ ...nuovo, creatoIl: new Date(now.getTime() - 30 * HOUR) }], candidates: [cand('a')] }))).toEqual([])
  })
  it('esclude organizzatore, iscritti e bloccati (nei due sensi)', () => {
    const out = keys(input({
      events: [nuovo], candidates: [cand('org'), cand('iscritto'), cand('b1'), cand('b2'), cand('ok')],
      participants: { n: [{ uid: 'iscritto', stato: 'richiesta' }] },
      blocks: [{ blockerId: 'org', blockedId: 'b1' }, { blockerId: 'b2', blockedId: 'org' }],
    }))
    expect(out).toEqual(['inv:n:ok'])
  })
  it('non ripete un invito già mandato', () => {
    expect(keys(input({ events: [nuovo], candidates: [cand('a')], sent: new Set(['inv:n:a']) }))).toEqual([])
  })
})

describe('piano: nessun doppione', () => {
  it('ogni chiave compare una volta sola, anche con dati ripetuti', () => {
    const e = ev({ id: 'z', richiedeApprovazione: true, creatoIl: new Date(now.getTime() - HOUR) })
    const out = keys(input({ events: [e, e], participants: { z: [{ uid: 'bruno', stato: 'richiesta' }] }, candidates: [cand('a'), cand('a')] }))
    expect(new Set(out).size).toBe(out.length)
  })
})

describe('primo avvio (baseline) e memoria delle chiavi', () => {
  const sends = plan(input({ participants: { e1: [{ uid: 'bruno', stato: 'richiesta' }] } }))
  it('al primo avvio registra tutto senza inviare nulla', () => {
    expect(applyBaseline(sends, true)).toEqual({ toSend: [], toRecord: ['req:e1:bruno'] })
  })
  it('dopo il primo avvio invia e registra', () => {
    const r = applyBaseline(sends, false)
    expect(r.toSend).toHaveLength(1)
    expect(r.toRecord).toEqual(['req:e1:bruno'])
  })
  it('mergeSent aggiunge le nuove chiavi, non cambia l\'ora delle vecchie e dimentica quelle di oltre 60 giorni', () => {
    const old = now.getTime() - 61 * 86_400_000
    const recent = now.getTime() - 3_600_000
    const merged = mergeSent({ vecchia: old, recente: recent }, ['recente', 'nuova'], now)
    expect(merged).toEqual({ recente: recent, nuova: now.getTime() })
  })
})
