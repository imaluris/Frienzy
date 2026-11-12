import type { ThemeMode } from './palettes'

// La scelta dell'utente: Chiaro, Scuro oppure Automatico (segue il telefono).
export type ThemeChoice = 'chiaro' | 'scuro' | 'auto'
export const CHOICES: readonly ThemeChoice[] = ['chiaro', 'scuro', 'auto']
export const STORAGE_KEY = 'frienzy.tema'

export function isChoice(value: unknown): value is ThemeChoice {
  return typeof value === 'string' && (CHOICES as readonly string[]).includes(value)
}

/** Da scelta e impostazione del telefono al tema da mostrare. */
export function resolveMode(choice: ThemeChoice, systemDark: boolean): ThemeMode {
  if (choice === 'auto') return systemDark ? 'scuro' : 'chiaro'
  return choice
}

export function readChoice(storage: Pick<Storage, 'getItem'> | null): ThemeChoice {
  try {
    const value = storage?.getItem(STORAGE_KEY)
    return isChoice(value) ? value : 'auto'
  } catch {
    return 'auto'
  }
}

export function writeChoice(storage: Pick<Storage, 'setItem'> | null, choice: ThemeChoice): void {
  try {
    storage?.setItem(STORAGE_KEY, choice)
  } catch {
    // Archivio non disponibile (navigazione privata): la scelta vale solo per questa sessione.
  }
}
