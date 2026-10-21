import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { App } from '../App'
import { createMemoryServices } from '../data/memory/createMemoryServices'
import type { NewEvent } from '../domain/event'
import { joinEvent } from '../participation/joinEvent'

const place = { indirizzo: 'Via Roma 1', lat: 45.45, lng: 9.17 }
const base: NewEvent = {
  organizzatoreId: 'org', tipo: 'cena', titolo: 'Cena di prova', descrizione: '',
  dataOra: new Date(Date.now() + 3 * 24 * 3600 * 1000), zonaNome: 'Navigli', latApprossimata: 45.45,
  lngApprossimata: 9.17, geohash: 'u0nd8k', maxPartecipanti: 4, richiedeApprovazione: false,
}

async function setup() {
  const services = createMemoryServices()
  const me = await services.auth.register('ada@example.com', 'segreta1')
  await services.users.save({ uid: me, nome: 'Ada', dataNascita: new Date('1990-01-01T00:00:00Z'), bio: '', interessi: [], fotoUrl: '', creatoIl: new Date() })
  return { services, me }
}

describe('I miei eventi', () => {
  it('mostra gli eventi organizzati e permette di annullarli', async () => {
    const { services, me } = await setup()
    await services.events.create({ ...base, organizzatoreId: me, titolo: 'Mio aperitivo' }, place)
    render(<App services={services} />)
    fireEvent.click(await screen.findByRole('button', { name: 'I miei eventi' }))
    expect(await screen.findByText(/Mio aperitivo/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Annulla evento' }))
    expect(await screen.findByText(/Annullato/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Annulla evento' })).toBeNull()
  })

  it('mostra le iscrizioni e permette di ritirarsi', async () => {
    const { services, me } = await setup()
    const event = await services.events.create(base, place)
    await joinEvent(services.participations, event.id, me)
    render(<App services={services} />)
    fireEvent.click(await screen.findByRole('button', { name: 'I miei eventi' }))
    expect(await screen.findByText(/Confermato/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Ritirati' }))
    expect(await screen.findByText('Non sei iscritto a nessun evento.')).toBeInTheDocument()
    expect(await services.participations.get(event.id, me)).toBeNull()
  })
})
