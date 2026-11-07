import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { Timestamp, addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { ANNA, BRUNO, ORG, createEnv, seedEvent, seedParticipation } from './env'

let env: RulesTestEnvironment
beforeAll(async () => { env = await createEnv() })
afterAll(async () => { await env.cleanup() })
beforeEach(async () => {
  await env.clearFirestore()
  await seedEvent(env, 'e1')
  await seedParticipation(env, 'e1', ANNA, 'confermato')
  await seedParticipation(env, 'e1', BRUNO, 'richiesta')
})

const as = (uid: string) => env.authenticatedContext(uid).firestore()
const msgs = (uid: string) => collection(as(uid), 'events', 'e1', 'messaggi')
const message = (uid: string, over: Record<string, unknown> = {}) => ({ authorUid: uid, testo: 'Ciao a tutti', creatoIl: serverTimestamp(), ...over })

async function seedMessage(id: string, uid = ANNA) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'events', 'e1', 'messaggi', id), { authorUid: uid, testo: 'Ciao', creatoIl: Timestamp.now() })
  })
}

describe('regole: chat dell\'evento', () => {
  it('organizzatore e confermati scrivono e leggono', async () => {
    await assertSucceeds(addDoc(msgs(ANNA), message(ANNA)))
    await assertSucceeds(addDoc(msgs(ORG), message(ORG)))
    await assertSucceeds(getDocs(msgs(ANNA)))
    await assertSucceeds(getDocs(msgs(ORG)))
  })

  it('chi ha solo una richiesta o non è iscritto non legge né scrive', async () => {
    await assertFails(addDoc(msgs(BRUNO), message(BRUNO)))
    await assertFails(getDocs(msgs(BRUNO)))
    await assertFails(addDoc(msgs('estraneo'), message('estraneo')))
    await assertFails(getDocs(msgs('estraneo')))
  })

  it('chi lascia l\'evento perde l\'accesso', async () => {
    await assertSucceeds(getDocs(msgs(ANNA)))
    await env.withSecurityRulesDisabled(async (ctx) => { await deleteDoc(doc(ctx.firestore(), 'events', 'e1', 'partecipanti', ANNA)) })
    await assertFails(getDocs(msgs(ANNA)))
    await assertFails(addDoc(msgs(ANNA), message(ANNA)))
  })

  it('non si scrive a nome di un altro, né con campi extra o data falsa', async () => {
    await assertFails(addDoc(msgs(ANNA), message(ORG)))
    await assertFails(addDoc(msgs(ANNA), message(ANNA, { extra: 1 })))
    await assertFails(addDoc(msgs(ANNA), message(ANNA, { creatoIl: Timestamp.fromDate(new Date('2020-01-01')) })))
  })

  it('il testo ha da 1 a 500 caratteri', async () => {
    await assertFails(addDoc(msgs(ANNA), message(ANNA, { testo: '' })))
    await assertFails(addDoc(msgs(ANNA), message(ANNA, { testo: 'a'.repeat(501) })))
    await assertFails(addDoc(msgs(ANNA), message(ANNA, { testo: 42 })))
    await assertSucceeds(addDoc(msgs(ANNA), message(ANNA, { testo: 'a'.repeat(500) })))
  })

  it('in un evento annullato non si scrive più', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => { await updateDoc(doc(ctx.firestore(), 'events', 'e1'), { stato: 'annullato' }) })
    await assertFails(addDoc(msgs(ANNA), message(ANNA)))
  })

  it('i messaggi non si modificano', async () => {
    await seedMessage('m1')
    await assertFails(updateDoc(doc(as(ANNA), 'events', 'e1', 'messaggi', 'm1'), { testo: 'cambiato' }))
    await assertFails(updateDoc(doc(as(ORG), 'events', 'e1', 'messaggi', 'm1'), { testo: 'cambiato' }))
  })

  it('li cancella l\'organizzatore, e ognuno cancella solo i propri', async () => {
    await seedMessage('m1') // scritto da ANNA
    await assertFails(deleteDoc(doc(as(BRUNO), 'events', 'e1', 'messaggi', 'm1')))
    await assertSucceeds(deleteDoc(doc(as(ANNA), 'events', 'e1', 'messaggi', 'm1')))
    await seedMessage('m2')
    await assertSucceeds(deleteDoc(doc(as(ORG), 'events', 'e1', 'messaggi', 'm2')))
  })

  it('chi non è collegato non può nulla', async () => {
    const anon = env.unauthenticatedContext().firestore()
    await assertFails(getDocs(collection(anon, 'events', 'e1', 'messaggi')))
    await assertFails(addDoc(collection(anon, 'events', 'e1', 'messaggi'), message(ANNA)))
  })
})
