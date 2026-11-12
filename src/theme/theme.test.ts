import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { applyMode } from './apply'
import { paletteVariables } from './cssVars'
import { DARK, LIGHT } from './palettes'
import { isChoice, readChoice, resolveMode, STORAGE_KEY, writeChoice } from './preference'

describe('scelta del tema', () => {
  it('Automatico segue il telefono, le altre scelte no', () => {
    expect(resolveMode('auto', true)).toBe('scuro')
    expect(resolveMode('auto', false)).toBe('chiaro')
    expect(resolveMode('chiaro', true)).toBe('chiaro')
    expect(resolveMode('scuro', false)).toBe('scuro')
  })
  it('riconosce solo valori validi e ricade su Automatico', () => {
    expect(isChoice('scuro')).toBe(true)
    expect(isChoice('blu')).toBe(false)
    expect(readChoice({ getItem: () => 'blu' })).toBe('auto')
    expect(readChoice({ getItem: () => 'scuro' })).toBe('scuro')
    expect(readChoice(null)).toBe('auto')
    expect(readChoice({ getItem: () => { throw new Error('bloccato') } })).toBe('auto')
  })
  it('salva con la chiave giusta e non si rompe se l\'archivio è bloccato', () => {
    const saved: Record<string, string> = {}
    writeChoice({ setItem: (k, v) => { saved[k] = v } }, 'scuro')
    expect(saved[STORAGE_KEY]).toBe('scuro')
    expect(() => writeChoice({ setItem: () => { throw new Error('pieno') } }, 'chiaro')).not.toThrow()
  })
})

describe('palette', () => {
  it('chiaro e scuro definiscono le stesse voci', () => {
    expect(Object.keys(DARK).sort()).toEqual(Object.keys(LIGHT).sort())
  })
  it('il tema scuro ha quattro livelli di superficie tutti diversi', () => {
    const levels = new Set([DARK.background, DARK.surface, DARK.surface2, DARK.surface3])
    expect(levels.size).toBe(4)
  })
  it('traduce le voci in variabili CSS con nomi leggibili', () => {
    const v = paletteVariables(LIGHT)
    expect(v['--color-surface-2']).toBe('#ffffff')
    expect(v['--color-on-primary']).toBe(LIGHT.onPrimary)
    expect(v['--shadow-rgb']).toBe(LIGHT.shadowRgb)
    expect(v['--color-theme-bar']).toBeUndefined()
  })
  it('ogni variabile --color-* usata nei CSS esiste nella palette', () => {
    const defined = new Set(Object.keys(paletteVariables(LIGHT)))
    const dir = 'src/styles'
    const used = new Set<string>()
    for (const f of readdirSync(dir)) {
      for (const m of readFileSync(`${dir}/${f}`, 'utf8').matchAll(/var\((--color-[a-z0-9-]+)\)/g)) used.add(m[1]!)
    }
    expect([...used].filter((n) => !defined.has(n))).toEqual([])
  })
})

describe('applicazione alla pagina', () => {
  it('imposta data-theme, variabili e colore della barra del browser', () => {
    document.head.innerHTML = '<meta name="theme-color" content="#000000">'
    applyMode(document.documentElement, 'scuro')
    expect(document.documentElement.dataset.theme).toBe('scuro')
    expect(document.documentElement.style.getPropertyValue('--color-background')).toBe(DARK.background)
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe(DARK.themeBar)
    applyMode(document.documentElement, 'chiaro')
    expect(document.documentElement.dataset.theme).toBe('chiaro')
    expect(document.documentElement.style.getPropertyValue('--color-background')).toBe(LIGHT.background)
  })
})
