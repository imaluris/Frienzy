import { placeFromNominatim } from './place'

describe('indirizzo da Nominatim', () => {
  it('via + numero + città, zona = quartiere', () => {
    const p = placeFromNominatim({ lat: '42.56', lon: '12.64', address: { road: 'Via Mentana', house_number: '31A', suburb: 'Centro', city: 'Terni' } })
    expect(p).toEqual({ lat: 42.56, lng: 12.64, address: 'Via Mentana 31A, Terni', zone: 'Centro' })
  })
  it('senza quartiere la zona è la città', () => {
    expect(placeFromNominatim({ lat: '1', lon: '2', address: { road: 'Via Roma', town: 'Narni' } })?.zone).toBe('Narni')
  })
  it('il punto toccato sulla mappa vince su quello della risposta', () => {
    const p = placeFromNominatim({ lat: '1', lon: '2', address: { road: 'Via Roma', city: 'Milano' } }, { lat: 45.1, lng: 9.2 })
    expect(p).toMatchObject({ lat: 45.1, lng: 9.2 })
  })
  it('senza coordinate o senza indirizzo utile: null', () => {
    expect(placeFromNominatim({ address: { road: 'Via Roma' } })).toBeNull()
    expect(placeFromNominatim({ lat: '1', lon: '2' })).toBeNull()
  })
  it('usa il nome completo se mancano via e città', () => {
    expect(placeFromNominatim({ lat: '1', lon: '2', display_name: 'Parco Nord, Milano, Lombardia', address: {} })?.address).toBe('Parco Nord, Milano')
  })
})
