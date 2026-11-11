import { Capacitor } from '@capacitor/core'

/** true se l'app è visibile adesso (in primo piano). */
export const isForeground = (): boolean => typeof document === 'undefined' || document.visibilityState !== 'hidden'

/**
 * Chiama `callback` quando l'app torna in primo piano. Sul telefono ascolta anche l'evento nativo di Capacitor
 * (la WebView non sempre segnala la visibilità); sul web basta `visibilitychange`. Restituisce la funzione che toglie l'ascolto.
 */
export function onForeground(callback: () => void): () => void {
  const onVisible = () => { if (isForeground()) callback() }
  document.addEventListener('visibilitychange', onVisible)
  let removeNative: (() => void) | null = null
  let cancelled = false
  if (Capacitor.isNativePlatform()) {
    void import('@capacitor/app').then(({ App }) => App.addListener('appStateChange', (state) => { if (state.isActive) callback() }))
      .then((handle) => { if (cancelled) void handle.remove(); else removeNative = () => void handle.remove() })
      .catch(() => undefined)
  }
  return () => {
    cancelled = true
    document.removeEventListener('visibilitychange', onVisible)
    removeNative?.()
  }
}
