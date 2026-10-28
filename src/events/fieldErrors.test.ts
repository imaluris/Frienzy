import { describe, expect, it } from 'vitest'
import { POINT_MISSING, validateEventFields } from './fieldErrors'
import type { EventInput } from './validation'

const NOW = new Date('2026-10-28T10:00:00')
const GOOD: EventInput = {
  tipo: 'cena', titolo: 'Cena in terrazza', descrizione: '', dataOra: '2026-11-02T20:00',
  zonaNome: 'Navigli', indirizzo: 'Via Roma 1', lat: '45.45', lng: '9.18',
  maxPartecipanti: '8', richiedeApprovazione: false,
}

describe('validateEventFields', () => {
  it('non segnala errori se il form è giusto', () => {
    expect(validateEventFields(GOOD, NOW)).toEqual({})
  })

  it('segnala tutti i campi sbagliati insieme, ognuno col suo messaggio', () => {
    const errors = validateEventFields({ ...GOOD, titolo: 'ab', zonaNome: '', maxPartecipanti: 'x' }, NOW)
    expect(Object.keys(errors).sort()).toEqual(['maxPartecipanti', 'titolo', 'zonaNome'])
  })

  it('chiede di toccare la mappa se il punto manca', () => {
    expect(validateEventFields({ ...GOOD, lat: '', lng: '' }, NOW).punto).toBe(POINT_MISSING)
  })

  it('rifiuta un punto fuori dal mondo', () => {
    expect(validateEventFields({ ...GOOD, lat: '120', lng: '9' }, NOW).punto).toContain('latitudine')
  })

  it('rifiuta una data nel passato', () => {
    expect(validateEventFields({ ...GOOD, dataOra: '2026-10-01T20:00' }, NOW).dataOra).toContain('futuro')
  })
})
