import { describe, expect, it } from 'vitest'
import { PEOPLE_PREVIEW, visiblePeople } from './visiblePeople'

const make = (n: number) => Array.from({ length: n }, (_, i) => i)

describe('visiblePeople', () => {
  it('con poche persone le mostra tutte', () => {
    expect(visiblePeople(make(PEOPLE_PREVIEW), false)).toEqual({ shown: make(PEOPLE_PREVIEW), hidden: 0 })
  })
  it('con 30 persone ne mostra le prime e conta le altre', () => {
    const r = visiblePeople(make(30), false)
    expect(r.shown).toEqual(make(PEOPLE_PREVIEW))
    expect(r.hidden).toBe(30 - PEOPLE_PREVIEW)
  })
  it('espanso mostra tutti, senza nascosti', () => {
    expect(visiblePeople(make(30), true)).toEqual({ shown: make(30), hidden: 0 })
  })
})
