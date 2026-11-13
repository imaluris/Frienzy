// Accettazione di Termini d'uso e Informativa privacy, e dichiarazione di maggiore età.
// Si salva nel profilo con data e versione dei testi: se i testi cambiano, si alza TERMS_VERSION.

export const TERMS_VERSION = '2026-11'

export interface Consent {
  versione: string
  accettatoIl: Date
  /** L'utente ha dichiarato di avere almeno 18 anni (oltre alla data di nascita). */
  maggiorenne: true
}

/** Stato delle due caselle del form. */
export interface ConsentChecks {
  terms: boolean
  adult: boolean
}

export const NO_CONSENT: ConsentChecks = { terms: false, adult: false }

/** Messaggio da mostrare se manca una casella, altrimenti null. La maggiore età viene prima. */
export function validateConsent(checks: ConsentChecks): string | null {
  if (!checks.adult) return 'Per usare Frienzy devi confermare di avere almeno 18 anni.'
  if (!checks.terms) return "Per continuare devi accettare i Termini d'uso e l'Informativa privacy."
  return null
}

/** Il consenso da salvare, con la data di adesso. Lancia se le caselle non sono tutte spuntate. */
export function buildConsent(checks: ConsentChecks, now: Date = new Date()): Consent {
  const problem = validateConsent(checks)
  if (problem) throw new Error(problem)
  return { versione: TERMS_VERSION, accettatoIl: now, maggiorenne: true }
}

/** Il consenso salvato vale ancora (stessa versione dei testi)? */
export function isConsentCurrent(consent: Consent | undefined): boolean {
  return consent?.versione === TERMS_VERSION
}
