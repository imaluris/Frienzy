import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { Timestamp, deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { ANNA, BRUNO, ORG, createEnv, seedEvent, seedParticipation } from './env'

let env: RulesTestEnvironment
beforeAll(async () => { env = await createEnv() })
afterAll(async () => { await env.cleanup() })
beforeEach(async () => { await env.clearFirestore() })

const as = (uid: string) => env.authenticatedContext(uid).firestore()
const ref = (db: ReturnType<typeof as>, uid: string) => doc(db, 'events', 'e1', 'partecipanti', uid)
const body = (uid: string, stato: string) => ({ eventId: 'e1', uid, stato, creatoIl: Timestamp.now() })

describe('regole: iscrizione', () => {
  it('evento libero: si crea solo "confermato"', async () => {
    await seedEvent(env, 'e1', { richiedeApprovazione: false })
    await assertSucceeds(setDoc(ref(as(ANNA), ANNA), body(ANNA, 'confermato')))
    await assertFails(setDoc(ref(as(BRUNO), BRUNO), body(BRUNO, 'richiesta')))
  })

  it('evento con approvazione: si crea solo "richiesta"', async () => {
    await seedEvent(env, 'e1', { richiedeApprovazione: true })
    await assertFails(setDoc(ref(as(ANNA), ANNA), body(ANNA, 'confermato')))
    await assertSucceeds(setDoc(ref(as(ANNA), ANNA), body(ANNA, 'richiesta')))
  })

  it('ci si iscrive solo a nome proprio', async () => {
    await seedEvent(env, 'e1')
    await assertFails(setDoc(ref(as(ANNA), BRUNO), body(BRUNO, 'confermato')))
  })

  it('non ci si iscrive a un evento annullato', async () => {
    await seedEvent(env, 'e1', { stato: 'annullato' })
    await assertFails(setDoc(ref(as(ANNA), ANNA), body(ANNA, 'confermato')))
  })
})

describe('regole: decisioni e ritiro', () => {
  it('solo l\'organizzatore conferma o rifiuta una richiesta', async () => {
    await seedEvent(env, 'e1', { richiedeApprovazione: true })
    await seedParticipation(env, 'e1', ANNA, 'richiesta')
    await assertFails(updateDoc(ref(as(ANNA), ANNA), { stato: 'confermato' }))
    await assertSucceeds(updateDoc(ref(as(ORG), ANNA), { stato: 'confermato' }))
  })

  it('non si torna indietro da rifiutato o confermato', async () => {
    await seedEvent(env, 'e1', { richiedeApprovazione: true })
    await seedParticipation(env, 'e1', ANNA, 'rifiutato')
    await assertFails(updateDoc(ref(as(ORG), ANNA), { stato: 'confermato' }))
  })

  it('l\'organizzatore non cambia altri campi', async () => {
    await seedEvent(env, 'e1', { richiedeApprovazione: true })
    await seedParticipation(env, 'e1', ANNA, 'richiesta')
    await assertFails(updateDoc(ref(as(ORG), ANNA), { stato: 'confermato', uid: BRUNO }))
  })

  it('ognuno ritira la propria partecipazione, non quella degli altri', async () => {
    await seedEvent(env, 'e1')
    await seedParticipation(env, 'e1', ANNA, 'confermato')
    await assertFails(deleteDoc(ref(as(BRUNO), ANNA)))
    await assertSucceeds(deleteDoc(ref(as(ANNA), ANNA)))
  })
})

describe('regole: lettura delle partecipazioni', () => {
  it('una richiesta la leggono chi l\'ha fatta e l\'organizzatore, non gli altri', async () => {
    await seedEvent(env, 'e1', { richiedeApprovazione: true })
    await seedParticipation(env, 'e1', ANNA, 'richiesta')
    await assertSucceeds(getDoc(ref(as(ANNA), ANNA)))
    await assertSucceeds(getDoc(ref(as(ORG), ANNA)))
    await assertFails(getDoc(ref(as(BRUNO), ANNA)))
  })

  it('un confermato è visibile a chi è collegato', async () => {
    await seedEvent(env, 'e1')
    await seedParticipation(env, 'e1', ANNA, 'confermato')
    await assertSucceeds(getDoc(ref(as(BRUNO), ANNA)))
  })
})
