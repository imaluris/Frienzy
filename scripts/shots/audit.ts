import { chromium } from 'playwright-core'
import { startDemoServer } from './server.ts'
import { STEPS } from './steps.ts'

// Controllo a tappeto del contrasto REALE a schermo: per ogni testo visibile confronta il colore calcolato
// con lo sfondo effettivo (risalendo gli antenati). Salta i testi su immagini/gradienti. Uso: SHOTS_THEME=scuro npm run audit
const PORT = 5198
const DARK = process.env.SHOTS_THEME === 'scuro'
const server = await startDemoServer(PORT)
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium', args: ['--no-sandbox'] })

const AUDIT = (MIN: number) => {
  const parse = (c: string) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1]!.split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0]!, g: p[1]!, b: p[2]!, a: p[3] ?? 1 } }
  const lum = (c: { r: number; g: number; b: number }) => { const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b) }
  const bgOf = (el: Element) => {
    let base = { r: 0, g: 0, b: 0 }, found = false; const layers: { r: number; g: number; b: number; a: number }[] = []
    for (let e: Element | null = el; e; e = e.parentElement) {
      const cs = getComputedStyle(e)
      if (cs.backgroundImage !== 'none') return null
      const c = parse(cs.backgroundColor)
      if (c && c.a > 0) { layers.push(c); if (c.a >= 1) { base = c; found = true; break } }
    }
    if (!found) base = parse(getComputedStyle(document.body).backgroundColor) ?? base
    for (const l of layers.reverse()) if (l.a < 1) base = { r: l.r * l.a + base.r * (1 - l.a), g: l.g * l.a + base.g * (1 - l.a), b: l.b * l.a + base.b * (1 - l.a) }
    return base
  }
  const out: string[] = []
  for (const el of document.querySelectorAll('body *')) {
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim())) continue
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0 || r.bottom < 0 || r.top > innerHeight) continue
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.opacity === '0') continue
    const fg = parse(cs.color), bg = bgOf(el)
    if (!fg || !bg) continue
    const hi = Math.max(lum(fg), lum(bg)), lo = Math.min(lum(fg), lum(bg))
    const ratio = (hi + 0.05) / (lo + 0.05)
    if (ratio < MIN && !el.closest('.detail-hero, .pin-drop, .leaflet-container')) out.push(`${ratio.toFixed(2)} ${el.tagName.toLowerCase()}.${(el as HTMLElement).className} "${el.textContent!.trim().slice(0, 30)}"`)
  }
  return out
}

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, colorScheme: DARK ? 'dark' : 'light', permissions: ['geolocation'], geolocation: { latitude: 45.4642, longitude: 9.19 } })
  page.setDefaultTimeout(8000)
  await page.goto(`http://localhost:${PORT}/`)
  await page.getByRole('heading').first().waitFor()
  let bad = 0
  for (const step of STEPS) {
    try {
      await step.go(page)
      await page.waitForTimeout(250)
      const issues = await page.evaluate(AUDIT, Number(process.env.MIN ?? 4.5))
      for (const i of issues) { console.log(`[${step.name}] ${i}`); bad++ }
    } catch (e) { console.log('SALTATO', step.name, e instanceof Error ? e.message.split('\n')[0] : e) }
  }
  console.log(bad === 0 ? 'Nessun testo sotto il minimo' : `${bad} testi sotto il minimo`)
} finally {
  await browser.close()
  server.kill()
  process.exit(0)
}
