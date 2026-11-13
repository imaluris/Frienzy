import { mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { featureGraphicSvg } from './featureGraphic.ts'

// Genera docs/store/feature-graphic.svg e .png (1024x500). Uso: npm run store:graphic
// Il PNG si fa con Chromium/Playwright (nel cloud); se non c'è, si crea solo l'SVG.
const svg = featureGraphicSvg()
mkdirSync('docs/store', { recursive: true })
writeFileSync('docs/store/feature-graphic.svg', svg)

try {
  const { chromium } = createRequire(import.meta.url)('playwright')
  const font = new URL('../../node_modules/@fontsource-variable/nunito/files/nunito-latin-wght-normal.woff2', import.meta.url).pathname
  const html = `<style>@font-face{font-family:'Nunito Variable';src:url('file://${font}');font-weight:200 1000}body{margin:0}</style>${svg}`
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium' })
  const page = await browser.newPage({ viewport: { width: 1024, height: 500 } })
  await page.setContent(html)
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: 'docs/store/feature-graphic.png' })
  await browser.close()
  console.log('Creati feature-graphic.svg e feature-graphic.png')
} catch (e) {
  console.log('Creato solo feature-graphic.svg (PNG non generato):', e instanceof Error ? e.message : e)
}
