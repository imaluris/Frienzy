import { existsSync, readFileSync } from 'node:fs'

const read = (f: string) => readFileSync(`docs/store/${f}`, 'utf8')
const block = (text: string, name: string) => new RegExp('```' + name + '\\n([\\s\\S]*?)\\n```').exec(text)?.[1] ?? ''

describe('materiale per Google Play', () => {
  const scheda = read('scheda.md')
  it('titolo, descrizione breve e lunga rispettano i limiti di Google Play', () => {
    expect(block(scheda, 'titolo').length).toBeGreaterThan(0)
    expect(block(scheda, 'titolo').length).toBeLessThanOrEqual(30)
    expect(block(scheda, 'breve').length).toBeGreaterThan(0)
    expect(block(scheda, 'breve').length).toBeLessThanOrEqual(80)
    expect(block(scheda, 'lunga').length).toBeGreaterThan(500)
    expect(block(scheda, 'lunga').length).toBeLessThanOrEqual(4000)
  })
  it('la descrizione non promette cose che non ci sono (niente incontri romantici, niente prezzi)', () => {
    expect(block(scheda, 'lunga')).not.toMatch(/dating|flirt|partner|premium|a pagamento/i)
  })
  it('i file previsti ci sono, con la misura giusta per l\'immagine in primo piano', () => {
    for (const f of ['README.md', 'scheda.md', 'sicurezza-dati.md', 'classificazione-contenuti.md', 'screenshot.md', 'feature-graphic.svg', 'feature-graphic.png']) expect(existsSync(`docs/store/${f}`)).toBe(true)
    const png = readFileSync('docs/store/feature-graphic.png')
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1024, 500])
  })
  it('gli screenshot elencati esistono', () => {
    const files = [...read('screenshot.md').matchAll(/`(docs\/screenshots\/[^`]+\.png)`/g)].map((m) => m[1])
    expect(files.length).toBeGreaterThanOrEqual(2)
    for (const f of files) expect(existsSync(f), f).toBe(true)
  })
})
