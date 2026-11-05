import { chromium } from 'playwright-core'
import { startDemoServer } from './server.ts'
import type { Page } from 'playwright-core'

// Screenshot con dati al limite (titolo di 60+ caratteri, zona lunghissima, 30 posti): docs/screenshots/extreme-*.png.
const PORT = 5197
const OUT = 'docs/screenshots'
const server = await startDemoServer(PORT, { VITE_DEMO_EXTREME: '1' })
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium', args: ['--no-sandbox'] })
const click = (p: Page, name: string | RegExp) => p.getByRole('button', { name }).first().click()

async function home(p: Page) {
  await p.reload()
  await p.getByRole('heading').first().waitFor()
}
const shot = async (p: Page, name: string, scrolled = false) => {
  if (scrolled) await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await p.waitForTimeout(400)
  await p.screenshot({ path: `${OUT}/extreme-${name}.png` })
}

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
  page.setDefaultTimeout(8000)
  await page.goto(`http://localhost:${PORT}/`)
  await page.getByRole('heading').first().waitFor()
  await shot(page, 'eventi')
  await page.getByRole('searchbox').fill('Grande aperitivo')
  await shot(page, 'eventi-ricerca')
  await home(page)
  await click(page, /Grande aperitivo/)
  await page.getByRole('button', { name: 'Partecipa' }).waitFor()
  await shot(page, 'dettaglio')
  await shot(page, 'dettaglio-fondo', true)
  await home(page)
  await click(page, 'Mappa')
  await page.getByRole('button', { name: /Apri o chiudi/ }).click()
  await page.getByRole('button', { name: /Apri o chiudi/ }).click()
  await shot(page, 'mappa-lista')
  await home(page)
  await click(page, 'Crea')
  await click(page, 'Continua')
  await page.getByLabel(/^Titolo/).fill('Grande aperitivo di benvenuto per tutti i nuovi amici del quartiere')
  await click(page, 'Continua')
  await shot(page, 'crea-titolo')
  console.log('OK extreme')
} finally {
  await browser.close()
  server.kill()
  process.exit(0)
}
