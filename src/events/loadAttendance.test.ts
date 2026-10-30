import { describe, expect, it } from 'vitest'
import { createMemoryServices } from '../data/memory/createMemoryServices'
import { loadAttendance } from './loadAttendance'

describe('loadAttendance', () => {
  it('mette per primo l\'organizzatore e conta solo i confermati', async () => {
    const s = createMemoryServices()
    const profile = (uid: string, nome: string) => ({ uid, nome, dataNascita: new Date('1990-01-01'), bio: '', interessi: [], fotoUrl: '', creatoIl: new Date() })
    await s.users.save(profile('o', 'Olga'))
    await s.users.save(profile('a', 'Anna'))
    const event = await s.events.create(
      { organizzatoreId: 'o', tipo: 'cena', titolo: 'Cena', descrizione: '', dataOra: new Date(Date.now() + 1e8), zonaNome: 'Milano', latApprossimata: 45, lngApprossimata: 9, geohash: 'u0nd9h', maxPartecipanti: 5, richiedeApprovazione: false },
      { indirizzo: 'Via X 1', lat: 45, lng: 9 },
    )
    await s.participations.add(event.id, 'a', 'confermato')
    await s.participations.add(event.id, 'senza-profilo', 'confermato')
    await s.participations.add(event.id, 'r', 'richiesta')
    expect(await loadAttendance(s.participations, s.users, event)).toEqual({ names: ['Olga', 'Anna'], confirmed: 2 })
  })
})
