import '@testing-library/jest-dom/vitest'
import { configure, fireEvent, render, screen } from '@testing-library/react'
import { App } from '../App'
import { MemoryAuthService } from '../auth/memoryAuthService'
import { createMemoryServices } from '../data/memory/createMemoryServices'

configure({ asyncUtilTimeout: 5000 })
const profile = (uid: string, nome: string) => ({ uid, nome, dataNascita: new Date('1990-01-01T00:00:00Z'), bio: '', interessi: [], fotoUrl: '', creatoIl: new Date() })

describe('password dimenticata', () => {
  it("dal login: indirizzo non valido = errore; valido = messaggio neutro e pulsante in attesa", async () => {
    const auth = new MemoryAuthService()
    await auth.register('ada@example.com', 'segreta1')
    await auth.logout()
    render(<App services={createMemoryServices(auth)} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Accedi' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Password dimenticata?' }))
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ciao' } })
    fireEvent.click(screen.getByRole('button', { name: 'Invia il link' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Inserisci un indirizzo email valido.')
    expect(auth.sentEmails).toEqual([])

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Invia il link' }))
    expect(await screen.findByRole('status')).toHaveTextContent(/Se esiste un account/)
    expect(auth.sentEmails).toEqual([{ kind: 'reset', to: 'ada@example.com' }])
    expect(screen.getByRole('button', { name: /Puoi rinviarlo tra \d+ s/ })).toBeDisabled() // niente raffiche
    fireEvent.click(screen.getByRole('button', { name: "Torna all'accesso" }))
    expect(await screen.findByRole('heading', { name: 'Accedi' })).toBeInTheDocument()
  })
})

describe('conferma email dal Profilo', () => {
  async function openProfile() {
    const auth = new MemoryAuthService()
    const services = createMemoryServices(auth)
    const me = await auth.register('ada@example.com', 'segreta1')
    await services.users.save(profile(me, 'Ada'))
    render(<App services={services} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Profilo' }))
    return auth
  }

  it("finché non è confermata compare l'avviso; si può rinviare l'email (poi attesa)", async () => {
    const auth = await openProfile()
    expect(await screen.findByRole('heading', { name: 'Conferma la tua email' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: "Rinvia l'email" }))
    expect(await screen.findByRole('button', { name: /Rinvia tra \d+ s/ })).toBeDisabled()
    expect(auth.sentEmails).toEqual([{ kind: 'verify', to: 'ada@example.com' }])
  })

  it('"Ho confermato" senza aver cliccato il link dà un avviso; dopo la conferma l\'avviso sparisce', async () => {
    const auth = await openProfile()
    fireEvent.click(await screen.findByRole('button', { name: 'Ho confermato' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/Non risulta ancora confermata/)
    auth.confirmEmail('ada@example.com')
    fireEvent.click(screen.getByRole('button', { name: 'Ho confermato' }))
    expect(await screen.findByText('Email confermata, grazie!')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Conferma la tua email' })).toBeNull()
  })

  it('con email già confermata non compare nulla', async () => {
    const auth = new MemoryAuthService()
    const services = createMemoryServices(auth)
    const me = await auth.register('ada@example.com', 'segreta1')
    auth.confirmEmail('ada@example.com')
    await services.users.save(profile(me, 'Ada'))
    render(<App services={services} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Profilo' }))
    expect(await screen.findByRole('heading', { name: 'Ada' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Conferma la tua email' })).toBeNull()
  })
})

describe('registrazione', () => {
  it("dopo la creazione dell'account parte l'email di conferma", async () => {
    const auth = new MemoryAuthService()
    render(<App services={createMemoryServices(auth)} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Crea il tuo account' }))
    fireEvent.change(await screen.findByLabelText('Email'), { target: { value: 'ada@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'segreta1' } })
    fireEvent.change(screen.getByLabelText('Ripeti la password'), { target: { value: 'segreta1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continua' }))
    await screen.findByRole('heading', { name: 'Come ti chiami?' })
    expect(auth.sentEmails).toEqual([{ kind: 'verify', to: 'ada@example.com' }])
  })
})
