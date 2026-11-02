import { LOGO } from '../../src/brand/logoPaths.ts'
import { appConfig } from '../../src/config/app.ts'

const c = appConfig.colors
const dots = (fill: string) => LOGO.dots.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${LOGO.dotRadius}" fill="${fill}"/>`).join('')

// Il marchio (fumetti + F + scintilla). `front` e `gap` cambiano con il fondo; il resto è fisso.
function mark(front: string, letter: string, gap: string): string {
  return `<path d="${LOGO.back}" fill="${c.secondary}"/>${dots(c.background)}` +
    `<path d="${LOGO.front}" fill="${front}" stroke="${gap}" stroke-width="14" stroke-linejoin="round"/>` +
    `<path d="${LOGO.letter}" fill="${letter}"/><path d="${LOGO.spark}" fill="${c.accent}"/>`
}

const wrap = (inner: string, viewBox = '0 0 512 512') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="512" height="512">${inner}</svg>`

// Marchio chiaro su trasparente: primo piano dell'icona adattiva e logo della schermata di avvio.
export const foregroundSvg = () => wrap(`<g transform="translate(-4 6)">${mark(c.background, c.primary, c.primary)}</g>`)

// Icona completa (quadrato arrotondato terracotta): favicon, icona web e icone Android senza forma adattiva.
export const iconSvg = (round = false) =>
  wrap(`<rect width="512" height="512" rx="${round ? 256 : 112}" fill="${c.primary}"/><g transform="translate(256 256) scale(1.12) translate(-256 -256) translate(-4 6)">${mark(c.background, c.primary, c.primary)}</g>`)

// Sagoma a un solo colore per le icone "a tema" di Android 13+: la F e i puntini sono ritagliati con una maschera.
export const monochromeSvg = () =>
  wrap(
    `<defs><mask id="f"><rect width="512" height="512" fill="#fff"/><path d="${LOGO.letter}" fill="#000"/></mask>` +
      `<mask id="b"><rect width="512" height="512" fill="#fff"/><path d="${LOGO.front}" fill="#000" stroke="#000" stroke-width="14" stroke-linejoin="round"/>` +
      `${dots('#000')}</mask></defs>` +
      `<g transform="translate(-4 6)"><path d="${LOGO.back}" fill="#000" mask="url(#b)"/>` +
      `<path d="${LOGO.front}" fill="#000" mask="url(#f)"/><path d="${LOGO.spark}" fill="#000"/></g>`,
  )

// Logo della schermata di avvio: marchio chiaro e scritta "Frienzy" scura (contrasto 5:1 sul terracotta), su trasparente (il fondo terracotta lo mette Android).
export const splashLogoSvg = (fontUrl: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">` +
  `<style>@font-face{font-family:N;src:url('${fontUrl}');font-weight:200 1000}text{font-family:N;font-weight:900}</style>` +
  `<g transform="translate(56 8) scale(0.78)">${mark(c.background, c.primary, c.primary)}</g>` +
  `<text x="256" y="452" text-anchor="middle" font-size="96" fill="${c.text}">${appConfig.name}</text></svg>`
