import type { FirebaseApp } from 'firebase/app'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'

type Env = Record<string, string | undefined>

/** La chiave pubblica reCAPTCHA v3 di App Check, oppure null se non è configurata (App Check resta spento). */
export function appCheckSiteKey(env: Env): string | null {
  const key = env.VITE_APPCHECK_SITE_KEY?.trim()
  return key ? key : null
}

/**
 * App Check fa arrivare a Firebase solo richieste che vengono davvero dall'app, non da script esterni.
 * Resta SPENTO finché VITE_APPCHECK_SITE_KEY non è impostata: così l'app funziona anche senza.
 * (Gratuito: reCAPTCHA v3. Prima di attivarlo nella console, vedi docs/giorno-44-costi-abusi.md.)
 * Restituisce true se l'ha attivato.
 */
export function activateAppCheck(app: FirebaseApp, env: Env): boolean {
  const key = appCheckSiteKey(env)
  if (!key) return false
  initializeAppCheck(app, { provider: new ReCaptchaV3Provider(key), isTokenAutoRefreshEnabled: true })
  return true
}
