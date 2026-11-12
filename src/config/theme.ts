import { appConfig } from './app'

// Traduce la palette di marca in variabili CSS (il tema chiaro/scuro completo è in src/theme).
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
