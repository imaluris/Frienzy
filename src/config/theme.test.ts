import { describe, expect, it } from 'vitest'
import { appConfig } from './app'
import { themeVariables } from './theme'

describe('tema', () => {
  it('espone i colori della palette come variabili CSS', () => {
    const vars = themeVariables()
    expect(vars['--color-primary']).toBe('#E2725B')
    expect(vars['--color-background']).toBe(appConfig.colors.background)
    expect(vars['--radius']).toBe('16px')
  })
})
