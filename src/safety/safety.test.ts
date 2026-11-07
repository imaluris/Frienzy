import { createMemoryServices } from '../data/memory/createMemoryServices'
import type { NewEvent } from '../domain/event'
import { loadEventPeople } from '../people/loadEventPeople'
import { hiddenUids, withoutBlockedEvents, withoutBlockedPeople } from './blocking'
import { checkReport, type NewReport } from './report'
import { submitReport } from './submitReport'
import { MemoryBlockRepository } from './memoryBlockRepository'
import { MemoryReportRepository } from './memoryReportRepository'
import { eventOptions, personOptions } from './options'

const report = (over: Partial<NewReport> = {}): NewReport => ({ reporterUid: 'ada', tipo: 'evento', targetId: 'e1', motivo: 'spam', dettagli: '', ...over })
const place = { indirizzo: 'Via Roma 1', lat: 45.45, lng: 9.17 }
const base: NewEvent = {
  organizzatoreId: 'org', tipo: 'cena', titolo: 'Cena', descrizione: '', dataOra: new Date(Date.now() + 86400000), zonaNome: 'Navigli',
  latApprossimata: 45.45, lngApprossimata: 9.17, geohash: 'u0nd8k', maxPartecipanti: 4, richiedeApprovazione: false,
}
const profile = (uid: string, nome: string) => ({ uid, nome, dataNascita: new Date('1990-01-01T00:00:00Z'), bio: '', interessi: [], fotoUrl: '', creatoIl: new Date() })

describe('segnalazioni: controllo', () => {
  it('accetta un motivo valido e ripulisce i dettagli', () => {
    const check = checkReport(report({ dettagli: '  troppa pubblicità  ' }))
    expect(check).toEqual({ ok: true, report: report({ dettagli: 'troppa pubblicità' }) })
  })

  it('rifiuta motivo inventato, auto-segnalazione, testo lungo e "Altro" senza spiegazione', () => {
    expect(checkReport(report({ motivo: 'noia' as never })).ok).toBe(false)
    expect(checkReport(report({ tipo: 'utente', targetId: 'ada' })).ok).toBe(false)
    expect(checkReport(report({ dettagli: 'x'.repeat(301) })).ok).toBe(false)
    expect(checkReport(report({ motivo: 'altro', dettagli: ' ' })).ok).toBe(false)
    expect(checkReport(report({ motivo: 'altro', dettagli: 'Mi ha scritto di continuo' })).ok).toBe(true)
    expect(checkReport(report({ dettagli: 'x'.repeat(300) })).ok).toBe(true)
  })

  it("l'invio salva solo segnalazioni valide", async () => {
    const reports = new MemoryReportRepository()
    await submitReport(reports, report({ motivo: 'truffa' }))
    await expect(submitReport(reports, report({ motivo: 'altro' }))).rejects.toThrow(/Altro/)
    expect(reports.all()).toHaveLength(1)
  })
})

describe('blocco: funzioni pure', () => {
  it('nasconde le persone bloccate nei due sensi, senza toccare gli elenchi originali', () => {
    const hidden = hiddenUids(['b'], ['c'])
    expect([...hidden].sort()).toEqual(['b', 'c'])
    const events = [{ organizzatoreId: 'a' }, { organizzatoreId: 'b' }, { organizzatoreId: 'c' }]
    expect(withoutBlockedEvents(events, hidden)).toEqual([{ organizzatoreId: 'a' }])
    expect(events).toHaveLength(3)
    expect(withoutBlockedPeople([{ uid: 'a' }, { uid: 'c' }], hidden)).toEqual([{ uid: 'a' }])
    expect(withoutBlockedEvents(events, new Set())).toEqual(events)
  })

  it('le voci di menu: evento proprio senza persone, evento altrui con segnala/blocca chi organizza', () => {
    expect(eventOptions('e1', { uid: 'org', nome: 'Olga' }, 'org').map((o) => o.kind)).toEqual(['report-event'])
    expect(eventOptions('e1', { uid: 'org', nome: 'Olga' }, 'ada').map((o) => o.kind)).toEqual(['report-event', 'report-user', 'block-user'])
    expect(eventOptions('e1', null, 'ada').map((o) => o.kind)).toEqual(['report-event'])
    expect(personOptions({ uid: 'x', nome: 'Xena' }).map((o) => o.kind)).toEqual(['report-user', 'block-user'])
  })
})

describe('blocco: archivio in memoria', () => {
  it('blocca, elenca nei due sensi e sblocca; non si blocca se stessi', async () => {
    const blocks = new MemoryBlockRepository()
    await blocks.block('a', 'b')
    await blocks.block('a', 'b') // doppione: nessun effetto
    expect(await blocks.listBlockedBy('a')).toEqual(['b'])
    expect(await blocks.listBlockers('b')).toEqual(['a'])
    expect(await blocks.isBlockedBetween('b', 'a')).toBe(true)
    expect(await blocks.isBlockedBetween('a', 'c')).toBe(false)
    await blocks.unblock('a', 'b')
    expect(await blocks.isBlockedBetween('a', 'b')).toBe(false)
    await expect(blocks.block('a', 'a')).rejects.toThrow()
  })
})

describe('blocco: iscrizione e persone', () => {
  it("chi è bloccato dall'organizzatore non può iscriversi; sbloccato sì", async () => {
    const services = createMemoryServices()
    const event = await services.events.create(base, place)
    await services.blocks.block('org', 'ada')
    await expect(services.participations.join(event.id, 'ada')).rejects.toThrow('Non puoi partecipare a questo evento')
    expect(await services.participations.get(event.id, 'ada')).toBeNull()
    await services.blocks.unblock('org', 'ada')
    expect((await services.participations.join(event.id, 'ada')).stato).toBe('confermato')
  })

  it("vale anche se è il partecipante a bloccare l'organizzatore", async () => {
    const services = createMemoryServices()
    const event = await services.events.create(base, place)
    await services.blocks.block('ada', 'org')
    await expect(services.participations.join(event.id, 'ada')).rejects.toThrow(/Non puoi partecipare/)
  })

  it("gli elenchi delle persone saltano chi è nascosto, l'organizzatore compreso", async () => {
    const services = createMemoryServices()
    for (const [uid, nome] of [['org', 'Olga'], ['ada', 'Ada'], ['bea', 'Bea']]) await services.users.save(profile(uid, nome))
    const event = await services.events.create(base, place)
    await services.participations.add(event.id, 'ada', 'confermato')
    await services.participations.add(event.id, 'bea', 'confermato')
    const today = new Date()
    const names = async (hidden: string[]) => (await loadEventPeople(services.users, services.participations, event, today, new Set(hidden))).map((p) => p.nome)
    expect(await names([])).toEqual(['Olga', 'Ada', 'Bea'])
    expect(await names(['ada'])).toEqual(['Olga', 'Bea'])
    expect(await names(['org'])).toEqual(['Ada', 'Bea'])
  })
})
