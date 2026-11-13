import { readFileSync } from 'node:fs'
import { TERMS_VERSION } from './consent'

const page = (name: string) => readFileSync(`public/${name}.html`, 'utf8')

describe('pagine legali statiche', () => {
  for (const name of ['privacy', 'termini'] as const) {
    it(`${name}: italiano, versione allineata al codice e niente testo da sviluppatore`, () => {
      const html = page(name)
      expect(html).toContain('<html lang="it">')
      expect(html).toContain(`Versione ${TERMS_VERSION}`)
      expect(html).toContain('18 anni')
      expect(html).not.toMatch(/lorem|TODO/i)
    })
  }
  it('la privacy elenca dati, diritti, conservazione e minori', () => {
    const html = page('privacy')
    for (const word of ['Quali dati raccogliamo', 'I tuoi diritti', 'Per quanto tempo', 'Minori', 'Garante', 'Firebase']) expect(html).toContain(word)
  })
  it('le pagine si rimandano a vicenda e alla pagina di eliminazione account', () => {
    expect(page('privacy')).toContain('href="termini.html"')
    expect(page('termini')).toContain('href="privacy.html"')
    expect(page('privacy')).toContain('href="eliminazione-account.html"')
  })
  it('i campi da completare sono ben visibili (parentesi quadre) e la bozza è dichiarata', () => {
    for (const name of ['privacy', 'termini']) {
      expect(page(name)).toContain('[indirizzo email di assistenza]')
      expect(page(name)).toContain('Bozza.')
    }
  })
})
