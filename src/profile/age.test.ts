import { calculateAge, isAdult, parseBirthDate } from './age'

const d = (s: string) => new Date(`${s}T00:00:00Z`)

describe('età', () => {
  it('conta gli anni compiuti, non quelli in corso', () => {
    expect(calculateAge(d('2000-06-15'), d('2026-06-14'))).toBe(25)
    expect(calculateAge(d('2000-06-15'), d('2026-06-15'))).toBe(26)
  })
  it('gestisce il compleanno a fine anno', () => {
    expect(calculateAge(d('2000-12-31'), d('2026-01-01'))).toBe(25)
  })
  it('18 anni compiuti oggi: maggiorenne; domani compie 18: no', () => {
    expect(isAdult(d('2008-10-12'), d('2026-10-12'))).toBe(true)
    expect(isAdult(d('2008-10-13'), d('2026-10-12'))).toBe(false)
  })
  it('chi è nato il 29 febbraio compie gli anni dal 1 marzo (anno non bisestile)', () => {
    expect(calculateAge(d('2000-02-29'), d('2026-02-28'))).toBe(25)
    expect(calculateAge(d('2000-02-29'), d('2026-03-01'))).toBe(26)
  })
  it('parseBirthDate rifiuta formati e giorni inesistenti', () => {
    expect(parseBirthDate('2000-05-31')).toEqual(d('2000-05-31'))
    expect(parseBirthDate('2001-02-31')).toBeNull()
    expect(parseBirthDate('31/05/2000')).toBeNull()
    expect(parseBirthDate('')).toBeNull()
  })
})
