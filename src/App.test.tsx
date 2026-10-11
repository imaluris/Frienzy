import { fireEvent, render, screen } from '@testing-library/react'
import { App } from './App'
import { createMemoryServices } from './data/memory/createMemoryServices'

function type(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

describe('App: registrazione, login e logout', () => {
  it('senza accesso mostra il login con il nome dell\'app', async () => {
    render(<App services={createMemoryServices()} />)
    expect(await screen.findByRole('heading', { name: 'Accedi' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Frienzy' })).toBeInTheDocument()
  })

  it('registrazione, uscita e nuovo accesso', async () => {
    render(<App services={createMemoryServices()} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Registrati' }))
    type('Email', 'ada@example.com')
    type('Password', 'segreta1')
    type('Ripeti la password', 'segreta1')
    fireEvent.click(screen.getByRole('button', { name: 'Registrati' }))

    fireEvent.click(await screen.findByRole('button', { name: 'Esci' }))
    expect(await screen.findByRole('heading', { name: 'Accedi' })).toBeInTheDocument()

    type('Email', 'ada@example.com')
    type('Password', 'segreta1')
    fireEvent.click(screen.getByRole('button', { name: 'Accedi' }))
    expect(await screen.findByRole('button', { name: 'Esci' })).toBeInTheDocument()
  })

  it('mostra l\'errore se le password non coincidono', async () => {
    render(<App services={createMemoryServices()} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Registrati' }))
    type('Email', 'ada@example.com')
    type('Password', 'segreta1')
    type('Ripeti la password', 'diversa')
    fireEvent.click(screen.getByRole('button', { name: 'Registrati' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('non coincidono')
  })

  it('mostra l\'errore se la password del login è sbagliata', async () => {
    const services = createMemoryServices()
    await services.auth.register('ada@example.com', 'segreta1')
    await services.auth.logout()
    render(<App services={services} />)
    type('Email', 'ada@example.com')
    type('Password', 'sbagliata')
    fireEvent.click(await screen.findByRole('button', { name: 'Accedi' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Email o password errate.')
  })
})
