import '@testing-library/jest-dom/vitest'
import { configure, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { App } from '../App'
import { useFixedMonday } from '../test/fixedMonday'
import { createMemoryServices } from '../data/memory/createMemoryServices'
import type { NewEvent } from '../domain/event'
import type { MemoryReportRepository } from '../safety/memoryReportRepository'

configure({ asyncUtilTimeout: 5000 })

const place = { indirizzo: 'Via Roma 1', lat: 45.45, lng: 9.17 }
const base: NewEvent = {
  organizzatoreId: 'org', tipo: 'cena', titolo: 'Cena di prova', descrizione: '',
  dataOra: new Date(Date.now() + 3 * 24 * 3600 * 1000), zonaNome: 'Navigli', latApprossimata: 45.45,
  lngApprossimata: 9.17, geohash: 'u0nd8k', maxPartecipanti: 4, richiedeApprovazione: false,
}
const profile = (uid: string, nome: string) => ({ uid, nome, dataNascita: new Date('1990-01-01T00:00:00Z'), bio: '', interessi: [], fotoUrl: '', creatoIl: new Date() })

async function setup(organizer = false) {
  const services = createMemoryServices()
  const me = await services.auth.register('ada@example.com', 'segreta1')
  await services.users.save(profile(me, 'Ada'))
  await services.users.save(profile('org', 'Olga'))
  await services.users.save(profile('bea', 'Bea'))
  const event = await services.events.create({ ...base, organizzatoreId: organizer ? me : 'org' }, place)
  await services.participations.add(event.id, 'bea', 'confermato')
  render(<App services={services} />)
  fireEvent.click(await screen.findByRole('button', { name: 'Eventi' }))
  fireEvent.click((await screen.findAllByRole('button', { name: /Cena di prova/ }))[0])
  await screen.findByRole('heading', { name: /Chi c'è/ }) // il dettaglio è caricato
  return { services, me, event }
}

describe('segnala e blocca dalle schermate', () => {
  useFixedMonday()

  it("segnala l'evento: motivo obbligatorio, poi la segnalazione viene salvata", async () => {
    const { services, me, event } = await setup()
    fireEvent.click(await screen.findByRole('button', { name: 'Altre azioni' }))
    fireEvent.click(screen.getByRole('button', { name: 'Segnala questo evento' }))
    expect(screen.getByRole('button', { name: 'Invia segnalazione' })).toBeDisabled()
    fireEvent.click(screen.getByLabelText('Truffa o richiesta di soldi'))
    fireEvent.click(screen.getByRole('button', { name: 'Invia segnalazione' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect((services.reports as MemoryReportRepository).all()).toEqual([{ reporterUid: me, tipo: 'evento', targetId: event.id, motivo: 'truffa', dettagli: '' }])
  })

  it('"Altro" senza spiegazione mostra l\'errore e non salva', async () => {
    const { services } = await setup()
    fireEvent.click(await screen.findByRole('button', { name: 'Altre azioni' }))
    fireEvent.click(screen.getByRole('button', { name: 'Segnala Olga' }))
    fireEvent.click(screen.getByLabelText('Altro'))
    fireEvent.click(screen.getByRole('button', { name: 'Invia segnalazione' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/Altro/)
    expect((services.reports as MemoryReportRepository).all()).toHaveLength(0)
  })

  it("bloccare chi organizza chiede conferma, riporta all'elenco e nasconde l'evento", async () => {
    const { services, me } = await setup()
    fireEvent.click(await screen.findByRole('button', { name: 'Altre azioni' }))
    fireEvent.click(screen.getByRole('button', { name: 'Blocca Olga' }))
    expect(screen.getByRole('dialog', { name: 'Bloccare Olga?' })).toBeInTheDocument()
    expect(await services.blocks.listBlockedBy(me)).toEqual([])
    fireEvent.click(screen.getByRole('button', { name: 'Blocca' }))
    await waitFor(async () => expect(await services.blocks.listBlockedBy(me)).toEqual(['org']))
    await waitFor(() => expect(screen.queryByRole('button', { name: /Cena di prova/ })).toBeNull())
  })

  it('annullare la conferma non blocca nessuno', async () => {
    const { services, me } = await setup()
    fireEvent.click(await screen.findByRole('button', { name: 'Altre azioni' }))
    fireEvent.click(screen.getByRole('button', { name: 'Blocca Olga' }))
    fireEvent.click(screen.getByRole('button', { name: 'Annulla' }))
    expect(await services.blocks.listBlockedBy(me)).toEqual([])
  })

  it("chi organizza non vede il menu sull'evento proprio, ma può bloccare un partecipante dall'elenco", async () => {
    const { services, me } = await setup(true)
    expect(screen.queryByRole('button', { name: 'Altre azioni' })).toBeNull()
    fireEvent.click(await screen.findByRole('button', { name: 'Altre azioni per Bea' }))
    expect(screen.queryByRole('button', { name: /Altre azioni per Ada/ })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Blocca Bea' }))
    fireEvent.click(screen.getByRole('button', { name: 'Blocca' }))
    await waitFor(async () => expect(await services.blocks.listBlockedBy(me)).toEqual(['bea']))
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Altre azioni per Bea' })).toBeNull())
  })

  it('dal Profilo si vedono i bloccati e si sbloccano', async () => {
    const services = createMemoryServices()
    const me = await services.auth.register('ada@example.com', 'segreta1')
    await services.users.save(profile(me, 'Ada'))
    await services.users.save(profile('bea', 'Bea'))
    await services.blocks.block(me, 'bea')
    render(<App services={services} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Profilo' }))
    fireEvent.click(await screen.findByRole('button', { name: /Utenti bloccati \(1\)/ }))
    const sheet = await screen.findByRole('dialog', { name: 'Utenti bloccati' })
    expect(await within(sheet).findByText('Bea')).toBeInTheDocument()
    fireEvent.click(within(sheet).getByRole('button', { name: 'Sblocca' }))
    expect(await within(sheet).findByText('Non hai bloccato nessuno.')).toBeInTheDocument()
    expect(await services.blocks.listBlockedBy(me)).toEqual([])
  })
})
