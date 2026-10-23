import { describe, expect, it } from 'vitest'
import { createDemoServices, DEMO_EMAIL } from './createDemoServices'
import { DEMO_EVENT_SPECS } from './demoEvents'
import { DEMO_UID } from './demoPeople'
import { EVENT_TYPE_IDS } from '../domain/eventTypes'

describe('servizi demo', () => {
  it('parte con l\'utente demo già collegato e il suo profilo', async () => {
    const s = await createDemoServices()
    expect(s.auth.currentUid()).toBe(DEMO_UID)
    expect((await s.users.getById(DEMO_UID))?.nome).toBe('Andrea')
  })

  it('contiene eventi di tutti i tipi, con e senza approvazione, uno pieno e uno annullato', async () => {
    const s = await createDemoServices()
    const events = await s.events.list()
    expect(events).toHaveLength(DEMO_EVENT_SPECS.length)
    for (const tipo of EVENT_TYPE_IDS) expect(events.some((e) => e.tipo === tipo)).toBe(true)
    expect(events.some((e) => e.richiedeApprovazione)).toBe(true)
    expect(events.some((e) => !e.richiedeApprovazione)).toBe(true)
    expect(events.some((e) => e.stato === 'annullato')).toBe(true)
    const full = events.find((e) => e.titolo.startsWith('Calcetto'))!
    expect(await s.participations.listConfirmed(full.id)).toHaveLength(full.maxPartecipanti)
  })

  it('l\'email demo è registrata', async () => {
    const s = await createDemoServices()
    await s.auth.logout()
    expect(await s.auth.login(DEMO_EMAIL, 'demo1234')).toBe(DEMO_UID)
  })
})
