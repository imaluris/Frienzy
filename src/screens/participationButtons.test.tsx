import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { App } from '../App'
import { createMemoryServices } from '../data/memory/createMemoryServices'
import type { NewEvent } from '../domain/event'
import { joinEvent } from '../participation/joinEvent'

const place = { indirizzo: 'Via Roma 1', lat: 45.45, lng: 9.17 }
const base: NewEvent = {
  organizzatoreId: 'org', tipo: 'cena', titolo: 'Cena di prova', descrizione: '',
  dataOra: new Date(Date.now() + 3 * 24 * 3600 * 1000), zonaNome: 'Navigli', latApprossimata: 45.45,
  lngApprossimata: 9.17, geohash: 'u0nd8k', maxPartecipanti: 4, richiedeApprovazione: false,
}
const profile = (uid: string, nome: string) => ({ uid, nome, dataNascita: new Date('1990-01-01T00:00:00Z'), bio: '', interessi: [], fotoUrl: '', creatoIl: new Date() })

async function setup(over: Partial<NewEvent> = {}) {
  const services = createMemoryServices()
  const me = await services.auth.register('ada@example.com', 'segreta1')
  await services.users.save(profile(me, 'Ada'))
  await services.users.save(profile('org', 'Olga'))
  const event = await services.events.create({ ...base, ...over }, place)
  return { services, me, event }
}

async function openDetail(services: ReturnType<typeof createMemoryServices>, titolo = /Cena di prova/) {
  render(<App services={services} />)
  fireEvent.click(await screen.findByRole('button', { name: 'Eventi' }))
  fireEvent.click(await screen.findByRole('button', { name: titolo }))
}

describe('pulsanti di partecipazione', () => {
  it('evento libero: Partecipa conferma subito, Ritirati toglie il posto', async () => {
    const { services, event } = await setup()
    await openDetail(services)
    fireEvent.click(await screen.findByRole('button', { name: 'Partecipa' }))
    expect(await screen.findByText(/partecipazione è confermata/)).toBeInTheDocument()
    expect((await services.participations.listConfirmed(event.id)).length).toBe(1)
    fireEvent.click(screen.getByRole('button', { name: 'Ritirati' }))
    expect(screen.getByRole('dialog', { name: 'Vuoi ritirarti?' })).toBeInTheDocument() // prima la conferma
    expect((await services.participations.listConfirmed(event.id)).length).toBe(1)
    fireEvent.click(screen.getByRole('button', { name: 'Sì, ritirati' }))
    expect(await screen.findByRole('button', { name: 'Partecipa' })).toBeInTheDocument()
    expect((await services.participations.listConfirmed(event.id)).length).toBe(0)
  })

  it("con approvazione: Chiedi di partecipare crea una richiesta che si può ritirare", async () => {
    const { services, event, me } = await setup({ richiedeApprovazione: true })
    await openDetail(services)
    fireEvent.click(await screen.findByRole('button', { name: 'Chiedi di partecipare' }))
    expect(await screen.findByText(/Richiesta inviata/)).toBeInTheDocument()
    expect((await services.participations.get(event.id, me))?.stato).toBe('richiesta')
    fireEvent.click(screen.getByRole('button', { name: 'Ritira la richiesta' }))
    fireEvent.click(screen.getByRole('button', { name: 'Sì, ritira' }))
    expect(await screen.findByRole('button', { name: 'Chiedi di partecipare' })).toBeInTheDocument()
  })

  it('evento pieno: nessun pulsante Partecipa, messaggio chiaro', async () => {
    const { services, event } = await setup({ maxPartecipanti: 1 })
    await joinEvent(services.participations, event.id, 'altro')
    await openDetail(services)
    expect(await screen.findByText(/Posti esauriti/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Partecipa' })).toBeNull()
  })

  it("se i posti finiscono mentre si preme, compare l'errore", async () => {
    const { services, event } = await setup({ maxPartecipanti: 1 })
    await openDetail(services)
    const button = await screen.findByRole('button', { name: 'Partecipa' })
    await joinEvent(services.participations, event.id, 'altro') // qualcuno arriva prima
    fireEvent.click(button)
    expect(await screen.findByRole('alert')).toHaveTextContent('Posti esauriti')
  })
})

describe('pannello organizzatore', () => {
  it('accetta e rifiuta le richieste, poi annulla l’evento', async () => {
    const { services, me, event } = await setup({ organizzatoreId: 'x', richiedeApprovazione: true })
    // l'evento è di Ada: ricreato con il suo uid
    const mine = await services.events.create({ ...base, organizzatoreId: me, richiedeApprovazione: true, titolo: 'Mia cena' }, place)
    for (const [uid, nome] of [['bruno', 'Bruno'], ['carla', 'Carla']]) {
      await services.users.save(profile(uid, nome))
      await joinEvent(services.participations, mine.id, uid)
    }
    expect(event.id).not.toBe(mine.id)
    await openDetail(services, /Mia cena/)
    fireEvent.click(await screen.findByRole('button', { name: /Gestisci evento/ }))
    fireEvent.click(await screen.findByRole('button', { name: 'Accetta Bruno' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Rifiuta Carla' }))
    expect(await screen.findByText('Nessuna richiesta in attesa.')).toBeInTheDocument()
    expect((await services.participations.get(mine.id, 'bruno'))?.stato).toBe('confermato')
    expect((await services.participations.get(mine.id, 'carla'))?.stato).toBe('rifiutato')
    fireEvent.click(screen.getByRole('button', { name: 'Annulla evento' }))
    fireEvent.click(screen.getByRole('button', { name: "Sì, annulla l'evento" }))
    expect(await screen.findByText('Questo evento è stato annullato.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Annulla evento' })).toBeNull()
  })
})
