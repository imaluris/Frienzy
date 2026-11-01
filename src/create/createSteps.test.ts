import { describe, expect, it } from 'vitest'
import type { EventInput } from '../events/validation'
import { bumpSeats, CREATE_STEPS, firstInvalidStep, nextCreateStep, previousCreateStep, stepErrors } from './createSteps'

const now = new Date('2026-06-01T10:00:00')
const good: EventInput = {
  tipo: 'cena', titolo: 'Cena in terrazza', descrizione: '', dataOra: '2026-06-10T20:00', zonaNome: 'Navigli',
  indirizzo: 'Via Roma 1', lat: '45.46', lng: '9.19', maxPartecipanti: '8', richiedeApprovazione: false,
}
const empty: EventInput = { ...good, titolo: '', dataOra: '', zonaNome: '', indirizzo: '', lat: '', lng: '', maxPartecipanti: '0' }

describe('passi di Crea evento', () => {
  it('ci sono sei passi e si naviga avanti e indietro', () => {
    expect(CREATE_STEPS).toHaveLength(6)
    expect(nextCreateStep('tipo')).toBe('testo')
    expect(nextCreateStep('riepilogo')).toBeNull()
    expect(previousCreateStep('testo')).toBe('tipo')
    expect(previousCreateStep('tipo')).toBeNull()
  })

  it('ogni passo mostra solo gli errori dei propri campi', () => {
    expect(Object.keys(stepErrors('testo', empty, now))).toEqual(['titolo'])
    expect(Object.keys(stepErrors('quando', empty, now))).toEqual(['dataOra'])
    expect(Object.keys(stepErrors('dove', empty, now)).sort()).toEqual(['indirizzo', 'punto', 'zonaNome'])
    expect(Object.keys(stepErrors('posti', empty, now))).toEqual(['maxPartecipanti'])
    expect(stepErrors('tipo', empty, now)).toEqual({})
  })

  it('con dati giusti nessun passo ha errori', () => {
    for (const step of CREATE_STEPS) expect(stepErrors(step, good, now)).toEqual({})
    expect(firstInvalidStep(good, now)).toBeNull()
  })

  it('trova il primo passo da correggere', () => {
    expect(firstInvalidStep({ ...good, dataOra: '2020-01-01T10:00' }, now)).toBe('quando')
    expect(firstInvalidStep(empty, now)).toBe('testo')
  })

  it('i posti salgono e scendono restando tra 1 e il massimo', () => {
    expect(bumpSeats('8', 1, 200)).toBe('9')
    expect(bumpSeats('1', -1, 200)).toBe('1')
    expect(bumpSeats('200', 1, 200)).toBe('200')
    expect(bumpSeats('abc', 1, 200)).toBe('11')
  })
})
