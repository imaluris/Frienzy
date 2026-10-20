import { createMemoryServices } from '../data/memory/createMemoryServices'
import type { NewEvent } from '../domain/event'
import type { UserProfile } from '../domain/user'
import { joinEvent } from '../participation/joinEvent'
import { respondToRequest } from '../participation/respondToRequest'
import { loadEventPeople } from './loadEventPeople'
import { toPublicProfile } from './publicProfile'
import { visiblePeople } from './visiblePeople'

const today = new Date('2030-06-15T12:00:00Z')
const base: NewEvent = {
  organizzatoreId: 'org', tipo: 'cena', titolo: 'Cena', descrizione: '', dataOra: new Date('2031-01-01T20:00:00Z'),
  zonaNome: 'Navigli', latApprossimata: 45.45, lngApprossimata: 9.18, geohash: 'u0nd9h',
  maxPartecipanti: 5, richiedeApprovazione: true,
}
const place = { indirizzo: 'Via Roma 1', lat: 45.4512, lng: 9.1823 }
const profile = (uid: string, nome: string): UserProfile => ({
  uid, nome, dataNascita: new Date('2000-06-16T00:00:00Z'), bio: `bio di ${nome}`, interessi: ['cena'], fotoUrl: '', creatoIl: today,
})

async function setup() {
  const services = createMemoryServices()
  for (const [uid, nome] of [['org', 'Olga'], ['anna', 'Anna'], ['bruno', 'Bruno'], ['carla', 'Carla']]) {
    await services.users.save(profile(uid, nome))
  }
  const event = await services.events.create(base, place)
  return { services, event }
}

describe('profili visibili nell\'evento', () => {
  it('toPublicProfile calcola l\'età e non porta la data di nascita', () => {
    const pub = toPublicProfile(profile('anna', 'Anna'), 'partecipante', today)
    expect(pub.eta).toBe(29) // compie 30 anni il giorno dopo
    expect(pub).not.toHaveProperty('dataNascita')
  })

  it('visiblePeople: organizzatore per primo, solo confermati, nessun doppione', () => {
    const mk = (uid: string, stato: 'richiesta' | 'confermato' | 'rifiutato') => ({ eventId: 'e', uid, stato, creatoIl: today })
    const result = visiblePeople({ ...base, id: 'e', stato: 'aperto', creatoIl: today }, [
      mk('anna', 'confermato'), mk('bruno', 'richiesta'), mk('carla', 'rifiutato'), mk('org', 'confermato'),
    ])
    expect(result).toEqual([{ uid: 'org', ruolo: 'organizzatore' }, { uid: 'anna', ruolo: 'partecipante' }])
  })

  it('mostra organizzatore e confermati, non richieste né rifiutati', async () => {
    const { services, event } = await setup()
    for (const uid of ['anna', 'bruno', 'carla']) await joinEvent(services.participations, event.id, uid)
    await respondToRequest(services.participations, event.id, 'anna', 'org', 'accetta')
    await respondToRequest(services.participations, event.id, 'carla', 'org', 'rifiuta')
    const people = await loadEventPeople(services.users, services.participations, event, today)
    expect(people.map((p) => [p.nome, p.ruolo])).toEqual([['Olga', 'organizzatore'], ['Anna', 'partecipante']])
  })

  it('salta chi non ha ancora un profilo', async () => {
    const { services, event } = await setup()
    await services.participations.add(event.id, 'fantasma', 'confermato')
    const people = await loadEventPeople(services.users, services.participations, event, today)
    expect(people.map((p) => p.nome)).toEqual(['Olga'])
  })
})
