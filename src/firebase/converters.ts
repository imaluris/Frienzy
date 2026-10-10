import { Timestamp } from 'firebase/firestore'
import type { ExactPlace, FrienzyEvent, NewEvent } from '../domain/event'
import { isEventTypeId } from '../domain/eventTypes'
import type { Participation } from '../domain/participation'
import type { UserProfile } from '../domain/user'

// Firestore salva le date come Timestamp, il resto dell'app usa Date: si converte solo qui.
type Data = Record<string, unknown>

const toDate = (value: unknown): Date => (value as Timestamp).toDate()

export function userToData(user: UserProfile): Data {
  return {
    nome: user.nome,
    dataNascita: Timestamp.fromDate(user.dataNascita),
    bio: user.bio,
    interessi: user.interessi,
    fotoUrl: user.fotoUrl,
    creatoIl: Timestamp.fromDate(user.creatoIl),
  }
}

export function userFromData(uid: string, d: Data): UserProfile {
  const interessi = (d.interessi as string[]).filter(isEventTypeId)
  return {
    uid,
    nome: d.nome as string,
    dataNascita: toDate(d.dataNascita),
    bio: d.bio as string,
    interessi,
    fotoUrl: d.fotoUrl as string,
    creatoIl: toDate(d.creatoIl),
  }
}

export function newEventToData(event: NewEvent): Data {
  return { ...event, dataOra: Timestamp.fromDate(event.dataOra) }
}

export function eventFromData(id: string, d: Data): FrienzyEvent {
  return {
    id,
    organizzatoreId: d.organizzatoreId as string,
    tipo: d.tipo as FrienzyEvent['tipo'],
    titolo: d.titolo as string,
    descrizione: d.descrizione as string,
    dataOra: toDate(d.dataOra),
    zonaNome: d.zonaNome as string,
    latApprossimata: d.latApprossimata as number,
    lngApprossimata: d.lngApprossimata as number,
    geohash: d.geohash as string,
    maxPartecipanti: d.maxPartecipanti as number,
    richiedeApprovazione: d.richiedeApprovazione as boolean,
    stato: d.stato as FrienzyEvent['stato'],
    creatoIl: toDate(d.creatoIl),
  }
}

export const placeToData = (place: ExactPlace): Data => ({ ...place })

// La partecipazione salva anche uid ed eventId: servono per cercare "le mie iscrizioni"
// su tutti gli eventi con una collectionGroup.
export function participationToData(p: Participation): Data {
  return { eventId: p.eventId, uid: p.uid, stato: p.stato, creatoIl: Timestamp.fromDate(p.creatoIl) }
}

export function participationFromData(d: Data): Participation {
  return {
    eventId: d.eventId as string,
    uid: d.uid as string,
    stato: d.stato as Participation['stato'],
    creatoIl: toDate(d.creatoIl),
  }
}
