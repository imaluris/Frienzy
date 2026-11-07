import '@testing-library/jest-dom/vitest'
import { configure, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { App } from '../App'
import { createMemoryServices } from '../data/memory/createMemoryServices'

configure({ asyncUtilTimeout: 5000 })
const profile = (uid: string, nome: string) => ({ uid, nome, dataNascita: new Date('1990-01-01T00:00:00Z'), bio: '', interessi: [], fotoUrl: '', creatoIl: new Date() })

async function openDelete() {
  const services = createMemoryServices()
  const me = await services.auth.register('ada@example.com', 'segreta1')
  await services.users.save(profile(me, 'Ada'))
  render(<App services={services} />)
  fireEvent.click(await screen.findByRole('button', { name: 'Profilo' }))
  fireEvent.click(await screen.findByRole('button', { name: 'Elimina account' }))
  return { services, me }
}

describe('elimina account dal Profilo', () => {
  it('due passi: prima l\'avviso, poi la password; "torno indietro" non cancella nulla', async () => {
    const { services, me } = await openDelete()
    expect(await screen.findByRole('dialog', { name: 'Eliminare il tuo account?' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'No, torno indietro' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(await services.users.getById(me)).not.toBeNull()
  })

  it('password sbagliata: errore e account intatto; password giusta: si torna al benvenuto', async () => {
    const { services, me } = await openDelete()
    fireEvent.click(await screen.findByRole('button', { name: 'Continua' }))
    expect(screen.getByRole('button', { name: 'Elimina definitivamente' })).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'sbagliata1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Elimina definitivamente' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Password errata.')
    expect(await services.users.getById(me)).not.toBeNull()

    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'segreta1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Elimina definitivamente' }))
    expect(await screen.findByRole('button', { name: 'Accedi' })).toBeInTheDocument()
    await waitFor(async () => expect(await services.users.getById(me)).toBeNull())
  })
})
