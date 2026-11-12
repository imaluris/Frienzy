import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { initTheme } from '../theme/store'
import { AppearanceSettings } from './AppearanceSettings'

describe('scheda Aspetto', () => {
  beforeEach(() => {
    localStorage.clear()
    initTheme()
  })

  it('parte su Automatico e passa a Scuro al tocco, salvando la scelta', () => {
    render(<AppearanceSettings />)
    expect(screen.getByRole('radio', { name: 'Automatico' })).toHaveAttribute('aria-checked', 'true')
    fireEvent.click(screen.getByRole('radio', { name: 'Scuro' }))
    expect(screen.getByRole('radio', { name: 'Scuro' })).toHaveAttribute('aria-checked', 'true')
    expect(document.documentElement.dataset.theme).toBe('scuro')
    expect(localStorage.getItem('frienzy.tema')).toBe('scuro')
  })

  it('torna al Chiaro', () => {
    render(<AppearanceSettings />)
    fireEvent.click(screen.getByRole('radio', { name: 'Scuro' }))
    fireEvent.click(screen.getByRole('radio', { name: 'Chiaro' }))
    expect(document.documentElement.dataset.theme).toBe('chiaro')
  })
})
