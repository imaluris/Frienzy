import { describe, expect, it } from 'vitest'
import type { ProfileInput } from '../profile/validation'
import { interestsActionLabel, nextStep, previousStep, stepLabel, stepNumber, validateProfileStep } from './steps'

const today = new Date('2026-06-01T12:00:00Z')
const ok: ProfileInput = { nome: 'Ada', dataNascita: '1990-05-05', bio: '', interessi: [], fotoUrl: '' }

describe('passi della registrazione', () => {
  it('numera i passi da 1 a 4', () => {
    expect(stepNumber('account')).toBe(1)
    expect(stepNumber('posizione')).toBe(4)
    expect(stepLabel('profilo')).toBe('Passo 2 di 4')
  })

  it('passa avanti e indietro e si ferma ai bordi', () => {
    expect(nextStep('account')).toBe('profilo')
    expect(nextStep('posizione')).toBeNull()
    expect(previousStep('interessi')).toBe('profilo')
    expect(previousStep('account')).toBeNull()
  })

  it('il passo profilo accetta dati giusti', () => {
    expect(validateProfileStep(ok, today)).toBeNull()
  })

  it('il passo profilo rifiuta nome corto, minorenni e bio troppo lunga', () => {
    expect(validateProfileStep({ ...ok, nome: 'A' }, today)).toMatch(/almeno 2/)
    expect(validateProfileStep({ ...ok, dataNascita: '2015-01-01' }, today)).toMatch(/almeno 18/)
    expect(validateProfileStep({ ...ok, bio: 'x'.repeat(301) }, today)).toMatch(/300/)
  })

  it('il pulsante degli interessi cambia se non ne scegli nessuno', () => {
    expect(interestsActionLabel(0)).toBe('Salta per ora')
    expect(interestsActionLabel(2)).toBe('Continua')
  })
})
