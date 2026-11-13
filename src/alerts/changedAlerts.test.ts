import type { Participation } from '../domain/participation'
import { DEFAULT_PREFS } from '../notifications/prefs'
import { makeEvent, NOW } from '../test/alertFixtures'
import { buildAlerts, type AlertsInput } from './buildAlerts'

const part = (eventId: string, stato: Participation['stato']): Participation => ({ eventId, uid: 'me', stato, creatoIl: NOW })
const input = (over: Partial<AlertsInput> = {}): AlertsInput => ({
  uid: 'me', interessi: [], prefs: { ...DEFAULT_PREFS }, now: NOW,
  events: [], myParticipations: [], pendingCounts: {}, position: null, ...over,
})
const edited = (over = {}) => makeEvent({ id: 'x', titolo: 'Cena', modificatoIl: new Date(NOW.getTime() - 3_600_000), modifiche: ['dataOra', 'maxPartecipanti'], ...over })

describe('avvisi: evento modificato', () => {
  it('chi è confermato o ha chiesto di partecipare vede cosa è cambiato', () => {
    for (const stato of ['confermato', 'richiesta'] as const) {
      const [a] = buildAlerts(input({ events: [edited()], myParticipations: [part('x', stato)] }))
      expect(a).toMatchObject({ kind: 'risposte', eventId: 'x', title: '"Cena" è cambiato', body: "L'organizzatore ha aggiornato data e ora e i posti." })
    }
  })
  it('la chiave cambia a ogni modifica', () => {
    const key = (ms: number) => buildAlerts(input({ events: [edited({ modificatoIl: new Date(ms) })], myParticipations: [part('x', 'confermato')] }))[0].key
    expect(key(NOW.getTime() - 1000)).not.toBe(key(NOW.getTime() - 2000))
  })
  it('niente avviso a chi non è iscritto, a chi è in lista d\'attesa, né all\'organizzatore', () => {
    expect(buildAlerts(input({ events: [edited()] }))).toEqual([])
    expect(buildAlerts(input({ events: [edited()], myParticipations: [part('x', 'inAttesa')] }))).toEqual([])
    expect(buildAlerts(input({ events: [edited({ organizzatoreId: 'me' })], myParticipations: [part('x', 'confermato')] }))).toEqual([])
  })
  it('dopo 7 giorni o con evento annullato l\'avviso sparisce', () => {
    const old = edited({ modificatoIl: new Date(NOW.getTime() - 8 * 86_400_000) })
    expect(buildAlerts(input({ events: [old], myParticipations: [part('x', 'confermato')] }))).toEqual([])
    expect(buildAlerts(input({ events: [edited({ stato: 'annullato' })], myParticipations: [part('x', 'confermato')] }))).toEqual([])
  })
  it('rispetta l\'interruttore delle risposte', () => {
    expect(buildAlerts(input({ prefs: { ...DEFAULT_PREFS, risposte: false }, events: [edited()], myParticipations: [part('x', 'confermato')] }))).toEqual([])
  })
})
