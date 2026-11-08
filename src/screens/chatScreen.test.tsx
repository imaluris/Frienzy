import '@testing-library/jest-dom/vitest'
import { configure, fireEvent, render, screen } from '@testing-library/react'
import { App } from '../App'
import { useFixedMonday } from '../test/fixedMonday'
import { createMemoryServices } from '../data/memory/createMemoryServices'
import type { NewEvent } from '../domain/event'

// Con tutti i test in parallelo la macchina rallenta: si aspetta di più prima di dichiarare un errore.
configure({ asyncUtilTimeout: 5000 })

const place = { indirizzo: 'Via Roma 1', lat: 45.45, lng: 9.17 }
const base: NewEvent = {
  organizzatoreId: 'org', tipo: 'cena', titolo: 'Cena di prova', descrizione: '',
  dataOra: new Date(Date.now() + 3 * 24 * 3600 * 1000), zonaNome: 'Navigli', latApprossimata: 45.45,
  lngApprossimata: 9.17, geohash: 'u0nd8k', maxPartecipanti: 4, richiedeApprovazione: false,
}
const profile = (uid: string, nome: string) => ({ uid, nome, dataNascita: new Date('1990-01-01T00:00:00Z'), bio: '', interessi: [], fotoUrl: '', creatoIl: new Date() })

async function setup(status: 'confermato' | 'richiesta' | null, organizer = false) {
  const services = createMemoryServices()
  const me = await services.auth.register('ada@example.com', 'segreta1')
  await services.users.save(profile(me, 'Ada'))
  await services.users.save(profile('org', 'Olga'))
  const event = await services.events.create({ ...base, organizzatoreId: organizer ? me : 'org' }, place)
  if (status) await services.participations.add(event.id, me, status)
  render(<App services={services} />)
  fireEvent.click(await screen.findByRole('button', { name: 'Eventi' }))
  fireEvent.click((await screen.findAllByRole('button', { name: /Cena di prova/ }))[0])
  return { services, me, event }
}

describe('chat dal dettaglio', () => {
  useFixedMonday()

  it('chi non è confermato vede il segnaposto e non può aprire la chat', async () => {
    await setup('richiesta')
    expect(await screen.findByText('La chat si apre quando sei confermato.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Chat dell'evento/ })).toBeNull()
  })

  it('un confermato apre la chat, scrive e vede il proprio messaggio; indietro torna all\'evento', async () => {
    const { services, event } = await setup('confermato')
    await services.chat.send(event.id, 'org', 'Benvenuta!')
    fireEvent.click(await screen.findByRole('button', { name: /Chat dell'evento/ }))
    expect(await screen.findByText('Benvenuta!')).toBeInTheDocument()
    expect(await screen.findByText('Olga')).toBeInTheDocument() // i nomi arrivano dopo il caricamento delle persone
    fireEvent.change(screen.getByLabelText('Scrivi un messaggio'), { target: { value: 'Ciao, ci sono!' } })
    fireEvent.click(screen.getByRole('button', { name: 'Invia' }))
    expect(await screen.findByText('Ciao, ci sono!')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Cancella il messaggio/ })).toBeNull() // non organizza
    fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
    expect(await screen.findByRole('button', { name: /Chat dell'evento/ })).toBeInTheDocument()
  })

  it("l'invio è spento con il campo vuoto", async () => {
    await setup('confermato')
    fireEvent.click(await screen.findByRole('button', { name: /Chat dell'evento/ }))
    expect(await screen.findByRole('button', { name: 'Invia' })).toBeDisabled()
  })

  it("l'organizzatore cancella un messaggio dopo la conferma", async () => {
    const { services, event } = await setup(null, true)
    await services.chat.send(event.id, event.organizzatoreId, 'Da togliere')
    fireEvent.click(await screen.findByRole('button', { name: /Chat dell'evento/ }))
    expect(await screen.findByText('Da togliere')).toBeInTheDocument()
    fireEvent.click(await screen.findByRole('button', { name: /Cancella il messaggio/ }))
    expect(screen.getByRole('dialog', { name: 'Cancellare il messaggio?' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Sì, cancella' }))
    expect(await screen.findByText(/Ancora nessun messaggio/)).toBeInTheDocument()
  })
})
