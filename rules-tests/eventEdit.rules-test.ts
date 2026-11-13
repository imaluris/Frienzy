import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, serverTimestamp, setDoc, Timestamp, updateDoc } from 'firebase/firestore'
import { ANNA, ORG, createEnv, seedEvent } from './env'

let env: RulesTestEnvironment
beforeAll(async () => { env = await createEnv() })
afterAll(async () => { await env.cleanup() })
beforeEach(async () => { await env.clearFirestore() })

const as = (uid: string) => env.authenticatedContext(uid).firestore()
const ev = (uid: string) => doc(as(uid), 'events', 'e1')
const future = Timestamp.fromDate(new Date('2031-06-01T18:00:00Z'))

async function seedConfirmed(count: number) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'events', 'e1', 'contatori', 'posti'), { confermati: count })
  })
}

describe('regole: modifica evento', () => {
  it("l'organizzatore cambia titolo, descrizione, data e posti con l'avviso", async () => {
    await seedEvent(env, 'e1')
    await assertSucceeds(updateDoc(ev(ORG), {
      titolo: 'Cena in giardino', descrizione: 'Si cena fuori', dataOra: future, maxPartecipanti: 10,
      modificatoIl: serverTimestamp(), modifiche: ['titolo', 'descrizione', 'dataOra', 'maxPartecipanti'],
    }))
  })

  it('un altro utente non modifica', async () => {
    await seedEvent(env, 'e1')
    await assertFails(updateDoc(ev(ANNA), { titolo: 'Titolo rubato' }))
  })

  it('i posti non scendono sotto i confermati', async () => {
    await seedEvent(env, 'e1')
    await seedConfirmed(4)
    await assertFails(updateDoc(ev(ORG), { maxPartecipanti: 3 }))
    await assertSucceeds(updateDoc(ev(ORG), { maxPartecipanti: 4 }))
  })

  it('la nuova data deve essere nel futuro', async () => {
    await seedEvent(env, 'e1')
    await assertFails(updateDoc(ev(ORG), { dataOra: Timestamp.fromDate(new Date('2020-01-01T10:00:00Z')) }))
  })

  it('tipo, zona, posizione e approvazione non si cambiano', async () => {
    await seedEvent(env, 'e1')
    await assertFails(updateDoc(ev(ORG), { tipo: 'sport' }))
    await assertFails(updateDoc(ev(ORG), { zonaNome: 'Altrove' }))
    await assertFails(updateDoc(ev(ORG), { latApprossimata: 41.9 }))
    await assertFails(updateDoc(ev(ORG), { richiedeApprovazione: true }))
  })

  it("l'ora della modifica è quella del server e l'elenco dei campi è limitato", async () => {
    await seedEvent(env, 'e1')
    await assertFails(updateDoc(ev(ORG), { titolo: 'Nuovo titolo', modificatoIl: Timestamp.fromDate(new Date('2020-01-01')), modifiche: ['titolo'] }))
    await assertFails(updateDoc(ev(ORG), { titolo: 'Nuovo titolo', modificatoIl: serverTimestamp(), modifiche: ['zonaNome'] }))
  })

  it('titolo troppo corto o descrizione troppo lunga restano vietati', async () => {
    await seedEvent(env, 'e1')
    await assertFails(updateDoc(ev(ORG), { titolo: 'ab' }))
    await assertFails(updateDoc(ev(ORG), { descrizione: 'x'.repeat(1001) }))
  })
})
