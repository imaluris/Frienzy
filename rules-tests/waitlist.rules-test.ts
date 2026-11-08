import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { Timestamp, deleteDoc, doc, setDoc, updateDoc, writeBatch } from 'firebase/firestore'
import { ANNA, BRUNO, ORG, createEnv, seedEvent, seedParticipation } from './env'

// Lista d'attesa: eventi da 1 posto, Anna confermata, Bruno e Carla (eventualmente) in coda.
// NB: questi test sono scritti ma non eseguibili dal cloud (serve l'emulatore): vedi "Cose che restano ad Andrea".
let env: RulesTestEnvironment
beforeAll(async () => { env = await createEnv() })
afterAll(async () => { await env.cleanup() })
beforeEach(async () => { await env.clearFirestore() })

const CARLA = 'carla'
const as = (uid: string) => env.authenticatedContext(uid).firestore()
type Db = ReturnType<typeof as>
const ref = (db: Db, uid: string) => doc(db, 'events', 'e1', 'partecipanti', uid)
const seats = (db: Db) => doc(db, 'events', 'e1', 'contatori', 'posti')
const queue = (db: Db) => doc(db, 'events', 'e1', 'contatori', 'attesa')
const body = (uid: string, stato: string) => ({ eventId: 'e1', uid, stato, creatoIl: Timestamp.now() })

async function seed(coda: string[], over: Record<string, unknown> = {}) {
  await seedEvent(env, 'e1', { maxPartecipanti: 1, ...over })
  await seedParticipation(env, 'e1', ANNA, 'confermato')
  for (const uid of coda) await seedParticipation(env, 'e1', uid, 'inAttesa')
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(seats(ctx.firestore()), { confermati: 1 })
    if (coda.length) await setDoc(queue(ctx.firestore()), { coda })
  })
}

/** Mettersi in coda come fa l'app: partecipazione 'inAttesa' + coda aggiornata nello stesso batch. */
function joinQueue(uid: string, coda: string[]) {
  const db = as(uid)
  return writeBatch(db).set(ref(db, uid), body(uid, 'inAttesa')).set(queue(db), { coda }).commit()
}

describe('regole: mettersi in lista d\'attesa', () => {
  it('a evento pieno ci si accoda', async () => {
    await seed([])
    await assertSucceeds(joinQueue(BRUNO, [BRUNO]))
  })

  it('il secondo va dietro al primo', async () => {
    await seed([BRUNO])
    await assertSucceeds(joinQueue(CARLA, [BRUNO, CARLA]))
  })

  it('con posti liberi la lista è rifiutata', async () => {
    await seedEvent(env, 'e1', { maxPartecipanti: 3 })
    await assertFails(joinQueue(BRUNO, [BRUNO]))
  })

  it('non si salta la fila né si toglie qualcuno dalla coda', async () => {
    await seed([BRUNO])
    await assertFails(joinQueue(CARLA, [CARLA, BRUNO]))
    await assertFails(joinQueue(CARLA, [CARLA]))
  })

  it('senza aggiornare la coda è rifiutato', async () => {
    await seed([])
    await assertFails(setDoc(ref(as(BRUNO), BRUNO), body(BRUNO, 'inAttesa')))
  })

  it('evento annullato: rifiutato', async () => {
    await seed([], { stato: 'annullato' })
    await assertFails(joinQueue(BRUNO, [BRUNO]))
  })

  it('la coda non si scrive da sola', async () => {
    await seed([])
    await assertFails(setDoc(queue(as(BRUNO)), { coda: [BRUNO] }))
  })
})

describe('regole: uscire dalla lista', () => {
  it('esco dalla coda con la mia iscrizione nello stesso batch', async () => {
    await seed([BRUNO, CARLA])
    const db = as(BRUNO)
    await assertSucceeds(writeBatch(db).delete(ref(db, BRUNO)).set(queue(db), { coda: [CARLA] }).commit())
  })

  it('senza togliermi dalla coda è rifiutato', async () => {
    await seed([BRUNO])
    await assertFails(deleteDoc(ref(as(BRUNO), BRUNO)))
  })

  it('non si toglie un altro dalla coda', async () => {
    await seed([BRUNO, CARLA])
    const db = as(CARLA)
    await assertFails(writeBatch(db).delete(ref(db, BRUNO)).set(queue(db), { coda: [CARLA] }).commit())
  })
})

describe('regole: promozione del primo in lista', () => {
  /** Anna si ritira: il suo documento sparisce, il primo sale, la coda perde la testa. */
  function withdrawAndPromote(coda: string[], promoted: string, stato: string, confermati?: number) {
    const db = as(ANNA)
    const batch = writeBatch(db).delete(ref(db, ANNA)).update(ref(db, promoted), { stato }).set(queue(db), { coda })
    if (confermati !== undefined) batch.set(seats(db), { confermati })
    return batch.commit()
  }

  it('evento libero: il primo diventa confermato e i posti restano 1', async () => {
    await seed([BRUNO, CARLA])
    await assertSucceeds(withdrawAndPromote([CARLA], BRUNO, 'confermato'))
  })

  it('si promuove solo il primo, non il secondo', async () => {
    await seed([BRUNO, CARLA])
    await assertFails(withdrawAndPromote([BRUNO], CARLA, 'confermato'))
  })

  it('con approvazione il primo diventa richiesta e il contatore scende', async () => {
    await seed([BRUNO], { richiedeApprovazione: true })
    await assertSucceeds(withdrawAndPromote([], BRUNO, 'richiesta', 0))
  })

  it('con approvazione non si salta direttamente a confermato', async () => {
    await seed([BRUNO], { richiedeApprovazione: true })
    await assertFails(withdrawAndPromote([], BRUNO, 'confermato'))
  })

  it('nessuno promuove un altro da solo', async () => {
    await seed([BRUNO])
    await assertFails(updateDoc(ref(as(CARLA), BRUNO), { stato: 'confermato' }))
    await assertFails(updateDoc(ref(as(ORG), BRUNO), { stato: 'confermato' }))
  })

  it('evento annullato: nessuna promozione', async () => {
    await seed([BRUNO], { stato: 'annullato' })
    await assertFails(withdrawAndPromote([], BRUNO, 'confermato'))
  })
})
