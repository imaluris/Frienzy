import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { App } from '../App'
import { createMemoryServices } from '../data/memory/createMemoryServices'
import type { NewEvent } from '../domain/event'
import { greeting } from './HomeHeader'

const place = { indirizzo: 'Via Segreta 1', lat: 45.4523, lng: 9.1731 }
const hours = 3600 * 1000

function event(titolo: string, zona: string, inHours: number): NewEvent {
  return {
    organizzatoreId: 'altro', tipo: 'aperitivo', titolo, descrizione: '', dataOra: new Date(Date.now() + inHours * hours),
    zonaNome: zona, latApprossimata: 45.45, lngApprossimata: 9.17, geohash: 'u0nd8k', maxPartecipanti: 4, richiedeApprovazione: false,
  }
}

async function setup(events: NewEvent[]) {
  const services = createMemoryServices()
  const uid = await services.auth.register('ada@example.com', 'segreta1')
  await services.users.save({ uid, nome: 'Ada', dataNascita: new Date('1990-01-01T00:00:00Z'), bio: '', interessi: [], fotoUrl: '', creatoIl: new Date() })
  for (const e of events) await services.events.create(e, place)
  render(<App services={services} />)
  fireEvent.click(await screen.findByRole('button', { name: 'Eventi' }))
}

describe('schermata Eventi', () => {
  it('saluta per nome e raggruppa gli eventi in sezioni per periodo', async () => {
    await setup([event('Tra poco', 'Navigli', 2), event('Lontano lontano', 'Roma', 24 * 20)])
    expect(await screen.findByRole('heading', { level: 1, name: /Ada/ })).toBeInTheDocument()
    expect(await screen.findByRole('region', { name: 'Più avanti' })).toBeInTheDocument()
    const later = screen.getByRole('region', { name: 'Più avanti' })
    expect(within(later).getByText('Lontano lontano')).toBeInTheDocument()
    expect(within(later).queryByText('Tra poco')).toBeNull()
  })

  it('la ricerca filtra per titolo o zona e dice quando non trova nulla', async () => {
    await setup([event('Aperitivo', 'Navigli', 50), event('Trekking', 'Lago di Como', 60)])
    await screen.findByText('Aperitivo')
    fireEvent.change(screen.getByLabelText('Cerca eventi'), { target: { value: 'como' } })
    expect(screen.queryByText('Aperitivo')).toBeNull()
    expect(screen.getByText('Trekking')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Cerca eventi'), { target: { value: 'zzz' } })
    expect(screen.getByText('Nessun risultato per “zzz”.')).toBeInTheDocument()
  })

  it('con zero eventi invita a organizzare il primo', async () => {
    await setup([])
    expect(await screen.findByText('Nessun evento in programma.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Organizza il primo' }))
    expect(await screen.findByRole('heading', { name: 'Crea un evento' })).toBeInTheDocument()
  })

  it('il cuore salva e rimuove senza aprire l\'evento', async () => {
    await setup([event('Cena', 'Isola', 30)])
    const heart = await screen.findByRole('button', { name: 'Salva evento' })
    fireEvent.click(heart)
    expect(screen.getByRole('button', { name: 'Rimuovi dai salvati' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByRole('heading', { name: 'Evento' })).toBeNull()
  })

  it('il saluto cambia con l\'ora', () => {
    expect(greeting('Ada', new Date(2026, 9, 30, 9))).toBe('Buongiorno, Ada')
    expect(greeting('Ada', new Date(2026, 9, 30, 15))).toBe('Buon pomeriggio, Ada')
    expect(greeting('Ada', new Date(2026, 9, 30, 21))).toBe('Buonasera, Ada')
  })
})
