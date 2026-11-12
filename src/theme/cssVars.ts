import type { Palette } from './palettes'

// Nome della variabile CSS per ogni voce della palette (es. surface2 -> --color-surface-2).
function kebab(key: string): string {
  return key.replace(/([a-z])([A-Z0-9])/g, '$1-$2').toLowerCase()
}

export function paletteVariables(p: Palette): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const [key, value] of Object.entries(p)) {
    if (key === 'shadowRgb') vars['--shadow-rgb'] = value
    else if (key === 'shadowK') vars['--shadow-k'] = value
    else if (key === 'themeBar') continue
    else vars[`--color-${kebab(key)}`] = value
  }
  return vars
}
