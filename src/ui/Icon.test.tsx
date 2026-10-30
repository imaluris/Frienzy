import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Icon, ICONS, type IconName } from './Icon'

describe('Icon', () => {
  it('disegna un SVG nascosto agli screen reader con la misura richiesta', () => {
    const { container } = render(<Icon name="calendar" size={20} />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('aria-hidden')).toBe('true')
    expect(svg.getAttribute('width')).toBe('20')
  })

  it('la versione piena riempie la forma, quella a contorno no', () => {
    const outline = render(<Icon name="heart" />).container.querySelector('svg')!
    const filled = render(<Icon name="heart" filled />).container.querySelector('svg')!
    expect(outline.getAttribute('fill')).toBe('none')
    expect(filled.getAttribute('fill')).toBe('currentColor')
  })

  it('ogni nome del set produce un SVG', () => {
    for (const name of Object.keys(ICONS) as IconName[]) {
      expect(render(<Icon name={name} />).container.querySelector('svg')).not.toBeNull()
    }
  })
})
