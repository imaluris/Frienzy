import { createMemoryServices } from '../data/memory/createMemoryServices'
import type { NewEvent } from '../domain/event'
import { canDeleteMessage, canUseChat, checkMessageText } from './chatRules'
import { chatRoleOf } from './chatRole'
import { dayLabelOf, groupMessages } from './groupMessages'
import type { ChatMessage } from './message'

const place = { indirizzo: 'Via Roma 1', lat: 45.45, lng: 9.17 }
const base: NewEvent = {
  organizzatoreId: 'org', tipo: 'cena', titolo: 'Cena', descrizione: '', dataOra: new Date(Date.now() + 86400000),
  zonaNome: 'Navigli', latApprossimata: 45.45, lngApprossimata: 9.17, geohash: 'u0nd8k', maxPartecipanti: 4, richiedeApprovazione: false,
}

async function setup() {
  const services = createMemoryServices()
  const event = await services.events.create(base, place)
  await services.participations.add(event.id, 'ada', 'confermato')
  await services.participations.add(event.id, 'bea', 'richiesta')
  return { services, id: event.id }
}

describe('regole pure della chat', () => {
  it('usa la chat chi organizza o è confermato; cancella solo chi organizza', () => {
    expect(canUseChat('organizzatore')).toBe(true)
    expect(canUseChat('confermato')).toBe(true)
    expect(canUseChat('nessuno')).toBe(false)
    expect(canDeleteMessage('organizzatore')).toBe(true)
    expect(canDeleteMessage('confermato')).toBe(false)
  })

  it('il testo si ripulisce e ha da 1 a 500 caratteri', () => {
    expect(checkMessageText('  ciao  ')).toEqual({ ok: true, testo: 'ciao' })
    expect(checkMessageText('   ').ok).toBe(false)
    expect(checkMessageText('a'.repeat(500)).ok).toBe(true)
    expect(checkMessageText('a'.repeat(501)).ok).toBe(false)
  })
})

describe('ruolo nella chat', () => {
  it('organizzatore, confermato, richiesta ed estraneo', async () => {
    const { services, id } = await setup()
    const role = (uid: string) => chatRoleOf(services.events, services.participations, id, uid)
    expect(await role('org')).toBe('organizzatore')
    expect(await role('ada')).toBe('confermato')
    expect(await role('bea')).toBe('nessuno')
    expect(await role('estraneo')).toBe('nessuno')
    expect(await chatRoleOf(services.events, services.participations, 'inesistente', 'org')).toBe('nessuno')
  })
})

describe('chat in memoria', () => {
  it('scrivono e leggono organizzatore e confermati, in ordine', async () => {
    const { services, id } = await setup()
    await services.chat.send(id, 'ada', 'Ciao a tutti')
    await services.chat.send(id, 'org', '  Benvenuta Ada ')
    let seen: ChatMessage[] = []
    services.chat.subscribe(id, 'ada', (m) => { seen = m }, () => {})
    await new Promise((r) => setTimeout(r, 0))
    expect(seen.map((m) => m.testo)).toEqual(['Ciao a tutti', 'Benvenuta Ada'])
  })

  it('i nuovi messaggi arrivano in tempo reale e smettono dopo la disiscrizione', async () => {
    const { services, id } = await setup()
    const calls: number[] = []
    const stop = services.chat.subscribe(id, 'ada', (m) => calls.push(m.length), () => {})
    await new Promise((r) => setTimeout(r, 0))
    await services.chat.send(id, 'org', 'uno')
    expect(calls).toEqual([0, 1])
    stop()
    await services.chat.send(id, 'org', 'due')
    expect(calls).toEqual([0, 1])
  })

  it('chi ha solo una richiesta o è estraneo non scrive e non legge', async () => {
    const { services, id } = await setup()
    await expect(services.chat.send(id, 'bea', 'ciao')).rejects.toThrow()
    await expect(services.chat.send(id, 'estraneo', 'ciao')).rejects.toThrow()
    const errors: string[] = []
    services.chat.subscribe(id, 'bea', () => errors.push('letto'), (e) => errors.push(e.message))
    await new Promise((r) => setTimeout(r, 0))
    expect(errors).toEqual(['La chat è riservata a organizzatore e confermati.'])
  })

  it('rifiuta testi vuoti o oltre 500 caratteri', async () => {
    const { services, id } = await setup()
    await expect(services.chat.send(id, 'ada', '  ')).rejects.toThrow()
    await expect(services.chat.send(id, 'ada', 'a'.repeat(501))).rejects.toThrow()
    await expect(services.chat.send(id, 'ada', 'a'.repeat(500))).resolves.toBeUndefined()
  })

  it('cancella solo l\'organizzatore', async () => {
    const { services, id } = await setup()
    await services.chat.send(id, 'ada', 'da togliere')
    let seen: ChatMessage[] = []
    services.chat.subscribe(id, 'org', (m) => { seen = m }, () => {})
    await new Promise((r) => setTimeout(r, 0))
    await expect(services.chat.remove(id, 'ada', seen[0].id)).rejects.toThrow()
    await services.chat.remove(id, 'org', seen[0].id)
    expect(seen).toEqual([])
  })

  it('chi lascia l\'evento perde l\'accesso subito, anche se stava ascoltando', async () => {
    const { services, id } = await setup()
    const errors: string[] = []
    services.chat.subscribe(id, 'ada', () => {}, (e) => errors.push(e.message))
    await new Promise((r) => setTimeout(r, 0))
    await services.participations.withdraw(id, 'ada')
    await services.chat.send(id, 'org', 'ciao')
    expect(errors).toEqual(['Non hai più accesso alla chat.'])
    await expect(services.chat.send(id, 'ada', 'ancora?')).rejects.toThrow()
  })
})

describe('raggruppamento dei messaggi', () => {
  const at = (iso: string) => new Date(iso)
  const msg = (id: string, authorUid: string, iso: string): ChatMessage => ({ id, eventId: 'e', authorUid, testo: id, creatoIl: at(iso) })

  it('mostra il nome solo sul primo di una serie e mai sui miei', () => {
    const items = groupMessages([msg('a', 'x', '2026-11-05T10:00:00'), msg('b', 'x', '2026-11-05T10:01:00'), msg('c', 'me', '2026-11-05T10:02:00'), msg('d', 'x', '2026-11-05T10:03:00')], 'me', at('2026-11-05T12:00:00'))
    expect(items.map((i) => i.showAuthor)).toEqual([true, false, false, true])
    expect(items.map((i) => i.mine)).toEqual([false, false, true, false])
  })

  it('mette un separatore al cambio di giorno', () => {
    const items = groupMessages([msg('a', 'x', '2026-11-04T23:00:00'), msg('b', 'x', '2026-11-05T09:00:00'), msg('c', 'x', '2026-11-05T09:30:00')], 'me', at('2026-11-05T12:00:00'))
    expect(items.map((i) => i.dayLabel)).toEqual(['Ieri', 'Oggi', null])
    expect(items[1].showAuthor).toBe(true) // nuovo giorno: ricomincia la serie
  })

  it('i giorni lontani hanno la data', () => {
    expect(dayLabelOf(at('2026-10-20T10:00:00'), at('2026-11-05T12:00:00'))).toMatch(/20/)
  })
})
