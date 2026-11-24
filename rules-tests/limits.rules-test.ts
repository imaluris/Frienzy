import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { Timestamp, addDoc, collection, doc, getDoc, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore'
import { ANNA, BRUNO, ORG, addWithLimit, createEnv, eventData, place, seedEvent, seedParticipation, type LimitField, userDb } from './env'

let env: RulesTestEnvironment
beforeAll(async () => { env = await createEnv() })
afterAll(async () => { await env.cleanup() })
beforeEach(async () => {
  await env.clearFirestore()
  await seedEvent(env, 'e1')
  await seedParticipation(env, 'e1', ANNA, 'confermato')
})

const as = (uid: string) => userDb(env, uid)
const msgs = (uid: string) => collection(as(uid), 'events', 'e1', 'messaggi')
const message = (uid: string) => ({ authorUid: uid, testo: 'Ciao', creatoIl: serverTimestamp() })

// Simula "l'ultima azione è di N secondi fa" scrivendo il documento dei limiti saltando le regole.
async function seedLimit(uid: string, field: LimitField, secondsAgo: number) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'limiti', uid), { [field]: Timestamp.fromMillis(Date.now() - secondsAgo * 1000) })
  })
}

async function createEvent(uid: string) {
  const db = as(uid)
  const ref = doc(collection(db, 'events'))
  const batch = writeBatch(db)
  batch.set(ref, eventData({ organizzatoreId: uid }))
  batch.set(doc(ref, 'privato', 'luogo'), place)
  batch.set(doc(db, 'limiti', uid), { ultimoEvento: serverTimestamp() }, { merge: true })
  return batch.commit()
}

describe('regole: limiti di frequenza dei messaggi', () => {
  it('il primo messaggio passa, il secondo subito dopo no', async () => {
    await assertSucceeds(addWithLimit(as(ANNA), ANNA, 'ultimoMessaggio', msgs(ANNA), message(ANNA)))
    await assertFails(addWithLimit(as(ANNA), ANNA, 'ultimoMessaggio', msgs(ANNA), message(ANNA)))
  })

  it('dopo l\'intervallo (2 secondi) si può scrivere ancora', async () => {
    await seedLimit(ANNA, 'ultimoMessaggio', 10)
    await assertSucceeds(addWithLimit(as(ANNA), ANNA, 'ultimoMessaggio', msgs(ANNA), message(ANNA)))
  })

  it('senza timbro nello stesso batch il messaggio è rifiutato', async () => {
    await assertFails(addDoc(msgs(ANNA), message(ANNA)))
  })

  it('il timbro deve avere l\'ora del server, non un\'ora scelta dal client', async () => {
    const db = as(ANNA)
    const batch = writeBatch(db)
    batch.set(doc(msgs(ANNA)), message(ANNA))
    batch.set(doc(db, 'limiti', ANNA), { ultimoMessaggio: Timestamp.fromDate(new Date('2020-01-01')) }, { merge: true })
    await assertFails(batch.commit())
  })

  it('il timbro di un altro campo non vale per i messaggi', async () => {
    const db = as(ANNA)
    const batch = writeBatch(db)
    batch.set(doc(msgs(ANNA)), message(ANNA))
    batch.set(doc(db, 'limiti', ANNA), { ultimaSegnalazione: serverTimestamp() }, { merge: true })
    await assertFails(batch.commit())
  })
})

describe('regole: limiti di frequenza degli eventi', () => {
  it('un evento passa, il secondo entro un minuto no', async () => {
    await assertSucceeds(createEvent(ORG))
    await assertFails(createEvent(ORG))
  })

  it('dopo un minuto si può crearne un altro', async () => {
    await seedLimit(ORG, 'ultimoEvento', 90)
    await assertSucceeds(createEvent(ORG))
  })

  it('un altro utente ha il suo conteggio', async () => {
    await assertSucceeds(createEvent(ORG))
    await assertSucceeds(createEvent(BRUNO))
  })
})

describe('regole: limiti di frequenza delle segnalazioni', () => {
  const report = () => ({ reporterUid: ANNA, tipo: 'evento', targetId: 'e1', motivo: 'spam', dettagli: '', creatoIl: serverTimestamp() })
  it('una segnalazione ogni 30 secondi', async () => {
    const col = () => collection(as(ANNA), 'segnalazioni')
    await assertSucceeds(addWithLimit(as(ANNA), ANNA, 'ultimaSegnalazione', col(), report()))
    await assertFails(addWithLimit(as(ANNA), ANNA, 'ultimaSegnalazione', col(), report()))
    await seedLimit(ANNA, 'ultimaSegnalazione', 40)
    await assertSucceeds(addWithLimit(as(ANNA), ANNA, 'ultimaSegnalazione', col(), report()))
  })
})

describe('regole: documento dei limiti', () => {
  it('lo legge e lo scrive solo il proprietario', async () => {
    await seedLimit(ANNA, 'ultimoMessaggio', 100)
    await assertSucceeds(getDoc(doc(as(ANNA), 'limiti', ANNA)))
    await assertFails(getDoc(doc(as(BRUNO), 'limiti', ANNA)))
    await assertFails(setDoc(doc(as(BRUNO), 'limiti', ANNA), { ultimoMessaggio: serverTimestamp() }))
  })

  it('non accetta campi inventati né ore false', async () => {
    await assertFails(setDoc(doc(as(ANNA), 'limiti', ANNA), { altro: 1 }))
    await assertFails(setDoc(doc(as(ANNA), 'limiti', ANNA), { ultimoEvento: Timestamp.now() }))
  })
})
