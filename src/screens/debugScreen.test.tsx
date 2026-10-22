import { fireEvent, render, screen } from '@testing-library/react'
import { App } from '../App'
import { createMemoryServices } from '../data/memory/createMemoryServices'
import { MemoryPushService } from '../push/memoryPushService'

async function setup(push: MemoryPushService) {
  const services = { ...createMemoryServices(), push }
  const uid = await services.auth.register('ada@example.com', 'segreta1')
  await services.users.save({ uid, nome: 'Ada', dataNascita: new Date('1990-01-01T00:00:00Z'), bio: '', interessi: [], fotoUrl: '', creatoIl: new Date() })
  render(<App services={services} />)
  fireEvent.click(await screen.findByRole('button', { name: 'Debug' }))
}

describe('Schermata Debug', () => {
  it('mostra il token dopo aver attivato le notifiche', async () => {
    await setup(new MemoryPushService(true, 'granted', 'tok-777'))
    fireEvent.click(screen.getByRole('button', { name: 'Attiva notifiche' }))
    expect(await screen.findByText('tok-777')).toBeInTheDocument()
    expect(screen.getByText(/Attive/)).toBeInTheDocument()
  })
  it('se il permesso è negato non mostra token', async () => {
    await setup(new MemoryPushService(true, 'denied'))
    fireEvent.click(screen.getByRole('button', { name: 'Attiva notifiche' }))
    expect(await screen.findByText(/Permesso negato/)).toBeInTheDocument()
    expect(screen.queryByText(/Token:/)).toBeNull()
  })
  it('nel browser (non nativo) il pulsante è disattivato', async () => {
    await setup(new MemoryPushService(false))
    expect(await screen.findByText(/Non disponibili qui/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Attiva notifiche' })).toBeDisabled()
  })
  it('mostra l\'ultima notifica ricevuta', async () => {
    const push = new MemoryPushService()
    await setup(push)
    push.emitNotification({ title: 'Nuovo evento', body: 'Aperitivo' })
    expect(await screen.findByText(/Nuovo evento – Aperitivo/)).toBeInTheDocument()
  })
})
