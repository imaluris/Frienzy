import { useEffect } from 'react'

// Riporta la pagina in cima quando cambia la chiave (nuova schermata o nuovo passo):
// altrimenti si resta scorsi a metà e il titolo finisce sotto l'intestazione.
export function useScrollTop(key: string): void {
  useEffect(() => {
    if (typeof window.scrollTo === 'function') window.scrollTo(0, 0)
  }, [key])
}
