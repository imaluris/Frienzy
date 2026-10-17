import { readFileSync } from 'node:fs'
import { EVENT_TYPE_IDS } from './domain/eventTypes'

// Controllo "di superficie" sulle regole: non le esegue (serve l'emulatore, vedi rules-tests/),
// ma si accorge se un principio sparisce dal file o se i tipi evento non coincidono.
const rules = readFileSync('firestore.rules', 'utf8')

describe('firestore.rules (controllo statico)', () => {
  it('nomina le raccolte previste', () => {
    for (const path of ['match /users/{uid}', 'match /events/{eventId}', 'match /privato/{doc}', 'match /partecipanti/{uid}', 'match /contatori/{doc}']) {
      expect(rules).toContain(path)
    }
  })

  it('elenca gli stessi tipi evento dell\'app', () => {
    for (const id of EVENT_TYPE_IDS) expect(rules).toContain(`'${id}'`)
  })

  it('niente scritture aperte a tutti', () => {
    expect(rules).not.toMatch(/allow\s+(read,\s*write|write)\s*:\s*if\s+true/)
  })

  it('il luogo esatto passa da organizzatore o confermato', () => {
    expect(rules).toContain('isOrganizer(eventId) || isConfirmed(eventId)')
  })

  it('il limite posti sta nelle regole (contatore +1 e mai oltre il massimo)', () => {
    expect(rules).toContain('seatsAfter(eventId) == seatsNow(eventId) + 1')
    expect(rules).toContain('<= eventNow(eventId).maxPartecipanti')
  })
})
