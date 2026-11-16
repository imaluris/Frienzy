import { readFileSync } from 'node:fs'
import { LIMIT_SECONDS, secondsToWait, type LimitField } from './limits'

const rules = readFileSync('firestore.rules', 'utf8')

describe('secondsToWait', () => {
  const now = new Date('2026-11-16T10:00:00Z')
  it('nessuna azione precedente: si può subito', () => {
    expect(secondsToWait(null, 'ultimoMessaggio', now)).toBe(0)
  })
  it('conta i secondi che mancano, arrotondando in su', () => {
    expect(secondsToWait(new Date(now.getTime() - 20_000), 'ultimoEvento', now)).toBe(40)
    expect(secondsToWait(new Date(now.getTime() - 500), 'ultimoMessaggio', now)).toBe(2)
  })
  it('passato l\'intervallo torna a zero', () => {
    expect(secondsToWait(new Date(now.getTime() - 61_000), 'ultimoEvento', now)).toBe(0)
  })
})

describe('limiti: coerenza con firestore.rules', () => {
  for (const field of Object.keys(LIMIT_SECONDS) as LimitField[]) {
    it(`${field}: stesso intervallo nell'app e nelle regole`, () => {
      expect(rules).toContain(`limitStep(before, after, '${field}', ${LIMIT_SECONDS[field]})`)
    })
  }
  it('eventi, messaggi e segnalazioni richiedono il timbro', () => {
    for (const field of Object.keys(LIMIT_SECONDS)) expect(rules).toContain(`limitStamped(request.auth.uid, '${field}')`)
  })
  it('il documento dei limiti è del solo proprietario', () => {
    expect(rules).toContain('match /limiti/{uid}')
    expect(rules).toContain('allow read: if isOwner(uid);')
  })
})
