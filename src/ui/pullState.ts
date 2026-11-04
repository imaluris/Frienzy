/** Quanto si deve tirare (in px, già "frenato") perché al rilascio parta l'aggiornamento. */
export const PULL_THRESHOLD = 64
/** Tirata massima mostrata: oltre, il contenuto non scende più. */
export const PULL_MAX = 112

/** Dalla distanza percorsa dal dito alla tirata mostrata: metà del movimento, mai oltre il massimo, mai negativa. */
export function dampenPull(fingerDistance: number): number {
  if (fingerDistance <= 0) return 0
  return Math.min(PULL_MAX, fingerDistance * 0.5)
}

/** Al rilascio: si aggiorna solo se la tirata ha raggiunto la soglia. */
export function shouldRefresh(pull: number): boolean {
  return pull >= PULL_THRESHOLD
}
