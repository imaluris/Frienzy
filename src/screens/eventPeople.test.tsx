import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { App } from '../App'
import { createMemoryServices } from '../data/memory/createMemoryServices'
import { joinEvent } from '../participation/joinEvent'
import { respondToRequest } from '../participation/respondToRequest'

const place = { indirizzo: 'Via Segreta 1', lat: 45.4523, lng: 9.1731 }
const user = (uid: string, nome: string) => ({
  uid, nome, dataNascita: new Date('1990-01-01T00:00:00Z'), bio: `Bio di ${nome}`, interessi: [], fotoUrl: '', creatoIl: new Date(),
})

describe('persone nel dettaglio evento', () => {
  it("mostra organizzatore e confermati con l'età, mai la data di nascita", async () => {
    const services = createMemoryServices()
    const me = await services.auth.register('ada@example.com', 'segreta1')
    await services.users.save(user(me, 'Ada'))
    await services.users.save(user('org', 'Olga'))
    await services.users.save(user('bruno', 'Bruno'))
    const event = await services.events.create({
      organizzatoreId: 'org', tipo: 'cena', titolo: 'Cena di prova', descrizione: '',
      dataOra: new Date(Date.now() + 3 * 24 * 3600 * 1000), zonaNome: 'Navigli', latApprossimata: 45.45,
      lngApprossimata: 9.17, geohash: 'u0nd8k', maxPartecipanti: 8, richiedeApprovazione: true,
    }, place)
    await joinEvent(services.participations, event.id, 'bruno')
    await respondToRequest(services.participations, event.id, 'bruno', 'org', 'accetta')
    await joinEvent(services.participations, event.id, me) // in attesa: non deve comparire

    render(<App services={services} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Eventi' }))
    fireEvent.click(await screen.findByRole('button', { name: /Cena di prova/ }))

    expect(await screen.findByText('Olga')).toBeInTheDocument()
    expect(screen.getByText('Bruno')).toBeInTheDocument()
    expect(screen.queryByText('Ada')).toBeNull()
    expect(screen.queryByText(/1990/)).toBeNull()
  })
})
