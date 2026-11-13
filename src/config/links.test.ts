import { eventLink, webBaseUrl } from './links'

describe('link agli eventi', () => {
  it('usa l\'indirizzo configurato senza barra finale', () => {
    expect(webBaseUrl('https://frienzy.app/')).toBe('https://frienzy.app')
    expect(eventLink('abc', 'https://frienzy.app')).toBe('https://frienzy.app/evento/abc')
  })
  it('indirizzi non validi o mancanti: valore di riserva', () => {
    expect(webBaseUrl(undefined)).toBe('https://frienzy.example')
    expect(webBaseUrl('http://non-sicuro')).toBe('https://frienzy.example')
  })
  it('l\'id viene codificato e il link non contiene nulla di più', () => {
    expect(eventLink('a b/c', 'https://x.it')).toBe('https://x.it/evento/a%20b%2Fc')
  })
})
