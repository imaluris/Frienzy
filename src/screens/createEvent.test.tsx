import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { ServicesProvider } from '../app/ServicesContext'
import { createMemoryServices } from '../data/memory/createMemoryServices'
import { CreateEventScreen } from './CreateEventScreen'

// Leaflet non disegna nulla in jsdom: sostituisco la mappa con un tasto che "tocca" un punto.
vi.mock('../map/PointPicker', () => ({
  PointPicker: ({ onPick }: { onPick: (p: { lat: number; lng: number }) => void }) => (
    <button type="button" onClick={() => onPick({ lat: 45.4642, lng: 9.19 })}>tocca-mappa</button>
  ),
}))

function setup() {
  const services = createMemoryServices()
  const onDone = vi.fn()
  render(
    <ServicesProvider services={services}>
      <CreateEventScreen uid="u1" onDone={onDone} />
    </ServicesProvider>,
  )
  return { services, onDone }
}

describe('Crea evento', () => {
  it('mostra gli errori accanto ai campi e non crea nulla', async () => {
    const { services, onDone } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Crea evento' }))
    expect(await screen.findByText(/almeno 3 caratteri/)).toBeInTheDocument()
    expect(screen.getByText(/Tocca la mappa per scegliere dove/)).toBeInTheDocument()
    expect(screen.getByText(/Scrivi la zona/)).toBeInTheDocument()
    expect(onDone).not.toHaveBeenCalled()
    expect(await services.events.list()).toHaveLength(0)
  })

  it("toglie l'errore del campo appena lo si corregge", async () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'Crea evento' }))
    await screen.findByText(/almeno 3 caratteri/)
    fireEvent.change(screen.getByLabelText(/^Titolo/), { target: { value: 'Cena' } })
    expect(screen.queryByText(/almeno 3 caratteri/)).toBeNull()
  })

  it('il tipo si sceglie con i tasti emoji', () => {
    setup()
    const cena = screen.getByRole('radio', { name: /cena/ })
    fireEvent.click(cena)
    expect(cena).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: /aperitivo/ })).toHaveAttribute('aria-checked', 'false')
  })

  it('crea l\'evento col punto toccato sulla mappa', async () => {
    const { services, onDone } = setup()
    fireEvent.change(screen.getByLabelText(/^Titolo/), { target: { value: 'Cena in terrazza' } })
    const future = new Date(Date.now() + 5 * 24 * 3600 * 1000)
    const pad = (n: number) => String(n).padStart(2, '0')
    const text = `${future.getFullYear()}-${pad(future.getMonth() + 1)}-${pad(future.getDate())}T20:00`
    fireEvent.change(screen.getByLabelText(/^Data e ora/), { target: { value: text } })
    fireEvent.click(screen.getByText('tocca-mappa'))
    fireEvent.change(screen.getByLabelText(/^Zona/), { target: { value: 'Navigli' } })
    fireEvent.change(screen.getByLabelText(/^Indirizzo esatto/), { target: { value: 'Via Roma 1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crea evento' }))
    await waitFor(() => expect(onDone).toHaveBeenCalled())
    const list = await services.events.list()
    expect(list).toHaveLength(1)
    expect(list[0].titolo).toBe('Cena in terrazza')
  })
})
