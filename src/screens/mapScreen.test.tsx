import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { ServicesProvider } from '../app/ServicesContext'
import { createMemoryServices } from '../data/memory/createMemoryServices'
import type { NewEvent } from '../domain/event'
import { MapScreen } from './MapScreen'

// Leaflet non disegna nulla in jsdom: la mappa finta mostra un tasto per ogni segnaposto.
vi.mock('../map/EventMap', () => ({
  EventMap: ({ markers, selectedId, onSelect, onDeselect }: { markers: { eventId: string; title: string }[]; selectedId: string | null; onSelect: (id: string) => void; onDeselect: () => void }) => (
    <div>
      {markers.map((m) => <button key={m.eventId} type="button" onClick={() => onSelect(m.eventId)}>{`pin ${m.title}${m.eventId === selectedId ? ' (scelto)' : ''}`}</button>)}
      <button type="button" onClick={onDeselect}>tocca-sfondo</button>
    </div>
  ),
}))

const base = (titolo: string, tipo: NewEvent['tipo'], zonaNome: string): NewEvent => ({
  organizzatoreId: 'o', tipo, titolo, descrizione: '', dataOra: new Date(Date.now() + 3 * 24 * 3600 * 1000), zonaNome,
  latApprossimata: 45.46, lngApprossimata: 9.19, geohash: 'u0nd8k', maxPartecipanti: 8, richiedeApprovazione: false,
})

async function setup() {
  const services = createMemoryServices()
  const place = { indirizzo: 'via X 1', lat: 45.46, lng: 9.19 }
  await services.events.create(base('Aperitivo ai Navigli', 'aperitivo', 'Navigli'), place)
  await services.events.create(base('Trekking sul lago', 'trekking', 'Como'), place)
  const onOpen = vi.fn()
  render(<ServicesProvider services={services}><MapScreen onOpen={onOpen} /></ServicesProvider>)
  await screen.findByText('2 eventi sulla mappa')
  return { onOpen }
}

describe('Mappa', () => {
  it('parte con la scheda chiusa e il riassunto', async () => {
    await setup()
    expect(screen.queryByRole('button', { name: 'Vedi evento' })).toBeNull()
  })

  it('toccando un segnaposto la scheda sale a metà e mostra l\'evento, poi si apre il dettaglio', async () => {
    const { onOpen } = await setup()
    fireEvent.click(screen.getByText('pin Aperitivo ai Navigli'))
    expect(screen.getByText('pin Aperitivo ai Navigli (scelto)')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Vedi evento' }))
    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('toccando lo sfondo la scheda si richiude', async () => {
    await setup()
    fireEvent.click(screen.getByText('pin Aperitivo ai Navigli'))
    fireEvent.click(screen.getByText('tocca-sfondo'))
    expect(screen.queryByRole('button', { name: 'Vedi evento' })).toBeNull()
  })

  it('la maniglia porta la scheda in alto con la lista di tutti gli eventi', async () => {
    await setup()
    const grip = screen.getByRole('button', { name: /Apri o chiudi/ })
    fireEvent.click(grip)
    fireEvent.click(grip)
    expect(screen.getByText('Trekking sul lago', { selector: '.event-row-title' })).toBeInTheDocument()
  })

  it('la ricerca e i chip filtrano i segnaposto', async () => {
    await setup()
    fireEvent.change(screen.getByLabelText('Cerca eventi'), { target: { value: 'como' } })
    expect(screen.queryByText('pin Aperitivo ai Navigli')).toBeNull()
    expect(screen.getByText('pin Trekking sul lago')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Cerca eventi'), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: /aperitivo/ }))
    expect(screen.queryByText('pin Trekking sul lago')).toBeNull()
  })
})
