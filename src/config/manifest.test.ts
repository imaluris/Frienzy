import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { appConfig } from './app'

// Il manifest PWA è un file statico: controlliamo che resti allineato alla config unica.
describe('manifest PWA', () => {
  const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'))
  it('usa nome, sfondo e colore della config', () => {
    expect(manifest.name).toBe(appConfig.name)
    expect(manifest.background_color).toBe(appConfig.colors.background)
    expect(manifest.theme_color).toBe(appConfig.colors.primary)
  })
  it('punta all\'icona della config, che esiste', () => {
    expect(manifest.icons[0].src).toBe(appConfig.icon)
    expect(readFileSync('public' + appConfig.icon, 'utf8')).toContain('<svg')
  })
})
