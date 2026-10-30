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
const OUT = 'docs/screenshots'

const server = await startDemoServer(PORT)
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium', args: ['--no-sandbox'] })
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
  page.setDefaultTimeout(8000)
  await page.goto(`http://localhost:${PORT}/`)
  await page.getByRole('heading').first().waitFor()
  for (const step of STEPS) {
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
