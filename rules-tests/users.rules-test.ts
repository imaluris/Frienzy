import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { Timestamp, doc, getDoc, setDoc } from 'firebase/firestore'
import { ANNA, BRUNO, createEnv, profile } from './env'

let env: RulesTestEnvironment
beforeAll(async () => { env = await createEnv() })
afterAll(async () => { await env.cleanup() })
beforeEach(async () => { await env.clearFirestore() })

const as = (uid: string) => env.authenticatedContext(uid).firestore()

describe('regole: profili', () => {
  it('ognuno scrive il proprio profilo', async () => {
    await assertSucceeds(setDoc(doc(as(ANNA), 'users', ANNA), profile()))
  })

  it('nessuno scrive il profilo di un altro', async () => {
    await assertFails(setDoc(doc(as(BRUNO), 'users', ANNA), profile()))
  })

  it('chi non è collegato non scrive e non legge', async () => {
    const anon = env.unauthenticatedContext().firestore()
    await assertFails(setDoc(doc(anon, 'users', ANNA), profile()))
    await assertFails(getDoc(doc(anon, 'users', ANNA)))
  })

  it('i minorenni sono rifiutati', async () => {
    const recent = Timestamp.fromDate(new Date(Date.now() - 10 * 365 * 24 * 3600 * 1000))
    await assertFails(setDoc(doc(as(ANNA), 'users', ANNA), profile({ dataNascita: recent })))
  })

  it('campi extra o interessi non validi sono rifiutati', async () => {
    await assertFails(setDoc(doc(as(ANNA), 'users', ANNA), profile({ admin: true })))
    await assertFails(setDoc(doc(as(ANNA), 'users', ANNA), profile({ interessi: ['karaoke'] })))
  })

  it('un utente collegato legge i profili', async () => {
    await assertSucceeds(setDoc(doc(as(ANNA), 'users', ANNA), profile()))
    await assertSucceeds(getDoc(doc(as(BRUNO), 'users', ANNA)))
  })
})
