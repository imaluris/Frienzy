import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { App } from '../App'
import { createMemoryServices } from '../data/memory/createMemoryServices'
import type { NewEvent } from '../domain/event'
import { encodeGeohash } from '../events/geohash'

const place = { indirizzo: 'Via Segreta 1', lat: 45.4523, lng: 9.1731 }
const day = 24 * 3600 * 1000
const event = (titolo: string, tipo: NewEvent['tipo'], lat: number, lng: number, giorni: number): NewEvent => ({
  organizzatoreId: 'altro', tipo, titolo, descrizione: '', dataOra: new Date(Date.now() + giorni * day),
  zonaNome: 'z', latApprossimata: lat, lngApprossimata: lng, geohash: encodeGeohash(lat, lng),
  maxPartecipanti: 8, richiedeApprovazione: false,
})

async function setup() {
  const services = createMemoryServices()
  const uid = await services.auth.register('ada@example.com', 'segreta1')
  await services.users.save({ uid, nome: 'Ada', dataNascita: new Date('1990-01-01T00:00:00Z'), bio: '', interessi: [], fotoUrl: '', creatoIl: new Date() })
  await services.events.create(event('Cena Milano', 'cena', 45.46, 9.19, 2), place)
  await services.events.create(event('Trek Roma', 'trekking', 41.9, 12.5, 3), place)
  render(<App services={services} />)
  fireEvent.click(await screen.findByRole('button', { name: 'Eventi' }))
  await screen.findByRole('button', { name: /Cena Milano/ })
}

describe('filtri nell\'elenco eventi', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('per tipo: seleziona e deseleziona', async () => {
    await setup()
    fireEvent.click(screen.getByRole('button', { name: /trekking/ }))
    expect(screen.queryByRole('button', { name: /Cena Milano/ })).toBeNull()
    expect(screen.getByRole('button', { name: /Trek Roma/ })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /trekking/ }))
    expect(screen.getByRole('button', { name: /Cena Milano/ })).toBeInTheDocument()
  })

  it('nessun risultato: lo dice', async () => {
    await setup()
    fireEvent.click(screen.getByRole('button', { name: /mostra/ }))
    expect(screen.getByText('Nessun evento con questi filtri.')).toBeInTheDocument()
  })

  it('per distanza, con la posizione concessa', async () => {
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition: (ok: (p: unknown) => void) => ok({ coords: { latitude: 45.47, longitude: 9.18 } }) },
    })
    await setup()
    fireEvent.click(screen.getByRole('button', { name: 'Filtra per distanza' }))
    fireEvent.change(await screen.findByRole('combobox'), { target: { value: '10' } })
    expect(screen.getByRole('button', { name: /Cena Milano/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Trek Roma/ })).toBeNull()
  })

  it('posizione negata: messaggio e nessun filtro applicato', async () => {
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition: (_ok: unknown, no: () => void) => no() } })
    await setup()
    fireEvent.click(screen.getByRole('button', { name: 'Filtra per distanza' }))
    expect(await screen.findByText('Posizione non concessa.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Trek Roma/ })).toBeInTheDocument()
  })
})
