import { connect } from './io/admin'
import { run } from './run'

// Punto d'ingresso del workflow. Senza la chiave del service account le notifiche sono spente: esce senza errore.
const key = process.env.FIREBASE_SERVICE_ACCOUNT
if (!key) {
  console.log('Notifiche spente: manca il segreto FIREBASE_SERVICE_ACCOUNT.')
} else {
  run(connect(key)).catch((error) => {
    console.error('Notificatore fermato da un errore', error)
    process.exitCode = 1
  })
}
