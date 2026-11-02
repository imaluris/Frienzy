import { chromium } from 'playwright-core'
import { mkdirSync, rmSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { readFileSync } from 'node:fs'
import { appConfig } from '../../src/config/app.ts'
import { foregroundSvg, iconSvg, monochromeSvg, splashLogoSvg } from './svg.ts'

// Genera icona web, icone Android (adattiva, a tema, classiche) e logo della schermata di avvio dal marchio in src/brand.
// Uso: npm run brand
const RES = 'android/app/src/main/res'
const DENSITIES = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 } as const
// Il font va incorporato come data URI: la pagina vuota usata per disegnare non può leggere file locali.
const FONT = `data:font/woff2;base64,${readFileSync('node_modules/@fontsource-variable/nunito/files/nunito-latin-wght-normal.woff2').toString('base64')}`

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium', args: ['--no-sandbox'] })
const page = await browser.newPage()

// Disegna lo svg alla dimensione voluta (px) e restituisce il PNG con sfondo trasparente.
async function png(svg: string, px: number): Promise<Buffer> {
  await page.setViewportSize({ width: px, height: px })
  const html = `<style>html,body{margin:0;background:transparent}svg{display:block;width:${px}px;height:${px}px}</style>${svg}`
  await page.setContent(html)
  await page.evaluate(() => document.fonts.ready)
  return page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: px, height: px } })
}

const write = (path: string, data: Buffer | string) => {
  mkdirSync(path.slice(0, path.lastIndexOf('/')), { recursive: true })
  writeFileSync(path, data)
}

try {
  write('public/icon.svg', iconSvg())
  write('public/icon-192.png', await png(iconSvg(), 192))
  write('public/icon-512.png', await png(iconSvg(), 512))
  for (const [name, scale] of Object.entries(DENSITIES)) {
    const dir = `${RES}/mipmap-${name}`
    write(`${dir}/ic_launcher.png`, await png(iconSvg(), 48 * scale))
    write(`${dir}/ic_launcher_round.png`, await png(iconSvg(true), 48 * scale))
    write(`${dir}/ic_launcher_foreground.png`, await png(foregroundSvg(), 108 * scale))
    write(`${dir}/ic_launcher_monochrome.png`, await png(monochromeSvg(), 108 * scale))
    write(`${RES}/drawable-${name}/splash_logo.png`, await png(splashLogoSvg(FONT), 160 * scale))
  }
  // Vecchi file del modello di Capacitor: la schermata di avvio ora è splash.xml (colore + logo centrato).
  for (const dir of readdirSync(RES).filter((d) => /^drawable(-land|-port)?(-[a-z]+dpi)?$/.test(d))) {
    if (existsSync(`${RES}/${dir}/splash.png`)) rmSync(`${RES}/${dir}/splash.png`)
  }
  for (const old of [`${RES}/drawable/ic_launcher_background.xml`, `${RES}/drawable-v24/ic_launcher_foreground.xml`]) rmSync(old, { force: true })
  write(`${RES}/values/ic_launcher_background.xml`, `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${appConfig.colors.primary}</color>\n</resources>\n`)
  const adaptive = `<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n    <background android:drawable="@color/ic_launcher_background"/>\n    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n    <monochrome android:drawable="@mipmap/ic_launcher_monochrome"/>\n</adaptive-icon>\n`
  write(`${RES}/mipmap-anydpi-v26/ic_launcher.xml`, adaptive)
  write(`${RES}/mipmap-anydpi-v26/ic_launcher_round.xml`, adaptive)
  write(`${RES}/drawable/splash.xml`, `<?xml version="1.0" encoding="utf-8"?>\n<layer-list xmlns:android="http://schemas.android.com/apk/res/android">\n    <item android:drawable="@color/ic_launcher_background"/>\n    <item>\n        <bitmap android:gravity="center" android:src="@drawable/splash_logo"/>\n    </item>\n</layer-list>\n`)
  console.log('Asset generati.')
} finally {
  await browser.close()
}
