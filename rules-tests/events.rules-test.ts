import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { collection, doc, getDoc, updateDoc, writeBatch, deleteDoc } from 'firebase/firestore'
import { ANNA, BRUNO, ORG, createEnv, eventData, place, seedEvent, seedParticipation } from './env'

let env: RulesTestEnvironment
beforeAll(async () => { env = await createEnv() })
afterAll(async () => { await env.cleanup() })
beforeEach(async () => { await env.clearFirestore() })

const as = (uid: string) => env.authenticatedContext(uid).firestore()

// Come fa FirestoreEventRepository.create: evento + luogo esatto nello stesso batch.
async function createLikeApp(uid: string, over: Record<string, unknown> = {}) {
  const db = as(uid)
  const ref = doc(collection(db, 'events'))
  const batch = writeBatch(db)
  batch.set(ref, eventData(over))
  batch.set(doc(ref, 'privato', 'luogo'), place)
  return batch.commit()
}

describe('regole: eventi', () => {
  it('l\'organizzatore crea evento e luogo esatto insieme', async () => {
    await assertSucceeds(createLikeApp(ORG))
  })

  it('non si crea un evento a nome di un altro', async () => {
    await assertFails(createLikeApp(ANNA, { organizzatoreId: ORG }))
  })

  it('un evento nasce sempre "aperto"', async () => {
    await assertFails(createLikeApp(ORG, { stato: 'annullato' }))
  })

  it('solo l\'organizzatore modifica o annulla', async () => {
    await seedEvent(env, 'e1')
    await assertSucceeds(updateDoc(doc(as(ORG), 'events', 'e1'), { stato: 'annullato' }))
    await assertFails(updateDoc(doc(as(ANNA), 'events', 'e1'), { stato: 'annullato' }))
  })

  it('non si cambia l\'organizzatore e non si cancella', async () => {
    await seedEvent(env, 'e1')
    await assertFails(updateDoc(doc(as(ORG), 'events', 'e1'), { organizzatoreId: ANNA }))
    await assertFails(deleteDoc(doc(as(ORG), 'events', 'e1')))
  })

  it('chi è collegato legge l\'evento pubblico', async () => {
    await seedEvent(env, 'e1')
    await assertSucceeds(getDoc(doc(as(BRUNO), 'events', 'e1')))
  })
})

describe('regole: luogo esatto', () => {
  const luogo = (uid: string) => getDoc(doc(as(uid), 'events', 'e1', 'privato', 'luogo'))

  it('lo legge l\'organizzatore', async () => {
    await seedEvent(env, 'e1')
    await assertSucceeds(luogo(ORG))
  })

  it('lo legge un confermato', async () => {
    await seedEvent(env, 'e1')
    await seedParticipation(env, 'e1', ANNA, 'confermato')
    await assertSucceeds(luogo(ANNA))
  })

  it('non lo leggono richiesta, rifiutato, estraneo', async () => {
    await seedEvent(env, 'e1')
    await seedParticipation(env, 'e1', ANNA, 'richiesta')
    await seedParticipation(env, 'e1', BRUNO, 'rifiutato')
    await assertFails(luogo(ANNA))
    await assertFails(luogo(BRUNO))
    await assertFails(luogo('estraneo'))
  })
})
