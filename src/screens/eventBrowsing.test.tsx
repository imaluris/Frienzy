import { fireEvent, render, screen } from '@testing-library/react'
import { App } from '../App'
import { createMemoryServices } from '../data/memory/createMemoryServices'
import type { NewEvent } from '../domain/event'

function newEvent(titolo: string, dataOra: Date): NewEvent {
  return {
    organizzatoreId: 'altro', tipo: 'aperitivo', titolo, descrizione: 'Due chiacchiere', dataOra,
    zonaNome: 'Navigli', latApprossimata: 45.45, lngApprossimata: 9.17, geohash: 'u0nd8k',
    maxPartecipanti: 8, richiedeApprovazione: true,
  }
}

const place = { indirizzo: 'Via Segreta 1', lat: 45.4523, lng: 9.1731 }
const day = 24 * 3600 * 1000

async function loggedInServices() {
  const services = createMemoryServices()
  const uid = await services.auth.register('ada@example.com', 'segreta1')
  await services.users.save({
    uid, nome: 'Ada', dataNascita: new Date('1990-01-01T00:00:00Z'), bio: '', interessi: [], fotoUrl: '', creatoIl: new Date(),
  })
  return services
}

describe('elenco e dettaglio eventi', () => {
  it('mostra solo i futuri in ordine e apre il dettaglio senza indirizzo esatto', async () => {
    const services = await loggedInServices()
    const now = Date.now()
    await services.events.create(newEvent('Lontano', new Date(now + 9 * day)), place)
    await services.events.create(newEvent('Passato', new Date(now - 2 * day)), place)
    await services.events.create(newEvent('Vicino', new Date(now + 2 * day)), place)

    render(<App services={services} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Eventi' }))

    const items = await screen.findAllByRole('button', { name: /Vicino|Lontano|Passato/ })
    expect(items.map((b) => b.textContent)).toEqual([expect.stringContaining('Vicino'), expect.stringContaining('Lontano')])

    fireEvent.click(items[0])
    expect(await screen.findByRole('heading', { name: /Vicino/ })).toBeInTheDocument()
    expect(screen.getByText('Navigli')).toBeInTheDocument()
    expect(screen.getByText('Massimo 8 persone')).toBeInTheDocument()
    expect(screen.queryByText(/Via Segreta/)).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
    expect(await screen.findByRole('button', { name: /Vicino/ })).toBeInTheDocument()
  })

  it('senza eventi lo dice', async () => {
    render(<App services={await loggedInServices()} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Eventi' }))
    expect(await screen.findByText('Nessun evento in programma.')).toBeInTheDocument()
  })
})
