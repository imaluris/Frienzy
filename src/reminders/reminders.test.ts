import { createMemoryServices } from '../data/memory/createMemoryServices'
import { makeEvent, NOW } from '../test/alertFixtures'
import { MemoryReminderService } from './memoryReminderService'
import { planReminders } from './planReminders'
import { reminderEvents } from './reminderEvents'
import { reminderId } from './reminderId'
import { syncReminders } from './syncReminders'

const HOUR = 3_600_000
const at = (hours: number) => new Date(NOW.getTime() + hours * HOUR)

describe('calcolo dei promemoria', () => {
  it('evento tra 30 ore: due promemoria, 24h e 2h prima, in ordine', () => {
    const plan = planReminders([makeEvent({ dataOra: at(30) })], NOW)
    expect(plan.map((r) => r.at.getTime())).toEqual([at(6).getTime(), at(28).getTime()])
  })
  it('evento tra 5 ore: solo quello "2 ore prima" (le 24 ore sono già passate)', () => {
    expect(planReminders([makeEvent({ dataOra: at(5) })], NOW).map((r) => r.at.getTime())).toEqual([at(3).getTime()])
  })
  it('evento tra 1 ora o già passato: nessun promemoria', () => {
    expect(planReminders([makeEvent({ dataOra: at(1) }), makeEvent({ id: 'e2', dataOra: at(-3) })], NOW)).toEqual([])
  })
  it('eventi annullati o chiusi non hanno promemoria', () => {
    expect(planReminders([makeEvent({ stato: 'annullato' }), makeEvent({ id: 'e2', stato: 'chiuso' })], NOW)).toEqual([])
  })
  it('il testo ha titolo con emoji del tipo, zona e ora', () => {
    const [first] = planReminders([makeEvent({ dataOra: new Date('2030-05-11T16:30:00Z') })], NOW)
    expect(first.title).toContain('Aperitivo ai Navigli')
    expect(first.title).toContain('🍹')
    expect(first.body).toContain('domani alle')
    expect(first.body).toContain('Navigli')
  })
})

describe('id dei promemoria', () => {
  it('stabile, positivo e diverso per evento e tipo', () => {
    expect(reminderId('e1', '24h')).toBe(reminderId('e1', '24h'))
    expect(reminderId('e1', '24h')).not.toBe(reminderId('e1', '2h'))
    expect(reminderId('e1', '24h')).not.toBe(reminderId('e2', '24h'))
    for (const id of ['', 'a', 'evento-lunghissimo-con-molti-caratteri']) expect(reminderId(id, '2h')).toBeGreaterThan(0)
  })
})

describe('eventi con promemoria', () => {
  it('organizzati + confermati; non richieste, rifiutati o lista d\'attesa', () => {
    const joined = (id: string, stato: 'confermato' | 'richiesta' | 'rifiutato' | 'inAttesa') => ({ event: makeEvent({ id }), participation: { eventId: id, uid: 'me', stato, creatoIl: NOW } })
    const mine = { organized: [makeEvent({ id: 'mio' })], joined: [joined('c', 'confermato'), joined('r', 'richiesta'), joined('x', 'rifiutato'), joined('a', 'inAttesa')] }
    expect(reminderEvents(mine).map((e) => e.id)).toEqual(['mio', 'c'])
  })
})

describe('sincronizzazione', () => {
  async function setup(supported = true) {
    const services = createMemoryServices()
    const reminders = new MemoryReminderService(supported)
    Object.assign(services, { reminders })
    const event = await services.events.create({ ...makeEvent({ dataOra: at(30), organizzatoreId: 'org' }), id: undefined } as never, { indirizzo: 'x', lat: 1, lng: 1 })
    return { services, reminders, event }
  }

  it('programma i promemoria di un evento a cui sono confermato', async () => {
    const { services, reminders, event } = await setup()
    await services.participations.join(event.id, 'me')
    expect(await syncReminders(services, 'me', NOW)).toBe('ok')
    expect(reminders.scheduled).toHaveLength(2)
  })
  it('dopo il ritiro non resta nulla', async () => {
    const { services, reminders, event } = await setup()
    await services.participations.join(event.id, 'me')
    await syncReminders(services, 'me', NOW)
    await services.participations.withdraw(event.id, 'me')
    await syncReminders(services, 'me', NOW)
    expect(reminders.scheduled).toEqual([])
  })
  it("l'evento annullato dall'organizzatore toglie i promemoria", async () => {
    const { services, reminders, event } = await setup()
    await services.participations.join(event.id, 'me')
    await syncReminders(services, 'me', NOW)
    await services.events.update(event.id, { stato: 'annullato' })
    await syncReminders(services, 'me', NOW)
    expect(reminders.scheduled).toEqual([])
  })
  it('interruttore spento: annulla tutto e non programma', async () => {
    const { services, reminders, event } = await setup()
    await services.participations.join(event.id, 'me')
    await syncReminders(services, 'me', NOW)
    await services.notifications.savePrefs('me', { promemoria: false, richieste: true, risposte: true, inviti: false })
    expect(await syncReminders(services, 'me', NOW)).toBe('off')
    expect(reminders.scheduled).toEqual([])
    expect(reminders.cancelCalls).toBe(1)
  })
  it('senza permesso non programma; nel browser non fa nulla', async () => {
    const denied = await setup()
    Object.assign(denied.services, { reminders: new MemoryReminderService(true, 'denied') })
    expect(await syncReminders(denied.services, 'me', NOW)).toBe('no-permission')
    const web = await setup(false)
    expect(await syncReminders(web.services, 'me', NOW)).toBe('unsupported')
    expect(web.reminders.scheduled).toEqual([])
  })
})
