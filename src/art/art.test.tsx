import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EVENT_TYPE_IDS } from '../domain/eventTypes'
import { CoverArt } from './CoverArt'
import { Confetti, makePieces } from './Confetti'
import { EMPTY_ART, EmptyArt, type EmptyArtKind } from './EmptyArt'
import { hashString, makeRng } from './seed'
import { WelcomeArt } from '../screens/WelcomeArt'

const markup = (tipo: (typeof EVENT_TYPE_IDS)[number], id: string) => {
  const { container, unmount } = render(<CoverArt tipo={tipo} seedId={id} />)
  // gli id interni dipendono da useId (diversi a ogni rendering): si tolgono per confrontare solo il disegno
  const html = container.innerHTML.replace(/cv[A-Za-z0-9]+/g, 'cv')
  unmount()
  return html
}

describe('numeri ripetibili', () => {
  it('lo stesso testo dà lo stesso numero, testi diversi numeri diversi', () => {
    expect(hashString('evento-1')).toBe(hashString('evento-1'))
    expect(hashString('evento-1')).not.toBe(hashString('evento-2'))
  })
  it('lo stesso seme dà la stessa sequenza, sempre tra 0 e 1', () => {
    const a = makeRng(42)
    const b = makeRng(42)
    const seq = Array.from({ length: 20 }, () => a.next())
    expect(seq).toEqual(Array.from({ length: 20 }, () => b.next()))
    expect(seq.every((n) => n >= 0 && n < 1)).toBe(true)
  })
  it('between e int restano nei limiti', () => {
    const r = makeRng(1)
    for (let i = 0; i < 100; i++) {
      const v = r.between(5, 9)
      expect(v).toBeGreaterThanOrEqual(5)
      expect(v).toBeLessThan(9)
      expect(r.int(3)).toBeLessThan(3)
    }
  })
})

describe('copertine', () => {
  it.each(EVENT_TYPE_IDS)('%s: stesso id = stessa copertina', (tipo) => {
    expect(markup(tipo, 'abc')).toBe(markup(tipo, 'abc'))
  })
  it.each(EVENT_TYPE_IDS)('%s: ha un disegno vero (molte forme) e nessun testo', (tipo) => {
    const { container } = render(<CoverArt tipo={tipo} seedId="x" />)
    expect(container.querySelectorAll('path, rect, circle, ellipse').length).toBeGreaterThan(12)
    expect(container.textContent).toBe('')
  })
  it.each(EVENT_TYPE_IDS)('%s: id diversi danno almeno due varianti', (tipo) => {
    const variants = new Set(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((id) => markup(tipo, id)))
    expect(variants.size).toBeGreaterThan(1)
  })
  it('tipi diversi hanno disegni diversi', () => {
    expect(new Set(EVENT_TYPE_IDS.map((t) => markup(t, 'stesso'))).size).toBe(EVENT_TYPE_IDS.length)
  })
})

describe('stati vuoti e benvenuto', () => {
  it('ci sono otto illustrazioni, tutte disegnate', () => {
    const kinds = Object.keys(EMPTY_ART) as EmptyArtKind[]
    expect(kinds).toHaveLength(9)
    for (const kind of kinds) {
      const { container, unmount } = render(<EmptyArt kind={kind} label="" />)
      expect(container.querySelectorAll('path, circle, rect').length).toBeGreaterThan(6)
      unmount()
    }
  })
  it('il benvenuto ha il testo alternativo', () => {
    const { getByRole } = render(<WelcomeArt />)
    expect(getByRole('img').getAttribute('aria-label')).toMatch(/amici/)
  })
})

describe('coriandoli', () => {
  it('i pezzi sono sempre gli stessi con lo stesso seme', () => {
    expect(makePieces(10)).toEqual(makePieces(10))
    expect(makePieces(10)).toHaveLength(10)
  })
  it('i pezzi restano dentro lo schermo', () => {
    for (const p of makePieces(50)) {
      expect(p.left).toBeGreaterThan(0)
      expect(p.left).toBeLessThan(100)
      expect(p.duration).toBeGreaterThan(1)
    }
  })
  it('mostra i pezzi e non intercetta i tocchi', () => {
    const { container } = render(<Confetti count={12} onDone={() => {}} />)
    expect(container.querySelectorAll('.confetti-piece').length).toBeGreaterThan(0)
    expect(container.querySelector('.confetti')?.getAttribute('aria-hidden')).toBe('true')
  })
})
