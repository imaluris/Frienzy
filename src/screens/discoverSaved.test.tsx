import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { App } from '../App'
import { createMemoryServices } from '../data/memory/createMemoryServices'
import type { NewEvent } from '../domain/event'
import type { EventTypeId } from '../domain/eventTypes'
import { useFixedMonday } from '../test/fixedMonday'

const place = { indirizzo: 'Via Segreta 1', lat: 45.4523, lng: 9.1731 }
const day = 24 * 3600 * 1000

const event = (titolo: string, tipo: EventTypeId, giorni: number): NewEvent => ({
  organizzatoreId: 'altro', tipo, titolo, descrizione: '', dataOra: new Date(Date.now() + giorni * day),
  zonaNome: 'Navigli', latApprossimata: 45.45, lngApprossimata: 9.17, geohash: 'u0nd8k', maxPartecipanti: 8, richiedeApprovazione: false,
})

async function setup() {
  const services = createMemoryServices()
  const uid = await services.auth.register('ada@example.com', 'segreta1')
  await services.users.save({ uid, nome: 'Ada', dataNascita: new Date('1990-01-01T00:00:00Z'), bio: '', interessi: ['trekking'], fotoUrl: '', creatoIl: new Date() })
  await services.events.create(event('Gita al lago', 'trekking', 10), place)
  await services.events.create(event('Cena in terrazza', 'cena', 11), place)
  await services.events.create(event('Brunch di sabato', 'altro', 5), place) // sabato 7 novembre (oggi è lunedì 2)
  render(<App services={services} />)
  fireEvent.click(await screen.findByRole('button', { name: 'Eventi' }))
  return { services, uid }
}

describe('scoperta e salvati', () => {
  useFixedMonday()
  afterEach(() => vi.unstubAllGlobals())

  it('mostra "Per te" con i tipi che interessano e "Questo weekend", e nasconde "Vicino a te" senza posizione', async () => {
    await setup()
    const perTe = await screen.findByRole('region', { name: 'Per te' })
    expect(within(perTe).getByText('Gita al lago')).toBeInTheDocument()
    expect(within(perTe).queryByText('Cena in terrazza')).toBeNull()
    expect(within(screen.getByRole('region', { name: 'Questo weekend' })).getByText('Brunch di sabato')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Vicino a te' })).toBeNull()
  })

  it('con una ricerca attiva le file spariscono', async () => {
    await setup()
    await screen.findByRole('region', { name: 'Per te' })
    fireEvent.change(screen.getByLabelText('Cerca eventi'), { target: { value: 'cena' } })
    expect(screen.queryByRole('region', { name: 'Per te' })).toBeNull()
  })

  it('il cuore salva l\'evento (anche nel repository) e lo ritrovo in Salvati', async () => {
    const { services, uid } = await setup()
    const perTe = await screen.findByRole('region', { name: 'Per te' })
    fireEvent.click(within(perTe).getByRole('button', { name: 'Salva evento' }))
    expect(await within(perTe).findByRole('button', { name: 'Rimuovi dai salvati' })).toBeInTheDocument()
    expect(await services.saved.listIds(uid)).toHaveLength(1)

    fireEvent.click(screen.getByRole('button', { name: 'I miei eventi' }))
    fireEvent.click(await screen.findByRole('tab', { name: /Salvati/ }))
    expect(await screen.findByText('Gita al lago')).toBeInTheDocument()
  })

  it('Salvati vuoto invita a toccare il cuore', async () => {
    await setup()
    fireEvent.click(screen.getByRole('button', { name: 'I miei eventi' }))
    fireEvent.click(await screen.findByRole('tab', { name: /Salvati/ }))
    expect(await screen.findByText(/Non hai ancora salvato nessun evento/)).toBeInTheDocument()
  })

  it('se il salvataggio fallisce il cuore torna com\'era', async () => {
    const { services } = await setup()
    services.saved.add = () => Promise.reject(new Error('offline'))
    const perTe = await screen.findByRole('region', { name: 'Per te' })
    fireEvent.click(within(perTe).getByRole('button', { name: 'Salva evento' }))
    expect(await within(perTe).findByRole('button', { name: 'Salva evento' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('con il permesso già dato compare "Vicino a te" con la distanza', async () => {
    vi.stubGlobal('navigator', {
      permissions: { query: () => Promise.resolve({ state: 'granted' }) },
      geolocation: { getCurrentPosition: (ok: (p: { coords: { latitude: number; longitude: number } }) => void) => ok({ coords: { latitude: 45.4642, longitude: 9.19 } }) },
    })
    await setup()
    const vicino = await screen.findByRole('region', { name: 'Vicino a te' })
    expect(within(vicino).getAllByRole('button', { name: /Gita al lago/ }).length).toBeGreaterThan(0)
    expect(within(vicino).getAllByText(/\d+(,\d)? ?(km|m)$/).length).toBeGreaterThan(0)
  })
})
