import { render, screen } from '@testing-library/react'
import { App } from './App'

describe('App', () => {
  it('mostra il nome dell\'app', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Frienzy' })).toBeInTheDocument()
  })
})
