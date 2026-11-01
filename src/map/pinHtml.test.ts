import { describe, expect, it } from 'vitest'
import { EVENT_TYPE_IDS } from '../domain/eventTypes'
import { pinHtml } from './pinHtml'
import { TYPE_COLOR } from './typeColors'

describe('pinHtml', () => {
  it('mette emoji e colore del tipo', () => {
    const html = pinHtml({ emoji: '🥾', color: TYPE_COLOR.trekking }, false)
    expect(html).toContain('🥾')
    expect(html).toContain(TYPE_COLOR.trekking)
    expect(html).not.toContain('is-selected')
  })

  it('il segnaposto selezionato ha la classe per ingrandirsi', () => {
    expect(pinHtml({ emoji: '🍹', color: '#E2725B' }, true)).toContain('is-selected')
  })

  it('ogni tipo ha un colore esadecimale diverso', () => {
    const colors = EVENT_TYPE_IDS.map((id) => TYPE_COLOR[id])
    expect(new Set(colors).size).toBe(colors.length)
    for (const c of colors) expect(c).toMatch(/^#[0-9A-F]{6}$/)
  })
})
