import { fireEvent, render, screen } from '@testing-library/react'
import { App } from './App'
import { createMemoryServices } from './data/memory/createMemoryServices'

function type(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

describe('App: registrazione, login e logout', () => {
  it('senza accesso mostra il benvenuto e da lì si arriva al login', async () => {
    render(<App services={createMemoryServices()} />)
    expect(await screen.findByRole('heading', { name: 'Frienzy' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Crea il tuo account/ })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Accedi' }))
    expect(await screen.findByRole('heading', { name: 'Accedi' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
    expect(await screen.findByRole('button', { name: /Crea il tuo account/ })).toBeInTheDocument()
  })

  it('registrazione, uscita e nuovo accesso', async () => {
    render(<App services={createMemoryServices()} />)
    fireEvent.click(await screen.findByRole('button', { name: /Crea il tuo account/ }))
    type('Email', 'ada@example.com')
    type('Password', 'segreta1')
    type('Ripeti la password', 'segreta1')
    fireEvent.click(screen.getByRole('button', { name: 'Continua' }))

    fireEvent.click(await screen.findByRole('button', { name: 'Esci' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Accedi' }))
    expect(await screen.findByRole('heading', { name: 'Accedi' })).toBeInTheDocument()

    type('Email', 'ada@example.com')
    type('Password', 'segreta1')
    fireEvent.click(screen.getByRole('button', { name: 'Accedi' }))
    expect(await screen.findByRole('button', { name: 'Esci' })).toBeInTheDocument()
  })

  it('mostra l\'errore se le password non coincidono', async () => {
    render(<App services={createMemoryServices()} />)
    fireEvent.click(await screen.findByRole('button', { name: /Crea il tuo account/ }))
    type('Email', 'ada@example.com')
    type('Password', 'segreta1')
    type('Ripeti la password', 'diversa')
    fireEvent.click(screen.getByRole('button', { name: 'Continua' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('non coincidono')
  })

  it('mostra l\'errore se la password del login è sbagliata', async () => {
    const services = createMemoryServices()
    await services.auth.register('ada@example.com', 'segreta1')
    await services.auth.logout()
    render(<App services={services} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Accedi' }))
    type('Email', 'ada@example.com')
    type('Password', 'sbagliata')
    fireEvent.click(await screen.findByRole('button', { name: 'Accedi' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Email o password errate.')
  })

  it('dopo la registrazione chiede il profilo, blocca i minorenni e poi mostra l\'età', async () => {
    render(<App services={createMemoryServices()} />)
    fireEvent.click(await screen.findByRole('button', { name: /Crea il tuo account/ }))
    type('Email', 'ada@example.com')
    type('Password', 'segreta1')
    type('Ripeti la password', 'segreta1')
    fireEvent.click(screen.getByRole('button', { name: 'Continua' }))

    await screen.findByRole('heading', { name: 'Come ti chiami?' })
    expect(screen.getByRole('progressbar', { name: 'Passo 2 di 4' })).toBeInTheDocument()
    type('Nome', 'Ada')
    const year = new Date().getUTCFullYear()
    type('Data di nascita', `${year - 10}-01-01`)
    fireEvent.click(screen.getByRole('button', { name: 'Continua' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('almeno 18')

    type('Data di nascita', `${year - 30}-01-01`)
    fireEvent.click(screen.getByRole('button', { name: 'Continua' }))
    await screen.findByRole('heading', { name: 'Cosa ti piace fare?' })
    expect(screen.getByRole('button', { name: 'Salta per ora' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /aperitivo/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Continua' }))
    await screen.findByRole('heading', { name: 'Trova uscite vicino a te' })
    fireEvent.click(screen.getByRole('button', { name: 'Non ora' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Profilo' }))
    expect(await screen.findByText('Ada')).toBeInTheDocument()
    expect(screen.getByText(/^3[01] anni$/)).toBeInTheDocument()
    expect(screen.queryByText(/-01-01/)).toBeNull()
    expect(screen.getByRole('region', { name: 'Statistiche' })).toHaveTextContent('Organizzati')
  })
})
