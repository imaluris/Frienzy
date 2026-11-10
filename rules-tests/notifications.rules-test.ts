import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { ANNA, BRUNO, createEnv } from './env'

let env: RulesTestEnvironment
beforeAll(async () => { env = await createEnv() })
afterAll(async () => { await env.cleanup() })
beforeEach(async () => { await env.clearFirestore() })

const as = (uid: string) => env.authenticatedContext(uid).firestore()
const prefs = (over: Record<string, unknown> = {}) => ({ promemoria: true, richieste: true, risposte: true, inviti: false, ...over })
const device = (over: Record<string, unknown> = {}) => ({ token: 'abc', zona: 'u0nd9', aggiornatoIl: serverTimestamp(), ...over })
const prefsRef = (uid: string, ctx = as(uid)) => doc(ctx, 'users', uid, 'notifiche', 'preferenze')
const deviceRef = (uid: string, ctx = as(uid)) => doc(ctx, 'users', uid, 'notifiche', 'dispositivo')

describe('regole: preferenze di notifica', () => {
  it('il proprietario scrive, legge e cancella', async () => {
    await assertSucceeds(setDoc(prefsRef(ANNA), prefs()))
    await assertSucceeds(getDoc(prefsRef(ANNA)))
    await assertSucceeds(deleteDoc(prefsRef(ANNA)))
  })

  it('gli altri non leggono né scrivono', async () => {
    await assertSucceeds(setDoc(prefsRef(ANNA), prefs()))
    await assertFails(getDoc(prefsRef(ANNA, as(BRUNO))))
    await assertFails(setDoc(prefsRef(ANNA, as(BRUNO)), prefs({ inviti: true })))
  })

  it('solo i quattro interruttori, tutti booleani', async () => {
    await assertFails(setDoc(prefsRef(ANNA), prefs({ extra: 1 })))
    await assertFails(setDoc(prefsRef(ANNA), prefs({ inviti: 'sì' })))
    await assertFails(setDoc(prefsRef(ANNA), { promemoria: true }))
  })
})

describe('regole: dispositivo di notifica', () => {
  it('il proprietario salva token e zona, gli altri no', async () => {
    await assertSucceeds(setDoc(deviceRef(ANNA), device()))
    await assertFails(setDoc(deviceRef(ANNA, as(BRUNO)), device()))
    await assertFails(getDoc(deviceRef(ANNA, as(BRUNO))))
  })

  it('la zona è al massimo di 5 caratteri (niente posizione esatta)', async () => {
    await assertSucceeds(setDoc(deviceRef(ANNA), device({ zona: '' })))
    await assertFails(setDoc(deviceRef(ANNA), device({ zona: 'u0nd9hxyz' })))
  })

  it('campi extra, data falsa o token enorme vengono rifiutati', async () => {
    await assertFails(setDoc(deviceRef(ANNA), device({ lat: 45.1 })))
    await assertFails(setDoc(deviceRef(ANNA), device({ aggiornatoIl: new Date('2020-01-01') })))
    await assertFails(setDoc(deviceRef(ANNA), device({ token: 'x'.repeat(2000) })))
  })
})
