import { checkContrast } from '../src/config/contrastPairs.ts'

// Stampa ogni coppia di colori e esce con errore se una non raggiunge il contrasto minimo.
const results = checkContrast()
for (const r of results) {
  console.log(`${r.ok ? 'OK    ' : 'FALLITO'} ${r.ratio.toFixed(2)} (min ${r.min})  ${r.name}`)
}
process.exit(results.every((r) => r.ok) ? 0 : 1)
