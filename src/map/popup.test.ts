import { describe, expect, it, vi } from 'vitest'
import { buildPopup } from './popup'
import { positionMessage } from './positionMessage'

const marker = { eventId: 'e1', lat: 1, lng: 2, emoji: '🍹', title: '<img src=x onerror=alert(1)>', when: 'sab 31 ott · 19:30', zone: 'Navigli' }

describe('buildPopup', () => {
  it('mostra titolo, data e zona come testo e non come HTML', () => {
    const box = buildPopup(marker, () => {})
    expect(box.querySelector('img')).toBeNull()
    expect(box.textContent).toContain('<img src=x onerror=alert(1)>')
    expect(box.textContent).toContain('sab 31 ott · 19:30 · Navigli')
  })

  it('il pulsante apre l\'evento giusto', () => {
    const open = vi.fn()
    buildPopup(marker, open).querySelector('button')!.click()
    expect(open).toHaveBeenCalledWith('e1')
  })
})

describe('positionMessage', () => {
  it('spiega i casi in cui la posizione non c\'è', () => {
    expect(positionMessage({ status: 'denied' })).toContain('permessi')
    expect(positionMessage({ status: 'unsupported' })).toContain('dispositivo')
    expect(positionMessage({ status: 'asking' })).toContain('Cerco')
  })

  it('non dice nulla se va tutto bene o non è stata chiesta', () => {
    expect(positionMessage({ status: 'idle' })).toBeNull()
    expect(positionMessage({ status: 'ok', point: { lat: 1, lng: 2 } })).toBeNull()
  })
})
