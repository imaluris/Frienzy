// Segnale "i miei dati sono cambiati" (iscrizione, ritiro, annullamento...): chi ascolta ricalcola i promemoria e gli avvisi.
type Listener = () => void
const listeners = new Set<Listener>()

export function onDataChanged(listener: Listener): () => void {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}

export function notifyDataChanged(): void {
  listeners.forEach((listener) => listener())
}
