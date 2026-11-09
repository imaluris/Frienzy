import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { App } from '../App'
import { createMemoryServices } from '../data/memory/createMemoryServices'
import type { NewEvent } from '../domain/event'

const place = { indirizzo: 'Via Roma 1', lat: 45.45, lng: 9.17 }
const hoursFromNow = (h: number) => new Date(Date.now() + h * 3600_000)
const base = (dataOra: Date, organizzatoreId: string): NewEvent => ({
  organizzatoreId, tipo: 'cena', titolo: 'Cena di prova', descrizione: '', dataOra, zonaNome: 'Navigli',
  latApprossimata: 45.45, lngApprossimata: 9.17, geohash: 'u0nd8k', maxPartecipanti: 4, richiedeApprovazione: false,
})
const profile = (uid: string, nome: string) => ({ uid, nome, dataNascita: new Date('1990-01-01T00:00:00Z'), bio: '', interessi: [], fotoUrl: '', creatoIl: new Date() })

async function setup(hours: number, iAmOrganizer: boolean) {
  const services = createMemoryServices()
  const me = await services.auth.register('ada@example.com', 'segreta1')
  await services.users.save(profile(me, 'Ada'))
  await services.users.save(profile('bea', 'Bea'))
  const org = iAmOrganizer ? me : 'bea'
  const event = await services.events.create(base(hoursFromNow(hours), org), place)
  await services.participations.add(event.id, iAmOrganizer ? 'bea' : me, 'confermato')
  render(<App services={services} />)
  fireEvent.click(await screen.findByRole('button', { name: 'I miei eventi' }))
  if (!iAmOrganizer) fireEvent.click(await screen.findByRole('tab', { name: /Iscrizioni/ }))
  fireEvent.click((await screen.findAllByRole('button', { name: /Cena di prova/ }))[0])
  return { services, me, event }
}

describe('presenza e voti: schermate', () => {
  it('prima della data non compare nessuna riga di presenze o voti', async () => {
    await setup(48, true)
    await screen.findByText('Chat dell\'evento')
    expect(screen.queryByText('Chi è venuto?')).not.toBeInTheDocument()
  })

  it("l'organizzatore dopo l'evento segna chi è venuto e può correggere", async () => {
    const { services, event } = await setup(-5, true)
    fireEvent.click(await screen.findByRole('button', { name: /Chi è venuto/ }))
    const group = await screen.findByRole('group', { name: 'Presenza di Bea' })
    fireEvent.click(within(group).getByRole('button', { name: /Non c'era/ }))
    expect(await within(group).findByRole('button', { name: /Non c'era/, pressed: true })).toBeInTheDocument()
    expect((await services.attendance.listPresenceByEvent(event.id))[0].stato).toBe('assente')
    fireEvent.click(within(group).getByRole('button', { name: /È venuto/ }))
    expect(await within(group).findByRole('button', { name: /È venuto/, pressed: true })).toBeInTheDocument()
    expect((await services.attendance.listPresenceByEvent(event.id))[0].stato).toBe('presente')
  })

  it('un confermato vota una sola volta: il pulsante diventa "Hai votato"', async () => {
    const { services, me, event } = await setup(-5, false)
    fireEvent.click(await screen.findByRole('button', { name: /Com'è andata/ }))
    const send = await screen.findByRole('button', { name: 'Invia il voto' })
    expect(send).toBeDisabled() // senza stelle non si invia
    fireEvent.click(screen.getByRole('radio', { name: '4 stelle' }))
    fireEvent.click(screen.getByRole('button', { name: 'Puntuale' }))
    fireEvent.click(send)
    expect(await screen.findByText('Hai votato 4 stelle')).toBeInTheDocument()
    expect(await services.attendance.getRating(event.id, me)).toMatchObject({ stelle: 4, etichetta: 'Puntuale' })
    expect(screen.queryByRole('button', { name: /Com'è andata/ })).not.toBeInTheDocument()
  })
})
