import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ServicesProvider } from '../app/ServicesContext'
import { createMemoryServices } from '../data/memory/createMemoryServices'
import type { NewEvent } from '../domain/event'
import { ToastProvider } from '../feedback/ToastContext'
import { EditEventSheet } from './EditEventSheet'

const place = { indirizzo: 'Via Roma 1', lat: 45.45, lng: 9.17 }
const newEvent: NewEvent = {
  organizzatoreId: 'org', tipo: 'cena', titolo: 'Cena sul Naviglio', descrizione: 'Portate il vino',
  dataOra: new Date(Date.now() + 5 * 86_400_000), zonaNome: 'Navigli', latApprossimata: 45.45, lngApprossimata: 9.17,
  geohash: 'u0nd8k', maxPartecipanti: 6, richiedeApprovazione: false,
}

async function setup(confirmed = 0) {
  const services = createMemoryServices()
  const event = await services.events.create(newEvent, place)
  for (let i = 0; i < confirmed; i++) await services.participations.add(event.id, `u${i}`, 'confermato')
  const onChanged = vi.fn()
  const onClose = vi.fn()
  render(
    <ServicesProvider services={services}>
      <ToastProvider><EditEventSheet event={event} uid="org" confirmedCount={confirmed} onChanged={onChanged} onClose={onClose} /></ToastProvider>
    </ServicesProvider>,
  )
  return { services, event, onChanged, onClose }
}

describe('finestra Modifica evento', () => {
  it('parte con i valori attuali e salva il nuovo titolo', async () => {
    const { services, event, onClose } = await setup()
    expect(screen.getByLabelText('Titolo')).toHaveValue('Cena sul Naviglio')
    fireEvent.change(screen.getByLabelText('Titolo'), { target: { value: 'Cena in giardino' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salva modifiche' }))
    await waitFor(() => expect(onClose).toHaveBeenCalled())
    const saved = await services.events.getById(event.id)
    expect(saved?.titolo).toBe('Cena in giardino')
    expect(saved?.modifiche).toEqual(['titolo'])
  })

  it('mostra l\'errore se i posti scendono sotto i confermati e non salva', async () => {
    const { services, event, onClose } = await setup(3)
    expect(screen.getByText(/Almeno 3/)).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText(/Posti/), { target: { value: '2' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salva modifiche' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/3 persone confermate/)
    expect(onClose).not.toHaveBeenCalled()
    expect((await services.events.getById(event.id))?.maxPartecipanti).toBe(6)
  })
})
