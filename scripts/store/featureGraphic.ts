import { LOGO } from '../../src/brand/logoPaths.ts'

// Immagine in primo piano per Google Play (1024x500): marchio, nome e frase. Tutto disegnato qui, nessuna immagine esterna.
// Il testo usa il font Nunito (caricato dal PNG con @font-face) e ripiega su un sans-serif per l'SVG aperto da solo.
export function featureGraphicSvg(): string {
  const dots = LOGO.dots.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${LOGO.dotRadius}" fill="#F2B94B"/>`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500" role="img" aria-label="Frienzy: eventi dal vivo e nuove amicizie">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E2725B"/><stop offset="1" stop-color="#C9573F"/></linearGradient>
  </defs>
  <rect width="1024" height="500" fill="url(#bg)"/>
  <circle cx="120" cy="470" r="190" fill="#F2B94B" opacity=".18"/>
  <circle cx="960" cy="40" r="150" fill="#FFF8F0" opacity=".12"/>
  <path d="M0 430 Q260 360 520 420 T1024 400 V500 H0Z" fill="#2F5D50" opacity=".9"/>
  <g transform="translate(560 -10) scale(.95)">
    <path d="${LOGO.back}" fill="#2F5D50"/>
    <path d="${LOGO.front}" fill="#FFF8F0"/>
    <path d="${LOGO.letter}" fill="#E2725B"/>
    <path d="${LOGO.spark}" fill="#F2B94B"/>
    ${dots}
  </g>
  <g font-family="'Nunito Variable', Nunito, system-ui, sans-serif" fill="#FFF8F0">
    <text x="64" y="205" font-size="104" font-weight="800">Frienzy</text>
    <text x="68" y="262" font-size="36" font-weight="600">Eventi dal vivo, nuove amicizie.</text>
    <text x="68" y="312" font-size="28" font-weight="500" opacity=".92">Aperitivi, cene, mostre, passeggiate e sport.</text>
  </g>
</svg>
`
}
