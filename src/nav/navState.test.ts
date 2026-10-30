import { canGoBack, goBack, openDebug, openEdit, openEvent, selectTab, showsAppHeader, START, titleOf } from './navState'

describe('navState', () => {
  it('parte dalla scheda Eventi, senza schermate aperte', () => {
    expect(START.tab).toBe('eventi')
    expect(canGoBack(START)).toBe(false)
  })
  it('aprire un evento permette di tornare indietro alla stessa scheda', () => {
    const nav = openEvent(selectTab('mappa'), 'e1')
    expect(canGoBack(nav)).toBe(true)
    expect(nav.overlay).toEqual({ kind: 'event', id: 'e1' })
    expect(goBack(nav)).toEqual(selectTab('mappa'))
  })
  it('cambiare scheda chiude la schermata aperta', () => {
    expect(selectTab('profilo').overlay.kind).toBe('none')
  })
  it('debug e modifica profilo sono schermate sopra il profilo', () => {
    const base = selectTab('profilo')
    expect(titleOf(openDebug(base))).toBe('Debug')
    expect(titleOf(openEdit(base))).toBe('Modifica profilo')
  })
  it('il titolo segue la scheda o la schermata aperta', () => {
    expect(titleOf(START)).toBe('Eventi in programma')
    expect(titleOf(selectTab('miei'))).toBe('I miei eventi')
    expect(titleOf(openEvent(START, 'x'))).toBe('Evento')
  })
})

describe('barra del titolo', () => {
  it('la schermata Eventi ha la sua testata, le altre usano la barra', () => {
    expect(showsAppHeader(START)).toBe(false)
    expect(showsAppHeader(openEvent(START, 'e1'))).toBe(true)
    expect(showsAppHeader(selectTab('mappa'))).toBe(true)
  })
})
