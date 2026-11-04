import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { Timestamp, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { ANNA, BRUNO, createEnv } from './env'

let env: RulesTestEnvironment
beforeAll(async () => { env = await createEnv() })
afterAll(async () => { await env.cleanup() })
beforeEach(async () => { await env.clearFirestore() })

const as = (uid: string) => env.authenticatedContext(uid).firestore()
const saved = (uid: string, eventId: string, over: Record<string, unknown> = {}) => ({ eventId, creatoIl: serverTimestamp(), ...over })

describe('regole: eventi salvati', () => {
  it('ognuno salva e toglie i propri eventi', async () => {
    await assertSucceeds(setDoc(doc(as(ANNA), 'users', ANNA, 'salvati', 'e1'), saved(ANNA, 'e1')))
    await assertSucceeds(deleteDoc(doc(as(ANNA), 'users', ANNA, 'salvati', 'e1')))
  })

  it('ognuno legge i propri salvati, nessun altro', async () => {
    await assertSucceeds(setDoc(doc(as(ANNA), 'users', ANNA, 'salvati', 'e1'), saved(ANNA, 'e1')))
    await assertSucceeds(getDocs(collection(as(ANNA), 'users', ANNA, 'salvati')))
    await assertFails(getDoc(doc(as(BRUNO), 'users', ANNA, 'salvati', 'e1')))
    await assertFails(getDocs(collection(as(BRUNO), 'users', ANNA, 'salvati')))
  })

  it('nessuno scrive o cancella i salvati di un altro', async () => {
    await assertFails(setDoc(doc(as(BRUNO), 'users', ANNA, 'salvati', 'e1'), saved(ANNA, 'e1')))
    await assertSucceeds(setDoc(doc(as(ANNA), 'users', ANNA, 'salvati', 'e1'), saved(ANNA, 'e1')))
    await assertFails(deleteDoc(doc(as(BRUNO), 'users', ANNA, 'salvati', 'e1')))
  })

  it("l'id nel documento deve coincidere, senza campi extra e con data del server", async () => {
    await assertFails(setDoc(doc(as(ANNA), 'users', ANNA, 'salvati', 'e1'), saved(ANNA, 'altro')))
    await assertFails(setDoc(doc(as(ANNA), 'users', ANNA, 'salvati', 'e1'), saved(ANNA, 'e1', { extra: 1 })))
    await assertFails(setDoc(doc(as(ANNA), 'users', ANNA, 'salvati', 'e1'), saved(ANNA, 'e1', { creatoIl: Timestamp.fromDate(new Date('2020-01-01')) })))
  })

  it('chi non è collegato non può nulla', async () => {
    const anon = env.unauthenticatedContext().firestore()
    await assertFails(setDoc(doc(anon, 'users', ANNA, 'salvati', 'e1'), saved(ANNA, 'e1')))
  })
})
