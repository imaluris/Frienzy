import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const dir = 'src/styles'

describe('stili', () => {
  it('styles.css importa tutti i file della cartella styles', () => {
    const entry = readFileSync('src/styles.css', 'utf8')
    const files = readdirSync(dir).filter((f) => f.endsWith('.css'))
    for (const f of files) expect(entry).toContain(`./styles/${f}`)
  })

  it('ogni file di stile resta corto', () => {
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.css'))) {
      expect(readFileSync(`${dir}/${f}`, 'utf8').split('\n').length).toBeLessThanOrEqual(60)
    }
  })

  it('il font Nunito è usato dalle variabili', () => {
    expect(readFileSync(`${dir}/tokens.css`, 'utf8')).toContain('Nunito')
  })
})
