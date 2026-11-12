import { applyMode } from './apply'
import type { ThemeMode } from './palettes'
import { readChoice, resolveMode, writeChoice, type ThemeChoice } from './preference'

// Piccolo archivio osservabile: tiene scelta e tema attivo, applica alla pagina e avvisa chi ascolta.
type Listener = () => void
const listeners = new Set<Listener>()
let choice: ThemeChoice = 'auto'
let mode: ThemeMode = 'chiaro'
let query: MediaQueryList | null = null

function storage(): Storage | null {
  try { return typeof localStorage === 'undefined' ? null : localStorage } catch { return null }
}

function recompute(): void {
  mode = resolveMode(choice, query?.matches ?? false)
  applyMode(document.documentElement, mode)
  listeners.forEach((l) => l())
}

/** Da chiamare una volta all'avvio: legge la scelta salvata e segue le variazioni del telefono. */
export function initTheme(): void {
  choice = readChoice(storage())
  query = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)') : null
  query?.addEventListener?.('change', recompute)
  recompute()
}

export function setChoice(next: ThemeChoice): void {
  choice = next
  writeChoice(storage(), next)
  recompute()
}

export const getChoice = (): ThemeChoice => choice
export const getMode = (): ThemeMode => mode
export function subscribe(l: Listener): () => void {
  listeners.add(l)
  return () => listeners.delete(l)
}
