import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TabBar } from './TabBar'

describe('TabBar', () => {
  it('ogni scheda ha un SVG come icona e un testo sempre visibile', () => {
    const { container } = render(<TabBar active="eventi" onSelect={() => {}} />)
    expect(container.querySelectorAll('.tab svg')).toHaveLength(5)
    expect(screen.getByText('Mappa')).toBeTruthy()
  })

  it("segna come corrente solo la scheda attiva e riempie la sua icona", () => {
    const { container } = render(<TabBar active="mappa" onSelect={() => {}} />)
    const current = container.querySelectorAll('[aria-current="page"]')
    expect(current).toHaveLength(1)
    expect(current[0].querySelector('svg')!.getAttribute('fill')).toBe('currentColor')
  })

  it('chiama onSelect con la scheda toccata', () => {
    const onSelect = vi.fn()
    render(<TabBar active="eventi" onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button', { name: /Profilo/ }))
    expect(onSelect).toHaveBeenCalledWith('profilo')
  })
})
