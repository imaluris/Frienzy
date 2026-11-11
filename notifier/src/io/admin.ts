import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

/** Collega il notificatore a Firebase con la chiave del service account (JSON dal segreto del repo). */
export function connect(serviceAccountJson: string): Firestore {
  if (getApps().length === 0) initializeApp({ credential: cert(JSON.parse(serviceAccountJson)) })
  return getFirestore()
}
