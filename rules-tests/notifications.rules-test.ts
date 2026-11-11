import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { ANNA, BRUNO, createEnv } from './env'

let env: RulesTestEnvironment
beforeAll(async () => { env = await createEnv() })
afterAll(async () => { await env.cleanup() })
beforeEach(async () => { await env.clearFirestore() })

const as = (uid: string) => env.authenticatedContext(uid).firestore()
const prefs = (over: Record<string, unknown> = {}) => ({ promemoria: true, richieste: true, risposte: true, inviti: false, ...over })
const device = (over: Record<string, unknown> = {}) => ({ token: 'abc', zona: 'u0nd9', aggiornatoIl: serverTimestamp(), ...over })
const prefsRef = (uid: string, ctx = as(uid)) => doc(ctx, 'users', uid, 'notifiche', 'preferenze')
const deviceRef = (uid: string, ctx = as(uid)) => doc(ctx, 'dispositivi', uid)
const seenRef = (uid: string, ctx = as(uid)) => doc(ctx, 'users', uid, 'notifiche', 'visti')
const seen = (over: Record<string, unknown> = {}) => ({ chiavi: ['inv:e1'], aggiornatoIl: serverTimestamp(), ...over })

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

describe('regole: dispositivo a primo livello (dispositivi/{uid})', () => {
  it('un utente non può scrivere il dispositivo di un altro, nemmeno cancellarlo', async () => {
    await assertSucceeds(setDoc(deviceRef(ANNA), device()))
    await assertFails(deleteDoc(deviceRef(ANNA, as(BRUNO))))
    await assertSucceeds(deleteDoc(deviceRef(ANNA)))
  })

  it('nessuno legge la raccolta intera (solo il notificatore, con credenziali di amministrazione)', async () => {
    await assertSucceeds(setDoc(deviceRef(ANNA), device()))
    await assertFails(getDocs(collection(as(BRUNO), 'dispositivi')))
    await assertFails(getDocs(collection(as(ANNA), 'dispositivi')))
  })

  it('il vecchio percorso users/{uid}/notifiche/dispositivo non è più scrivibile', async () => {
    await assertFails(setDoc(doc(as(ANNA), 'users', ANNA, 'notifiche', 'dispositivo'), device()))
  })
})

describe('regole: avvisi visti', () => {
  it('il proprietario scrive, legge e cancella; gli altri no', async () => {
    await assertSucceeds(setDoc(seenRef(ANNA), seen()))
    await assertSucceeds(getDoc(seenRef(ANNA)))
    await assertFails(getDoc(seenRef(ANNA, as(BRUNO))))
    await assertFails(setDoc(seenRef(ANNA, as(BRUNO)), seen()))
    await assertSucceeds(deleteDoc(seenRef(ANNA)))
  })

  it('al massimo 200 chiavi, solo una lista, nessun campo extra, data del server', async () => {
    await assertSucceeds(setDoc(seenRef(ANNA), seen({ chiavi: Array.from({ length: 200 }, (_, i) => `k${i}`) })))
    await assertFails(setDoc(seenRef(ANNA), seen({ chiavi: Array.from({ length: 201 }, (_, i) => `k${i}`) })))
    await assertFails(setDoc(seenRef(ANNA), seen({ chiavi: 'inv:e1' })))
    await assertFails(setDoc(seenRef(ANNA), seen({ extra: 1 })))
    await assertFails(setDoc(seenRef(ANNA), seen({ aggiornatoIl: new Date('2020-01-01') })))
  })
})
