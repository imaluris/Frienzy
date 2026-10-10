import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { readFirebaseConfig } from './config'

// Inizializza Firebase una volta sola (gli accessi successivi riusano la stessa app).
function firebaseApp() {
  if (getApps().length > 0) return getApp()
  return initializeApp(readFirebaseConfig(import.meta.env))
}

export const db = () => getFirestore(firebaseApp())
export const auth = () => getAuth(firebaseApp())
