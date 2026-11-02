import { describe, expect, it } from 'vitest'
import { goBack, openEdit, openEvent, selectTab, START } from './navState'
import { screenKey, transitionKind } from './screenTransition'

describe('transizioni tra schermate', () => {
  it('la chiave cambia cambiando scheda o aprendo un evento', () => {
    const open = openEvent(START, 'e1')
    expect(new Set([screenKey(START), screenKey(selectTab('mappa')), screenKey(open), screenKey(openEvent(START, 'e2'))]).size).toBe(4)
  })

  it('tornando indietro si ritrova la chiave della scheda', () => {
    expect(screenKey(goBack(openEvent(START, 'e1')))).toBe(screenKey(START))
  })

  it('le schermate aperte sopra scorrono, le schede si dissolvono', () => {
    expect(transitionKind(START)).toBe('tab')
    expect(transitionKind(openEdit(START))).toBe('push')
    expect(transitionKind(openEvent(START, 'x'))).toBe('push')
  })
})
