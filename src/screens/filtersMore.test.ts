import { describe, expect, it } from 'vitest'
import { NO_FILTERS } from '../filters/eventFilters'
import { countMoreFilters } from './FiltersMore'

describe('countMoreFilters', () => {
  it('senza filtri extra è zero', () => {
    expect(countMoreFilters(NO_FILTERS)).toBe(0)
  })
  it('conta date e distanza attive', () => {
    expect(countMoreFilters({ ...NO_FILTERS, da: new Date(), raggioKm: 10 })).toBe(2)
  })
})
