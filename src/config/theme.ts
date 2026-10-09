import { appConfig } from './app'

// Traduce la config in variabili CSS applicate alla pagina.
export function themeVariables(): Record<string, string> {
  const c = appConfig.colors
  return {
    '--color-primary': c.primary,
    '--color-secondary': c.secondary,
    '--color-accent': c.accent,
    '--color-background': c.background,
    '--color-text': c.text,
    '--radius': appConfig.radius,
  }
}

export function applyTheme(root: HTMLElement): void {
  for (const [name, value] of Object.entries(themeVariables())) {
    root.style.setProperty(name, value)
  }
}
