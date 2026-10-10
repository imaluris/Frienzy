import { Timestamp } from 'firebase/firestore'
import { readFirebaseConfig } from './config'
import {
  eventFromData,
  newEventToData,
  participationFromData,
  participationToData,
  userFromData,
  userToData,
} from './converters'
import type { NewEvent } from '../domain/event'
import type { UserProfile } from '../domain/user'

const env = {
  VITE_FIREBASE_API_KEY: 'k',
  VITE_FIREBASE_AUTH_DOMAIN: 'd',
  VITE_FIREBASE_PROJECT_ID: 'p',
  VITE_FIREBASE_STORAGE_BUCKET: 'b',
  VITE_FIREBASE_MESSAGING_SENDER_ID: 's',
  VITE_FIREBASE_APP_ID: 'a',
}

describe('readFirebaseConfig', () => {
  it('legge tutti i campi', () => {
    expect(readFirebaseConfig(env).projectId).toBe('p')
  })

  it('nomina le variabili mancanti', () => {
    expect(() => readFirebaseConfig({ ...env, VITE_FIREBASE_APP_ID: undefined })).toThrow(/VITE_FIREBASE_APP_ID/)
  })
})

describe('converters', () => {
  const date = new Date('2026-11-01T18:00:00Z')

  it('profilo: andata e ritorno', () => {
    const user: UserProfile = {
      uid: 'u1', nome: 'Ada', dataNascita: new Date('1990-05-05'), bio: 'ciao',
      interessi: ['cena', 'sport'], fotoUrl: '', creatoIl: date,
    }
    const data = userToData(user)
    expect(data.dataNascita).toBeInstanceOf(Timestamp)
    expect(userFromData('u1', data)).toEqual(user)
  })

  it('profilo: scarta interessi sconosciuti', () => {
    const data = { ...userToData({ uid: 'u', nome: 'A', dataNascita: date, bio: '', interessi: [], fotoUrl: '', creatoIl: date }), interessi: ['cena', 'karaoke'] }
    expect(userFromData('u', data).interessi).toEqual(['cena'])
  })

  it('evento: la data diventa Timestamp e torna Date', () => {
    const ev: NewEvent = {
      organizzatoreId: 'u1', tipo: 'cena', titolo: 'T', descrizione: 'D', dataOra: date, zonaNome: 'Centro',
      latApprossimata: 45.4, lngApprossimata: 9.1, geohash: 'u0nd', maxPartecipanti: 6, richiedeApprovazione: false,
    }
    const data = { ...newEventToData(ev), stato: 'aperto', creatoIl: Timestamp.fromDate(date) }
    expect(eventFromData('e1', data)).toEqual({ ...ev, id: 'e1', stato: 'aperto', creatoIl: date })
  })

  it('partecipazione: andata e ritorno', () => {
    const p = { eventId: 'e1', uid: 'u1', stato: 'richiesta' as const, creatoIl: date }
    expect(participationFromData(participationToData(p))).toEqual(p)
  })
})
