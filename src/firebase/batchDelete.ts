import { writeBatch, type DocumentReference } from 'firebase/firestore'
import { db } from './app'

const BATCH_LIMIT = 400 // Firestore accetta al massimo 500 scritture per gruppo: si resta sotto

/** Cancella molti documenti a gruppi, per rispettare il limite di Firestore. */
export async function deleteInBatches(refs: DocumentReference[]): Promise<void> {
  for (let i = 0; i < refs.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db())
    refs.slice(i, i + BATCH_LIMIT).forEach((r) => batch.delete(r))
    await batch.commit()
  }
}
