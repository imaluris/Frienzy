import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { Timestamp, collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { ANNA, BRUNO, ORG, createEnv, seedEvent, seedParticipation } from './env'

// Presenze e voti. NB: scritti ma non eseguibili dal cloud (serve l'emulatore): vedi "Cose che restano ad Andrea".
let env: RulesTestEnvironment
beforeAll(async () => { env = await createEnv() })
afterAll(async () => { await env.cleanup() })
beforeEach(async () => { await env.clearFirestore() })

const as = (uid: string) => env.authenticatedContext(uid).firestore()
type Db = ReturnType<typeof as>
const PAST = { dataOra: Timestamp.fromDate(new Date('2020-01-01T20:00:00Z')) }
const presence = (db: Db, uid = ANNA) => doc(db, 'presenze', `e1_${uid}`)
const rating = (db: Db, uid = ANNA) => doc(db, 'valutazioni', `e1_${uid}`)
const presenceBody = (uid = ANNA, over: Record<string, unknown> = {}) => ({ eventId: 'e1', uid, organizzatoreId: ORG, stato: 'presente', segnatoIl: serverTimestamp(), ...over })
const ratingBody = (uid = ANNA, over: Record<string, unknown> = {}) => ({ eventId: 'e1', uid, organizzatoreId: ORG, stelle: 4, etichetta: 'Puntuale', creatoIl: serverTimestamp(), ...over })

async function seed(eventOver: Record<string, unknown> = PAST) {
  await seedEvent(env, 'e1', eventOver)
  await seedParticipation(env, 'e1', ANNA, 'confermato')
  await seedParticipation(env, 'e1', BRUNO, 'richiesta')
}

describe('regole: presenze', () => {
  it("l'organizzatore segna (e corregge) un confermato dopo l'inizio", async () => {
    await seed()
    await assertSucceeds(setDoc(presence(as(ORG)), presenceBody()))
    await assertSucceeds(setDoc(presence(as(ORG)), presenceBody(ANNA, { stato: 'assente' })))
  })

  it('non segna chi non organizza, né a nome di un altro organizzatore', async () => {
    await seed()
    await assertFails(setDoc(presence(as(ANNA)), presenceBody(ANNA, { organizzatoreId: ANNA })))
    await assertFails(setDoc(presence(as(BRUNO)), presenceBody()))
  })

  it('non segna prima della data, se annullato, né chi non è confermato', async () => {
    await seed({ dataOra: Timestamp.fromDate(new Date('2030-01-01T20:00:00Z')) })
    await assertFails(setDoc(presence(as(ORG)), presenceBody()))
    await env.clearFirestore()
    await seed({ ...PAST, stato: 'annullato' })
    await assertFails(setDoc(presence(as(ORG)), presenceBody()))
    await env.clearFirestore()
    await seed()
    await assertFails(setDoc(presence(as(ORG), BRUNO), presenceBody(BRUNO)))
  })

  it('stato, id e campi devono essere quelli previsti; non si cancella', async () => {
    await seed()
    await assertFails(setDoc(presence(as(ORG)), presenceBody(ANNA, { stato: 'forse' })))
    await assertFails(setDoc(doc(as(ORG), 'presenze', 'a_caso'), presenceBody()))
    await assertFails(setDoc(presence(as(ORG)), presenceBody(ANNA, { extra: 1 })))
    await assertSucceeds(setDoc(presence(as(ORG)), presenceBody()))
    await assertFails(deleteDoc(presence(as(ORG))))
  })

  it('le presenze di una persona le legge qualunque utente collegato', async () => {
    await seed()
    await assertSucceeds(setDoc(presence(as(ORG)), presenceBody()))
    await assertSucceeds(getDocs(query(collection(as(BRUNO), 'presenze'), where('uid', '==', ANNA))))
    await assertFails(getDocs(query(collection(env.unauthenticatedContext().firestore(), 'presenze'), where('uid', '==', ANNA))))
  })
})

describe('regole: valutazioni', () => {
  it('un confermato vota dopo la data, una sola volta', async () => {
    await seed()
    await assertSucceeds(setDoc(rating(as(ANNA)), ratingBody()))
    await assertFails(setDoc(rating(as(ANNA)), ratingBody(ANNA, { stelle: 1 }))) // niente seconda scrittura
    await assertFails(updateDoc(rating(as(ANNA)), { stelle: 1 }))
    await assertFails(deleteDoc(rating(as(ANNA))))
  })

  it('non vota prima della data, se annullato, da non confermato, né l\'organizzatore, né a nome di un altro', async () => {
    await seed({ dataOra: Timestamp.fromDate(new Date('2030-01-01T20:00:00Z')) })
    await assertFails(setDoc(rating(as(ANNA)), ratingBody()))
    await env.clearFirestore()
    await seed({ ...PAST, stato: 'annullato' })
    await assertFails(setDoc(rating(as(ANNA)), ratingBody()))
    await env.clearFirestore()
    await seed()
    await assertFails(setDoc(rating(as(BRUNO), BRUNO), ratingBody(BRUNO)))
    await assertFails(setDoc(rating(as(ORG), ORG), ratingBody(ORG)))
    await assertFails(setDoc(rating(as(BRUNO)), ratingBody(ANNA)))
  })

  it('stelle da 1 a 5 intere, etichetta della lista, organizzatore giusto, niente campi extra', async () => {
    await seed()
    for (const stelle of [0, 6, 2.5]) await assertFails(setDoc(rating(as(ANNA)), ratingBody(ANNA, { stelle })))
    await assertFails(setDoc(rating(as(ANNA)), ratingBody(ANNA, { etichetta: 'Boh' })))
    await assertFails(setDoc(rating(as(ANNA)), ratingBody(ANNA, { organizzatoreId: BRUNO })))
    await assertFails(setDoc(rating(as(ANNA)), ratingBody(ANNA, { extra: 1 })))
    await assertSucceeds(setDoc(rating(as(ANNA)), ratingBody(ANNA, { stelle: 5, etichetta: '' })))
  })

  it("il voto lo leggono chi ha votato e l'organizzatore, non gli altri", async () => {
    await seed()
    await assertSucceeds(setDoc(rating(as(ANNA)), ratingBody()))
    await assertSucceeds(getDoc(rating(as(ANNA))))
    await assertSucceeds(getDocs(query(collection(as(ORG), 'valutazioni'), where('organizzatoreId', '==', ORG))))
    await assertFails(getDoc(rating(as(BRUNO))))
  })
})
