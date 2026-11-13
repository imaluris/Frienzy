import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { Timestamp, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore'
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

  it('senza consenso valido il profilo non si crea', async () => {
    const { consenso: _unused, ...senza } = profile()
    void _unused
    await assertFails(setDoc(doc(as(ANNA), 'users', ANNA), senza))
    await assertFails(setDoc(doc(as(ANNA), 'users', ANNA), profile({ consenso: { versione: '2026-11', accettatoIl: Timestamp.now(), maggiorenne: false } })))
    await assertFails(setDoc(doc(as(ANNA), 'users', ANNA), profile({ consenso: { versione: '', accettatoIl: Timestamp.now(), maggiorenne: true } })))
    await assertFails(setDoc(doc(as(ANNA), 'users', ANNA), profile({ consenso: { versione: '2026-11', accettatoIl: Timestamp.now(), maggiorenne: true, extra: 1 } })))
  })

  it('il consenso non si toglie con una modifica, ma un profilo vecchio può aggiungerlo', async () => {
    await assertSucceeds(setDoc(doc(as(ANNA), 'users', ANNA), profile()))
    const { consenso: _unused, ...senza } = profile()
    void _unused
    await assertFails(setDoc(doc(as(ANNA), 'users', ANNA), senza))
    await env.withSecurityRulesDisabled(async (ctx) => { await setDoc(doc(ctx.firestore(), 'users', BRUNO), senza) })
    await assertSucceeds(setDoc(doc(as(BRUNO), 'users', BRUNO), profile()))
  })

  it('un utente collegato legge i profili', async () => {
    await assertSucceeds(setDoc(doc(as(ANNA), 'users', ANNA), profile()))
    await assertSucceeds(getDoc(doc(as(BRUNO), 'users', ANNA)))
  })

  it('ognuno cancella solo il proprio profilo', async () => {
    await assertSucceeds(setDoc(doc(as(ANNA), 'users', ANNA), profile()))
    await assertFails(deleteDoc(doc(as(BRUNO), 'users', ANNA)))
    await assertSucceeds(deleteDoc(doc(as(ANNA), 'users', ANNA)))
  })
})
