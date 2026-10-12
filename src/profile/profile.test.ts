import { MemoryUserRepository } from '../data/memory/memoryUserRepository'
import { saveProfile, toProfileInput } from './profileService'
import { validateBirthDate, validatePhotoFile, validateProfile, type ProfileInput } from './validation'

const today = new Date('2026-10-12T10:00:00Z')
const valid: ProfileInput = {
  nome: 'Ada',
  dataNascita: '1995-03-10',
  bio: 'Amo le passeggiate.',
  interessi: ['passeggiata', 'cena'],
  fotoUrl: '',
}

describe('validazione profilo', () => {
  it('accetta un profilo corretto', () => {
    expect(validateProfile(valid, today)).toBeNull()
  })
  it('blocca chi ha meno di 18 anni', () => {
    expect(validateBirthDate('2008-10-13', today)).toContain('almeno 18')
    expect(validateBirthDate('2008-10-12', today)).toBeNull()
  })
  it('rifiuta date future, inesistenti o troppo vecchie', () => {
    expect(validateBirthDate('2030-01-01', today)).not.toBeNull()
    expect(validateBirthDate('2001-02-31', today)).not.toBeNull()
    expect(validateBirthDate('1800-01-01', today)).not.toBeNull()
  })
  it('controlla nome, bio, interessi e foto', () => {
    expect(validateProfile({ ...valid, nome: ' A ' }, today)).toContain('nome')
    expect(validateProfile({ ...valid, bio: 'x'.repeat(301) }, today)).toContain('bio')
    expect(validateProfile({ ...valid, interessi: ['volo'] }, today)).toContain('interessi')
    expect(validateProfile({ ...valid, fotoUrl: 'http://x.it/a.jpg' }, today)).toContain('foto')
  })
  it('controlla il file della foto', () => {
    expect(validatePhotoFile({ type: 'image/jpeg', size: 1000 })).toBeNull()
    expect(validatePhotoFile({ type: 'text/plain', size: 10 })).toContain('immagine')
    expect(validatePhotoFile({ type: 'image/png', size: 6 * 1024 * 1024 })).toContain('pesa')
  })
})

describe('saveProfile', () => {
  it('salva il profilo ripulito e lo rilegge', async () => {
    const users = new MemoryUserRepository()
    await saveProfile(users, 'u1', { ...valid, nome: '  Ada  ' }, today)
    const stored = await users.getById('u1')
    expect(stored?.nome).toBe('Ada')
    expect(stored?.dataNascita).toEqual(new Date('1995-03-10T00:00:00Z'))
    expect(toProfileInput(stored!)).toEqual(valid)
  })
  it('non salva nulla se i dati non sono validi', async () => {
    const users = new MemoryUserRepository()
    await expect(saveProfile(users, 'u1', { ...valid, dataNascita: '2015-01-01' }, today)).rejects.toThrow('almeno 18')
    expect(await users.getById('u1')).toBeNull()
  })
  it('modificando il profilo conserva la data di creazione', async () => {
    const users = new MemoryUserRepository()
    await saveProfile(users, 'u1', valid, new Date('2026-01-01T00:00:00Z'))
    await saveProfile(users, 'u1', { ...valid, bio: 'Nuova bio' }, today)
    const stored = await users.getById('u1')
    expect(stored?.creatoIl).toEqual(new Date('2026-01-01T00:00:00Z'))
    expect(stored?.bio).toBe('Nuova bio')
  })
})
