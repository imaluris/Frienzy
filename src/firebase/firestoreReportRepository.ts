import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import type { NewReport } from '../safety/report'
import type { ReportRepository } from '../safety/reportRepository'
import { db } from './app'

// segnalazioni/{id}: le regole permettono di crearle ma non di rileggerle (le vede solo chi gestisce l'app).
export class FirestoreReportRepository implements ReportRepository {
  async submit(report: NewReport): Promise<void> {
    await addDoc(collection(db(), 'segnalazioni'), { ...report, creatoIl: serverTimestamp() })
  }
}
