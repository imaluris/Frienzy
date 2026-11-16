import { doc, serverTimestamp, type WriteBatch } from 'firebase/firestore'
import type { LimitField } from '../limits/limits'
import { db } from './app'

/**
 * Aggiunge al batch il "timbro" dell'azione: limiti/{uid}.{campo} = ora del server.
 * Le regole Firestore accettano l'azione solo se il timbro è nello stesso batch e se è passato
 * l'intervallo minimo dall'ultima volta (vedi firestore.rules, funzione validLimits).
 */
export function stampLimit(batch: WriteBatch, uid: string, field: LimitField): void {
  batch.set(doc(db(), 'limiti', uid), { [field]: serverTimestamp() }, { merge: true })
}
