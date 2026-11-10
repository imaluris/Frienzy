import { buildDevice } from './device'

describe('buildDevice', () => {
  const milano = { lat: 45.4642, lng: 9.19 }
  it('senza token non salva nulla', () => expect(buildDevice('', milano, true)).toBeNull())
  it('con inviti accesi salva una zona di 5 caratteri, non la posizione', () => {
    const d = buildDevice('tok', milano, true)
    expect(d?.zona).toHaveLength(5)
    expect(d?.zona.startsWith('u0nd')).toBe(true)
  })
  it('con inviti spenti la zona resta vuota', () => expect(buildDevice('tok', milano, false)).toEqual({ token: 'tok', zona: '' }))
  it('senza posizione la zona resta vuota', () => expect(buildDevice('tok', null, true)).toEqual({ token: 'tok', zona: '' }))
})
