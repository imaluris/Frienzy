// Legge la configurazione Firebase dalle variabili d'ambiente (mai scritta nel codice).
export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

type Env = Record<string, string | undefined>

// Nome della variabile -> campo della config.
const KEYS: Record<keyof FirebaseConfig, string> = {
  apiKey: 'VITE_FIREBASE_API_KEY',
  authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
  projectId: 'VITE_FIREBASE_PROJECT_ID',
  storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'VITE_FIREBASE_APP_ID',
}

/** Costruisce la config; se manca una variabile lancia un errore che dice quale. */
export function readFirebaseConfig(env: Env): FirebaseConfig {
  const missing = Object.values(KEYS).filter((name) => !env[name])
  if (missing.length > 0) {
    throw new Error(`Variabili Firebase mancanti: ${missing.join(', ')}`)
  }
  const config = {} as FirebaseConfig
  for (const field of Object.keys(KEYS) as (keyof FirebaseConfig)[]) {
    config[field] = env[KEYS[field]] as string
  }
  return config
}
