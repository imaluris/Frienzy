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

const next = () => fireEvent.click(screen.getByRole('button', { name: 'Continua' }))

function futureText() {
  const future = new Date(Date.now() + 5 * 24 * 3600 * 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${future.getFullYear()}-${pad(future.getMonth() + 1)}-${pad(future.getDate())}T20:00`
}

describe('Crea evento a passi', () => {
  it('il primo passo è la scelta del tipo, con l\'indicatore di avanzamento', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Che tipo di uscita è?' })).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Passo 1 di 6' })).toBeInTheDocument()
    const cena = screen.getByRole('radio', { name: /cena/ })
    fireEvent.click(cena)
    expect(cena).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: /aperitivo/ })).toHaveAttribute('aria-checked', 'false')
  })

  it('non si va avanti col titolo mancante e l\'errore sparisce correggendo', async () => {
    setup()
    next()
    next()
    expect(await screen.findByText(/almeno 3 caratteri/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Come la chiami?' })).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText(/^Titolo/), { target: { value: 'Cena' } })
    expect(screen.queryByText(/almeno 3 caratteri/)).toBeNull()
  })

  it('il passo "dove" chiede punto, zona e indirizzo', async () => {
    setup()
    next()
    fireEvent.change(screen.getByLabelText(/^Titolo/), { target: { value: 'Cena in terrazza' } })
    next()
    fireEvent.change(screen.getByLabelText(/^Data e ora/), { target: { value: futureText() } })
    next()
    await screen.findByRole('heading', { name: 'Dove ci si trova?' })
    next()
    expect(await screen.findByText(/Tocca la mappa per scegliere dove/)).toBeInTheDocument()
    expect(screen.getByText(/Scrivi la zona/)).toBeInTheDocument()
  })

  it('i tasti più e meno cambiano i posti', async () => {
    setup()
    for (const [label, value] of [['Titolo', 'Cena in terrazza']] as const) {
      next()
      fireEvent.change(screen.getByLabelText(new RegExp(`^${label}`)), { target: { value } })
    }
    next()
    fireEvent.change(screen.getByLabelText(/^Data e ora/), { target: { value: futureText() } })
    next()
    fireEvent.click(screen.getByText('tocca-mappa'))
    fireEvent.change(screen.getByLabelText(/^Zona/), { target: { value: 'Navigli' } })
    fireEvent.change(screen.getByLabelText(/^Indirizzo esatto/), { target: { value: 'Via Roma 1' } })
    next()
    await screen.findByRole('heading', { name: 'Quanti posti ci sono?' })
    fireEvent.click(screen.getByRole('button', { name: 'Un posto in più' }))
    expect(screen.getByRole('textbox')).toHaveValue('11')
  })

  it('percorso completo: riepilogo con anteprima e creazione dell\'evento', async () => {
    const { services, onDone } = setup()
    fireEvent.click(screen.getByRole('radio', { name: /cena/ }))
    next()
    fireEvent.change(screen.getByLabelText(/^Titolo/), { target: { value: 'Cena in terrazza' } })
    next()
    fireEvent.change(screen.getByLabelText(/^Data e ora/), { target: { value: futureText() } })
    next()
    fireEvent.click(screen.getByText('tocca-mappa'))
    fireEvent.change(screen.getByLabelText(/^Zona/), { target: { value: 'Navigli' } })
    fireEvent.change(screen.getByLabelText(/^Indirizzo esatto/), { target: { value: 'Via Roma 1' } })
    next()
    next()
    await screen.findByRole('heading', { name: 'Tutto pronto?' })
    expect(screen.getByText('Cena in terrazza')).toBeInTheDocument()
    expect(screen.getByText(/Via Roma 1/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Crea evento' }))
    await waitFor(() => expect(onDone).toHaveBeenCalled())
    const list = await services.events.list()
    expect(list).toHaveLength(1)
    expect(list[0].tipo).toBe('cena')
  })

  it('"Indietro" torna al passo prima', () => {
    setup()
    next()
    fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
    expect(screen.getByRole('heading', { name: 'Che tipo di uscita è?' })).toBeInTheDocument()
  })
})
