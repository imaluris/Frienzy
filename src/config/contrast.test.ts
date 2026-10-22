import { describe, expect, it } from 'vitest'
import { contrastRatio } from './contrast'
import { checkContrast } from './contrastPairs'

describe('contrasto', () => {
  it('nero su bianco fa 21, uguali fa 1', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5)
    expect(contrastRatio('#E2725B', '#E2725B')).toBeCloseTo(1, 5)
  })
  it('è simmetrico', () => {
    expect(contrastRatio('#2B2118', '#FFF8F0')).toBeCloseTo(contrastRatio('#FFF8F0', '#2B2118'), 10)
  })
  it('tutte le coppie della palette raggiungono il minimo', () => {
    const failing = checkContrast().filter((r) => !r.ok).map((r) => r.name)
    expect(failing).toEqual([])
  })
})
