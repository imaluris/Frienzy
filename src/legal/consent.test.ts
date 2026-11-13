import { buildConsent, isConsentCurrent, NO_CONSENT, TERMS_VERSION, validateConsent } from './consent'
import { createMemoryServices } from '../data/memory/createMemoryServices'
import { saveProfile } from '../profile/profileService'
import { legalLink } from '../config/links'

describe('consenso', () => {
  it('servono entrambe le caselle, e la maggiore età viene prima', () => {
    expect(validateConsent(NO_CONSENT)).toMatch(/18 anni/)
    expect(validateConsent({ terms: true, adult: false })).toMatch(/18 anni/)
    expect(validateConsent({ terms: false, adult: true })).toMatch(/Termini d'uso/)
    expect(validateConsent({ terms: true, adult: true })).toBeNull()
  })
  it('buildConsent registra versione e data; senza caselle lancia', () => {
    const now = new Date('2030-01-02T10:00:00Z')
    expect(buildConsent({ terms: true, adult: true }, now)).toEqual({ versione: TERMS_VERSION, accettatoIl: now, maggiorenne: true })
    expect(() => buildConsent({ terms: true, adult: false })).toThrow(/18 anni/)
  })
  it('un consenso di un\'altra versione non è aggiornato', () => {
    expect(isConsentCurrent(undefined)).toBe(false)
    expect(isConsentCurrent({ versione: '2020-01', accettatoIl: new Date(), maggiorenne: true })).toBe(false)
    expect(isConsentCurrent(buildConsent({ terms: true, adult: true }))).toBe(true)
  })
  it('i link legali puntano alle pagine statiche', () => {
    expect(legalLink('privacy', 'https://x.it')).toBe('https://x.it/privacy.html')
    expect(legalLink('termini', 'https://x.it')).toBe('https://x.it/termini.html')
  })
})

describe('salvataggio del consenso nel profilo', () => {
  const input = { nome: 'Ada', dataNascita: '1990-01-01', bio: '', interessi: [], fotoUrl: '' }
  const today = new Date('2030-06-01T00:00:00Z')

  it('si salva con la data, e una modifica successiva del profilo lo conserva', async () => {
    const { users } = createMemoryServices()
    const consent = buildConsent({ terms: true, adult: true }, today)
    const first = await saveProfile(users, 'u1', input, today, consent)
    expect(first.consenso).toEqual(consent)
    const edited = await saveProfile(users, 'u1', { ...input, bio: 'Ciao' }, today)
    expect(edited.consenso).toEqual(consent)
    expect((await users.getById('u1'))?.consenso?.accettatoIl).toEqual(today)
  })
  it('un profilo vecchio senza consenso resta senza finché non lo dà', async () => {
    const { users } = createMemoryServices()
    expect((await saveProfile(users, 'u2', input, today)).consenso).toBeUndefined()
  })
})
