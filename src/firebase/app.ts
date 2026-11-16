import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { activateAppCheck } from './appCheck'
import { readFirebaseConfig } from './config'

// Inizializza Firebase una volta sola (gli accessi successivi riusano la stessa app).
function firebaseApp() {
  if (getApps().length > 0) return getApp()
  const app = initializeApp(readFirebaseConfig(import.meta.env))
  activateAppCheck(app, import.meta.env) // non fa nulla finché manca la chiave (task 44)
  return app
}

export const db = () => getFirestore(firebaseApp())
export const auth = () => getAuth(firebaseApp())
export const storage = () => getStorage(firebaseApp())
