import { chromium } from 'playwright-core'
import { startDemoServer } from './server.ts'
import type { Page } from 'playwright-core'
import { STEPS } from './steps.ts'

// Per le schermate più alte del telefono: scorre in fondo e scatta una seconda immagine della viewport.
async function scrollShot(page: Page, path: string) {
  const scrolled = await page.evaluate(() => {
    const room = document.documentElement.scrollHeight - window.innerHeight
    if (room < 40) return false
    window.scrollTo(0, room)
    return true
  })
  if (!scrolled) return
  await page.waitForTimeout(200)
  await page.screenshot({ path })
}

// Salva screenshot 390x844 (viewport del telefono) di ogni schermata in docs/screenshots/.
const PORT = 5199
// SHOTS_THEME=scuro: il telefono simulato è in modalità scura (il tema Automatico lo segue) e le immagini vanno in docs/screenshots/scuro.
const DARK = process.env.SHOTS_THEME === 'scuro'
const OUT = DARK ? 'docs/screenshots/scuro' : 'docs/screenshots'

const server = await startDemoServer(PORT)
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium', args: ['--no-sandbox'] })
try {
  // Posizione finta a Milano con permesso già dato: serve alla fila "Vicino a te".
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: DARK ? 'dark' : 'light',
    permissions: ['geolocation'], geolocation: { latitude: 45.4642, longitude: 9.19 },
  })
  page.setDefaultTimeout(8000)
  await page.goto(`http://localhost:${PORT}/`)
  await page.getByRole('heading').first().waitFor()
  const only = process.env.SHOTS_ONLY ? new RegExp(process.env.SHOTS_ONLY) : null // es. SHOTS_ONLY='^5[7-9]' per rifare solo alcune schermate
  for (const step of STEPS.filter((x) => !only || only.test(x.name))) {
    try {
      await step.go(page)
      await page.waitForTimeout(400)
      await page.screenshot({ path: `${OUT}/${step.name}.png` }) // solo la viewport, come la vedrebbe l'utente
      await scrollShot(page, `${OUT}/${step.name}-scroll.png`)
      console.log('OK     ', step.name)
    } catch (e) {
      console.log('FALLITO', step.name, e instanceof Error ? e.message.split('\n')[0] : e)
    }
  }
} finally {
  await browser.close()
  server.kill()
  process.exit(0)
}
