import { appConfig } from '../config/app'
import { paletteVariables } from './cssVars'
import { PALETTES, type ThemeMode } from './palettes'

/** Applica un tema alla pagina: variabili, attributo data-theme, color-scheme e colore della barra del browser. */
export function applyMode(root: HTMLElement, mode: ThemeMode): void {
  const palette = PALETTES[mode]
  for (const [name, value] of Object.entries(paletteVariables(palette))) root.style.setProperty(name, value)
  root.style.setProperty('--radius', appConfig.radius)
  root.dataset.theme = mode
  root.style.colorScheme = mode === 'scuro' ? 'dark' : 'light'
  const meta = root.ownerDocument.querySelector('meta[name="theme-color"]')
  meta?.setAttribute('content', palette.themeBar)
}
