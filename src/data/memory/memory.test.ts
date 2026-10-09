import { MemoryUserRepository } from './memoryUserRepository'
import { MemoryEventRepository } from './memoryEventRepository'
import { MemoryParticipationRepository } from './memoryParticipationRepository'
import type { NewEvent } from '../../domain/event'
import type { UserProfile } from '../../domain/user'

const profile: UserProfile = {
  uid: 'u1',
  nome: 'Giulia',
  dataNascita: new Date('1995-05-10'),
  bio: 'Ciao',
  interessi: ['trekking'],
  fotoUrl: '',
  creatoIl: new Date('2026-01-01'),
}

const newEvent: NewEvent = {
  organizzatoreId: 'u1',
  tipo: 'aperitivo',
  titolo: 'Spritz al tramonto',
  descrizione: '',
  dataOra: new Date('2026-11-01T18:00:00Z'),
  zonaNome: 'Navigli',
  latApprossimata: 45.45,
  lngApprossimata: 9.18,
  geohash: 'u0nd9',
  maxPartecipanti: 6,
  richiedeApprovazione: false,
}

describe('MemoryUserRepository', () => {
  it('salva e rilegge un profilo', async () => {
    const repo = new MemoryUserRepository()
    await repo.save(profile)
    expect(await repo.getById('u1')).toEqual(profile)
  })

  it('restituisce null se il profilo non esiste', async () => {
    expect(await new MemoryUserRepository().getById('nessuno')).toBeNull()
  })

  it('non è influenzato da modifiche all\'oggetto originale', async () => {
    const repo = new MemoryUserRepository()
    const mine = { ...profile, interessi: [...profile.interessi] }
    await repo.save(mine)
    mine.interessi.push('cena')
    expect((await repo.getById('u1'))?.interessi).toEqual(['trekking'])
  })
})

describe('MemoryEventRepository', () => {
  const place = { indirizzo: 'Via Test 1', lat: 45.451, lng: 9.181 }

  it('crea un evento aperto con id e data di creazione', async () => {
    const repo = new MemoryEventRepository(() => 'e1', () => new Date('2026-10-01'))
    const created = await repo.create(newEvent, place)
    expect(created).toMatchObject({ id: 'e1', stato: 'aperto', titolo: 'Spritz al tramonto' })
    expect(created.creatoIl).toEqual(new Date('2026-10-01'))
    expect(await repo.getById('e1')).toEqual(created)
  })

  it('elenca gli eventi creati', async () => {
    let n = 0
    const repo = new MemoryEventRepository(() => `e${++n}`)
    await repo.create(newEvent, place)
    await repo.create({ ...newEvent, titolo: 'Cena' }, place)
    expect((await repo.list()).map((e) => e.id)).toEqual(['e1', 'e2'])
  })

  it('aggiorna uno stato e dà errore su evento inesistente', async () => {
    const repo = new MemoryEventRepository(() => 'e1')
    await repo.create(newEvent, place)
    expect((await repo.update('e1', { stato: 'annullato' })).stato).toBe('annullato')
    await expect(repo.update('zzz', { titolo: 'x' })).rejects.toThrow()
  })
})

describe('MemoryParticipationRepository', () => {
  it('aggiunge e rilegge una partecipazione', async () => {
    const repo = new MemoryParticipationRepository()
    await repo.add('e1', 'u2', 'richiesta')
    expect((await repo.get('e1', 'u2'))?.stato).toBe('richiesta')
  })

  it('rifiuta una seconda iscrizione dello stesso utente', async () => {
    const repo = new MemoryParticipationRepository()
    await repo.add('e1', 'u2', 'confermato')
    await expect(repo.add('e1', 'u2', 'confermato')).rejects.toThrow()
  })

  it('elenca per evento e per utente', async () => {
    const repo = new MemoryParticipationRepository()
    await repo.add('e1', 'u2', 'confermato')
    await repo.add('e1', 'u3', 'richiesta')
    await repo.add('e2', 'u2', 'confermato')
    expect(await repo.listByEvent('e1')).toHaveLength(2)
    expect(await repo.listByUser('u2')).toHaveLength(2)
  })

  it('cambia lo stato di una richiesta', async () => {
    const repo = new MemoryParticipationRepository()
    await repo.add('e1', 'u3', 'richiesta')
    expect((await repo.setStatus('e1', 'u3', 'confermato')).stato).toBe('confermato')
    await expect(repo.setStatus('e1', 'nessuno', 'rifiutato')).rejects.toThrow()
  })
})
