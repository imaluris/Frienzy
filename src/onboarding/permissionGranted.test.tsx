import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ServicesProvider } from '../app/ServicesContext'
import { createMemoryServices } from '../data/memory/createMemoryServices'
import { OnboardingFlow } from './OnboardingFlow'

// Con il permesso di posizione già concesso la posizione si legge da sola: la registrazione NON deve chiudersi sul primo passo.
describe('registrazione con permesso di posizione già concesso', () => {
  const realPermissions = Object.getOwnPropertyDescriptor(navigator, 'permissions')
  const realGeo = Object.getOwnPropertyDescriptor(navigator, 'geolocation')
  afterEach(() => {
    if (realPermissions) Object.defineProperty(navigator, 'permissions', realPermissions); else Reflect.deleteProperty(navigator, 'permissions')
    if (realGeo) Object.defineProperty(navigator, 'geolocation', realGeo); else Reflect.deleteProperty(navigator, 'geolocation')
  })

  it('resta sul passo del profilo e non mostra errori', async () => {
    Object.defineProperty(navigator, 'permissions', { configurable: true, value: { query: () => Promise.resolve({ state: 'granted' }) } })
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: { getCurrentPosition: (ok: (p: unknown) => void) => ok({ coords: { latitude: 45.46, longitude: 9.19 } }) } })
    const onSaved = vi.fn()
    render(<ServicesProvider services={createMemoryServices()}><OnboardingFlow uid="u1" onSaved={onSaved} /></ServicesProvider>)
    expect(await screen.findByRole('heading', { name: 'Come ti chiami?' })).toBeInTheDocument()
    await new Promise((r) => setTimeout(r, 50)) // il tempo di far arrivare la posizione
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull())
    expect(onSaved).not.toHaveBeenCalled()
  })
})
