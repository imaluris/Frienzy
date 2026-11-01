import { describe, expect, it } from 'vitest'
import { dragSnap, stepSnap, tapSnap } from './sheetSnap'

describe('altezze della scheda', () => {
  it('sale e scende di un gradino e si ferma ai bordi', () => {
    expect(stepSnap('closed', 1)).toBe('half')
    expect(stepSnap('half', 1)).toBe('full')
    expect(stepSnap('full', 1)).toBe('full')
    expect(stepSnap('closed', -1)).toBe('closed')
  })

  it('il tocco sulla maniglia sale, e dall\'alto torna a metà', () => {
    expect(tapSnap('closed')).toBe('half')
    expect(tapSnap('half')).toBe('full')
    expect(tapSnap('full')).toBe('half')
  })

  it('il trascinamento verso l\'alto sale, verso il basso scende, se è abbastanza lungo', () => {
    expect(dragSnap('half', -60)).toBe('full')
    expect(dragSnap('half', 60)).toBe('closed')
    expect(dragSnap('half', -10)).toBe('half')
  })
})
