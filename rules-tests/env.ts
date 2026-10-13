import { readFileSync } from 'node:fs'
import { initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { Timestamp, serverTimestamp, setDoc, doc } from 'firebase/firestore'

// Aiuti comuni ai test delle regole. Servono l'emulatore Firestore acceso (vedi package.json).
export async function createEnv(): Promise<RulesTestEnvironment> {
  return initializeTestEnvironment({
    projectId: 'frienzy-test',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  })
}

export const ORG = 'organizzatore'
export const ANNA = 'anna'
export const BRUNO = 'bruno'

export const profile = (over: Record<string, unknown> = {}) => ({
  nome: 'Anna',
  dataNascita: Timestamp.fromDate(new Date('1995-05-20')),
  bio: 'Ciao',
  interessi: ['cena'],
  fotoUrl: '',
  creatoIl: Timestamp.now(),
  ...over,
})

// creatoIl = serverTimestamp(): le regole lo confrontano con request.time.
export const eventData = (over: Record<string, unknown> = {}) => ({
  organizzatoreId: ORG,
  tipo: 'cena',
  titolo: 'Cena in terrazza',
  descrizione: '',
  dataOra: Timestamp.fromDate(new Date('2030-01-01T20:00:00Z')),
  zonaNome: 'Navigli',
  latApprossimata: 45.45,
  lngApprossimata: 9.18,
  geohash: 'u0nd9h',
  maxPartecipanti: 6,
  richiedeApprovazione: false,
  stato: 'aperto',
  creatoIl: serverTimestamp(),
  ...over,
})

export const place = { indirizzo: 'Via Roma 1', lat: 45.4512, lng: 9.1823 }

/** Scrive dati di partenza saltando le regole (come farebbe un amministratore). */
export async function seedEvent(env: RulesTestEnvironment, id: string, over: Record<string, unknown> = {}) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore()
    await setDoc(doc(db, 'events', id), { ...eventData(over), creatoIl: Timestamp.now() })
    await setDoc(doc(db, 'events', id, 'privato', 'luogo'), place)
  })
}

export async function seedParticipation(env: RulesTestEnvironment, eventId: string, uid: string, stato: string) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'events', eventId, 'partecipanti', uid), {
      eventId, uid, stato, creatoIl: Timestamp.now(),
    })
  })
}
