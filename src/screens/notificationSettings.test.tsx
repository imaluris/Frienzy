import '@testing-library/jest-dom/vitest'
import { configure, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ServicesProvider } from '../app/ServicesContext'
import { createMemoryServices } from '../data/memory/createMemoryServices'
import { MemoryNotificationRepository } from '../notifications/memoryNotificationRepository'
import { MemoryPushService } from '../push/memoryPushService'
import { NotificationSettings } from './NotificationSettings'

configure({ asyncUtilTimeout: 5000 })

function setup(push = new MemoryPushService()) {
  const services = { ...createMemoryServices(), push, notifications: new MemoryNotificationRepository() }
  render(<ServicesProvider services={services}><NotificationSettings uid="u1" /></ServicesProvider>)
  return services
}

describe('scheda Notifiche', () => {
  it('mostra i quattro interruttori con i valori di partenza', async () => {
    setup()
    const sw = await screen.findAllByRole('switch')
    expect(sw).toHaveLength(4)
    await waitFor(() => expect(screen.getByRole('switch', { name: 'Promemoria' })).toBeEnabled())
    expect(screen.getByRole('switch', { name: 'Promemoria' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('switch', { name: 'Inviti vicino a te' })).toHaveAttribute('aria-checked', 'false')
  })

  it('un interruttore cambia e resta salvato', async () => {
    const services = setup()
    await waitFor(() => expect(screen.getByRole('switch', { name: 'Promemoria' })).toBeEnabled())
    fireEvent.click(screen.getByRole('switch', { name: 'Promemoria' }))
    expect(screen.getByRole('switch', { name: 'Promemoria' })).toHaveAttribute('aria-checked', 'false')
    await waitFor(async () => expect((await services.notifications.getPrefs('u1')).promemoria).toBe(false))
  })

  it('se il salvataggio fallisce l\'interruttore torna com\'era', async () => {
    const services = setup()
    services.notifications.savePrefs = () => Promise.reject(new Error('rete'))
    await waitFor(() => expect(screen.getByRole('switch', { name: 'Promemoria' })).toBeEnabled())
    fireEvent.click(screen.getByRole('switch', { name: 'Promemoria' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Non sono riuscito a salvare')
    expect(screen.getByRole('switch', { name: 'Promemoria' })).toHaveAttribute('aria-checked', 'true')
  })

  it('attiva le notifiche e salva il token del telefono', async () => {
    const services = setup()
    fireEvent.click(await screen.findByRole('button', { name: 'Attiva le notifiche' }))
    expect(await screen.findByText('Notifiche attive su questo telefono')).toBeInTheDocument()
    await waitFor(() => expect((services.notifications as MemoryNotificationRepository).deviceOf('u1')?.token).toBe('token-finto-123'))
  })

  it('nel browser spiega che le notifiche arrivano nell\'app Android', async () => {
    setup(new MemoryPushService(false))
    expect(await screen.findByText(/dentro l'app Android/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Attiva le notifiche' })).not.toBeInTheDocument()
  })
})
