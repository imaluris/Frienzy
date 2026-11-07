import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { Timestamp, addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where, writeBatch } from 'firebase/firestore'
import { ANNA, BRUNO, ORG, createEnv, seedEvent } from './env'

let env: RulesTestEnvironment
beforeAll(async () => { env = await createEnv() })
afterAll(async () => { await env.cleanup() })
beforeEach(async () => { await env.clearFirestore() })

const as = (uid: string) => env.authenticatedContext(uid).firestore()
const block = (blocker: string, blocked: string, over: Record<string, unknown> = {}) => ({ blockerId: blocker, blockedId: blocked, creatoIl: serverTimestamp(), ...over })
const blockRef = (db: ReturnType<typeof as>, blocker: string, blocked: string) => doc(db, 'blocchi', `${blocker}_${blocked}`)
const report = (over: Record<string, unknown> = {}) => ({ reporterUid: ANNA, tipo: 'evento', targetId: 'e1', motivo: 'spam', dettagli: '', creatoIl: serverTimestamp(), ...over })

describe('regole: blocchi', () => {
  it('chi blocca crea e toglie il proprio blocco', async () => {
    await assertSucceeds(setDoc(blockRef(as(ANNA), ANNA, BRUNO), block(ANNA, BRUNO)))
    await assertSucceeds(deleteDoc(blockRef(as(ANNA), ANNA, BRUNO)))
  })

  it('non si blocca a nome di un altro, né se stessi, né con id sbagliato o campi extra', async () => {
    await assertFails(setDoc(blockRef(as(BRUNO), ANNA, BRUNO), block(ANNA, BRUNO)))
    await assertFails(setDoc(blockRef(as(ANNA), ANNA, ANNA), block(ANNA, ANNA)))
    await assertFails(setDoc(doc(as(ANNA), 'blocchi', 'a_caso'), block(ANNA, BRUNO)))
    await assertFails(setDoc(blockRef(as(ANNA), ANNA, BRUNO), block(ANNA, BRUNO, { extra: 1 })))
  })

  it('il blocco lo leggono i due coinvolti, non un terzo; il bloccato non lo toglie', async () => {
    await assertSucceeds(setDoc(blockRef(as(ANNA), ANNA, BRUNO), block(ANNA, BRUNO)))
    await assertSucceeds(getDoc(blockRef(as(BRUNO), ANNA, BRUNO)))
    await assertSucceeds(getDocs(query(collection(as(ANNA), 'blocchi'), where('blockerId', '==', ANNA))))
    await assertSucceeds(getDocs(query(collection(as(BRUNO), 'blocchi'), where('blockedId', '==', BRUNO))))
    await assertFails(getDoc(blockRef(as(ORG), ANNA, BRUNO)))
    await assertFails(getDocs(query(collection(as(ORG), 'blocchi'), where('blockerId', '==', ANNA))))
    await assertFails(deleteDoc(blockRef(as(BRUNO), ANNA, BRUNO)))
  })

  it('chi è bloccato dall\'organizzatore non può iscriversi (e nemmeno nel senso opposto)', async () => {
    await seedEvent(env, 'e1', { richiedeApprovazione: true })
    await assertSucceeds(setDoc(blockRef(as(ORG), ORG, ANNA), block(ORG, ANNA)))
    const join = (uid: string) => writeBatch(as(uid)).set(doc(as(uid), 'events', 'e1', 'partecipanti', uid), { eventId: 'e1', uid, stato: 'richiesta', creatoIl: Timestamp.now() }).commit()
    await assertFails(join(ANNA))
    await assertSucceeds(setDoc(blockRef(as(BRUNO), BRUNO, ORG), block(BRUNO, ORG)))
    await assertFails(join(BRUNO))
  })
})

describe('regole: segnalazioni', () => {
  it('chi è collegato ne crea una valida', async () => {
    await assertSucceeds(addDoc(collection(as(ANNA), 'segnalazioni'), report()))
    await assertSucceeds(addDoc(collection(as(ANNA), 'segnalazioni'), report({ tipo: 'utente', targetId: BRUNO, motivo: 'altro', dettagli: 'Messaggi insistenti' })))
  })

  it('nessun utente le rilegge, le modifica o le cancella', async () => {
    const ref = await addDoc(collection(as(ANNA), 'segnalazioni'), report())
    await assertFails(getDoc(doc(as(ANNA), 'segnalazioni', ref.id)))
    await assertFails(getDocs(collection(as(ANNA), 'segnalazioni')))
    await assertFails(deleteDoc(doc(as(ANNA), 'segnalazioni', ref.id)))
    await assertFails(setDoc(doc(as(ANNA), 'segnalazioni', ref.id), report({ motivo: 'truffa' })))
  })

  it('rifiuta firma altrui, auto-segnalazione, motivo o tipo inventati, testo lungo, campi extra, data falsa', async () => {
    const c = () => collection(as(ANNA), 'segnalazioni')
    await assertFails(addDoc(c(), report({ reporterUid: BRUNO })))
    await assertFails(addDoc(c(), report({ tipo: 'utente', targetId: ANNA })))
    await assertFails(addDoc(c(), report({ motivo: 'noia' })))
    await assertFails(addDoc(c(), report({ tipo: 'messaggio' })))
    await assertFails(addDoc(c(), report({ dettagli: 'x'.repeat(301) })))
    await assertFails(addDoc(c(), report({ extra: 1 })))
    await assertFails(addDoc(c(), report({ creatoIl: Timestamp.fromDate(new Date('2020-01-01')) })))
    await assertFails(addDoc(collection(env.unauthenticatedContext().firestore(), 'segnalazioni'), report()))
  })
})
