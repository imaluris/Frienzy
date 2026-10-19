import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { Timestamp, deleteDoc, doc, getDoc, updateDoc, writeBatch } from 'firebase/firestore'
import { ANNA, BRUNO, ORG, createEnv, seedEvent, seedParticipation } from './env'

let env: RulesTestEnvironment
beforeAll(async () => { env = await createEnv() })
afterAll(async () => { await env.cleanup() })
beforeEach(async () => { await env.clearFirestore() })

const as = (uid: string) => env.authenticatedContext(uid).firestore()
const ref = (db: ReturnType<typeof as>, uid: string) => doc(db, 'events', 'e1', 'partecipanti', uid)
const seats = (db: ReturnType<typeof as>) => doc(db, 'events', 'e1', 'contatori', 'posti')
/** Iscrizione come la fa l'app: partecipazione + contatore (se confermato) nello stesso batch. */
async function join(uid: string, stato: string, confermati = 1) {
  const db = as(uid)
  const batch = writeBatch(db)
  batch.set(ref(db, uid), body(uid, stato))
  if (stato === 'confermato') batch.set(seats(db), { confermati })
  return batch.commit()
}
const body = (uid: string, stato: string) => ({ eventId: 'e1', uid, stato, creatoIl: Timestamp.now() })

describe('regole: iscrizione', () => {
  it('evento libero: si crea solo "confermato"', async () => {
    await seedEvent(env, 'e1', { richiedeApprovazione: false })
    await assertSucceeds(join(ANNA, 'confermato'))
    await assertFails(join(BRUNO, 'richiesta'))
  })

  it('evento con approvazione: si crea solo "richiesta"', async () => {
    await seedEvent(env, 'e1', { richiedeApprovazione: true })
    await assertFails(join(ANNA, 'confermato'))
    await assertSucceeds(join(ANNA, 'richiesta'))
  })

  it('ci si iscrive solo a nome proprio', async () => {
    await seedEvent(env, 'e1')
    await assertFails(writeBatch(as(ANNA)).set(ref(as(ANNA), BRUNO), body(BRUNO, 'confermato')).commit())
  })

  it('non ci si iscrive a un evento annullato', async () => {
    await seedEvent(env, 'e1', { stato: 'annullato' })
    await assertFails(join(ANNA, 'confermato'))
  })

  it('confermato senza aggiornare il contatore: rifiutato', async () => {
    await seedEvent(env, 'e1')
    await assertFails(writeBatch(as(ANNA)).set(ref(as(ANNA), ANNA), body(ANNA, 'confermato')).commit())
  })

  it('oltre il massimo posti: rifiutato', async () => {
    await seedEvent(env, 'e1', { maxPartecipanti: 1 })
    await assertSucceeds(join(ANNA, 'confermato', 1))
    await assertFails(join(BRUNO, 'confermato', 2))
  })

  it('il contatore non si cambia da solo', async () => {
    await seedEvent(env, 'e1')
    await assertFails(writeBatch(as(ANNA)).set(seats(as(ANNA)), { confermati: 1 }).commit())
  })
})

describe('regole: decisioni e ritiro', () => {
  it('solo l\'organizzatore conferma o rifiuta una richiesta', async () => {
    await seedEvent(env, 'e1', { richiedeApprovazione: true })
    await seedParticipation(env, 'e1', ANNA, 'richiesta')
    await assertFails(updateDoc(ref(as(ANNA), ANNA), { stato: 'confermato' }))
    await assertSucceeds(updateDoc(ref(as(ORG), ANNA), { stato: 'rifiutato' }))
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

describe('regole: accettazione con contatore posti', () => {
  const seats = (db: ReturnType<typeof as>) => doc(db, 'events', 'e1', 'contatori', 'posti')

  async function accept(uid: string, n: number) {
    const db = as(uid)
    const batch = writeBatch(db)
    batch.update(ref(db, ANNA), { stato: 'confermato' })
    batch.set(seats(db), { confermati: n })
    return batch.commit()
  }

  it("l'organizzatore accetta una richiesta e il contatore sale di 1", async () => {
    await seedEvent(env, 'e1', { richiedeApprovazione: true, maxPartecipanti: 2 })
    await seedParticipation(env, 'e1', ANNA, 'richiesta')
    await assertSucceeds(accept(ORG, 1))
  })

  it('accettare senza aggiornare il contatore è rifiutato', async () => {
    await seedEvent(env, 'e1', { richiedeApprovazione: true })
    await seedParticipation(env, 'e1', ANNA, 'richiesta')
    await assertFails(updateDoc(ref(as(ORG), ANNA), { stato: 'confermato' }))
  })

  it('non si accetta oltre il massimo', async () => {
    await seedEvent(env, 'e1', { richiedeApprovazione: true, maxPartecipanti: 1 })
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(seats(ctx.firestore()), { confermati: 1 })
    })
    await seedParticipation(env, 'e1', ANNA, 'richiesta')
    await assertFails(accept(ORG, 2))
  })

  it('un altro utente non può incrementare il contatore', async () => {
    await seedEvent(env, 'e1', { richiedeApprovazione: true, maxPartecipanti: 5 })
    await seedParticipation(env, 'e1', ANNA, 'richiesta')
    await assertFails(setDoc(seats(as(BRUNO)), { confermati: 1 }))
  })

  it('rifiutare non tocca il contatore', async () => {
    await seedEvent(env, 'e1', { richiedeApprovazione: true })
    await seedParticipation(env, 'e1', ANNA, 'richiesta')
    await assertSucceeds(updateDoc(ref(as(ORG), ANNA), { stato: 'rifiutato' }))
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
