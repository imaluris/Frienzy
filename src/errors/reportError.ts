import { logError } from './errorLog'

/** Da usare nei `catch`: registra l'errore in locale e restituisce il messaggio da mostrare. */
export function errorMessage(error: unknown, where: string): string {
  return logError(error, where).message
}
