import { afterEach, beforeEach, vi } from 'vitest'

/**
 * Fissa la data (solo la data, non i timer) a un lunedì: le file "Questo weekend" dipendono dal giorno della settimana
 * e senza questo i test che contano le schede darebbero risultati diversi a seconda del giorno in cui girano.
 */
export function useFixedMonday() {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 2, 10, 0, 0)) // lunedì 2 novembre 2026, 10:00
  })
  afterEach(() => {
    vi.useRealTimers()
  })
}
