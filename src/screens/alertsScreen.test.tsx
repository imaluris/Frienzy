import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { App } from '../App'
import { createMemoryServices } from '../data/memory/createMemoryServices'
import type { NewEvent } from '../domain/event'
import { DEFAULT_PREFS } from '../notifications/prefs'
import { openAlerts, START, titleOf } from '../nav/navState'
import { useFixedMonday } from '../test/fixedMonday'

const place = { indirizzo: 'Via Roma 1', lat: 45.45, lng: 9.17 }
const event = (over: Partial<NewEvent> = {}): NewEvent => ({
  organizzatoreId: 'org', tipo: 'cena', titolo: 'Cena sul Naviglio', descrizione: '', dataOra: new Date(Date.now() + 3 * 86_400_000),
  zonaNome: 'Navigli', latApprossimata: 45.45, lngApprossimata: 9.17, geohash: 'u0nd8k', maxPartecipanti: 4, richiedeApprovazione: false, ...over,
})

async function setup() {
  const services = createMemoryServices()
  const me = await services.auth.register('ada@example.com', 'segreta1')
  await services.users.save({ uid: me, nome: 'Ada', dataNascita: new Date('1990-01-01T00:00:00Z'), bio: '', interessi: ['cena'], fotoUrl: '', creatoIl: new Date() })
  await services.notifications.savePrefs(me, { ...DEFAULT_PREFS, inviti: true })
  return { services, me }
}

describe('schermata Avvisi', () => {
  useFixedMonday()

  it('la campanella mostra quanti avvisi nuovi; aprendola si vedono e il contatore si azzera', async () => {
    const { services } = await setup()
    await services.events.create(event(), place)
    render(<App services={services} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Avvisi, 1 nuovi' }))
    expect(await screen.findByText('Un evento per te: Cena sul Naviglio')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Nuovo' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
    expect(await screen.findByRole('button', { name: 'Avvisi' })).toBeInTheDocument()
  })

  it('senza nulla da dire mostra lo stato vuoto', async () => {
    const { services } = await setup()
    render(<App services={services} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Avvisi' }))
    expect(await screen.findByText(/Nessun avviso per ora/)).toBeInTheDocument()
  })

  it('toccando un avviso si apre l\'evento', async () => {
    const { services } = await setup()
    await services.events.create(event(), place)
    render(<App services={services} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Avvisi, 1 nuovi' }))
    fireEvent.click(await screen.findByText('Un evento per te: Cena sul Naviglio'))
    expect(await screen.findByRole('heading', { name: 'Cena sul Naviglio' })).toBeInTheDocument()
  })

  it('l\'organizzatore vede le richieste in attesa', async () => {
    const { services, me } = await setup()
    const mio = await services.events.create(event({ organizzatoreId: me, richiedeApprovazione: true }), place)
    await services.participations.add(mio.id, 'bruno', 'richiesta')
    render(<App services={services} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Avvisi, 1 nuovi' }))
    expect(await screen.findByText('1 richiesta in attesa')).toBeInTheDocument()
  })
})

describe('navigazione verso gli avvisi', () => {
  it('apre la schermata Avvisi con il titolo giusto', () => {
    const nav = openAlerts(START)
    expect(nav.overlay.kind).toBe('alerts')
    expect(titleOf(nav)).toBe('Avvisi')
  })
})
